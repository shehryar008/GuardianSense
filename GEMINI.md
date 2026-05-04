# Police Station Backend Integration — Agent Instructions

> **Scope: Police module ONLY.** Do not touch Hospital, Admin, Auth, or any unrelated module.

---

## ⚠️ CRITICAL: Schema Verification — Do This First

Before writing any code, verify the actual Supabase schema matches what is documented below.
Run this query and confirm every column exists with the correct name and type:

```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('police_stations', 'incidents', 'incident_dispatch')
ORDER BY table_name, ordinal_position;
```

### Confirmed Schema (verified against Supabase)

**`police_stations`**
| Column | Type |
|---|---|
| station_id | integer (PK) |
| station_name | varchar |
| address | text |
| city | varchar |
| phone | varchar |
| email | varchar |
| is_active | boolean |
| password_hash | varchar |

> ⚠️ `police_stations` has NO `bed_capacity` or `hospital_id` column. Do NOT reference either.

**`incidents`** (READ ONLY)
| Column | Type |
|---|---|
| incident_id | integer (PK) |
| user_id | uuid |
| latitude | double precision |
| longitude | double precision |
| is_active | boolean |
| detected_at | timestamptz |

> ⚠️ `incidents` has NO `resolved_at` column. Do NOT reference it anywhere.
> To resolve: set `is_active = false` only.

**`incident_dispatch`**
| Column | Type |
|---|---|
| dispatch_id | integer (PK) |
| incident_id | integer (FK → incidents) |
| responder_type | varchar — `'Hospital'` or `'Police'` |
| hospital_id | integer (nullable) |
| station_id | integer (nullable) |
| dispatch_status | varchar — `'Pending'`, `'En Route'`, `'Resolved'` |
| dispatched_at | timestamptz |

> When inserting for Police: always set `responder_type = 'Police'`, `station_id = <id>`, `hospital_id = NULL`.

**If any field used in the backend or frontend is missing from the schema above — STOP and report it before proceeding.**

---

## Required Backend File Structure

```
src/
├── config/
│   └── env.js
└── modules/
    └── police/
        ├── police.routes.js
        ├── police.controller.js
        ├── police.service.js
        ├── police.repository.js
        ├── police.validator.js
        └── police.test.js
```

---

## Environment Variables

```env
PORT=
NODE_ENV=
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
FRONTEND_URL=
```

`src/config/env.js` must validate all required vars at startup and call `process.exit(1)` if any are missing.
Frontend must use `VITE_API_BASE_URL` (or `NEXT_PUBLIC_API_URL`) and `VITE_AUTH_TOKEN_KEY` (or `NEXT_PUBLIC_AUTH_TOKEN_KEY`) — never hardcode URLs or keys.

---

## API Endpoints (all 10 required)

| Method | Route | Description |
|---|---|---|
| GET | `/api/police` | List all active police stations |
| GET | `/api/police/:id` | Get station by ID |
| POST | `/api/police` | Register police station |
| PUT | `/api/police/:id` | Update station details |
| PATCH | `/api/police/:id/status` | Toggle is_active |
| DELETE | `/api/police/:id` | Soft delete (is_active = false) |
| POST | `/api/police/dispatch` | Dispatch station to incident |
| GET | `/api/police/dispatch/:incident_id` | Get dispatch for incident |
| PATCH | `/api/police/dispatch/:dispatch_id/status` | Update dispatch status |
| GET | `/api/police/:station_id/dispatches` | All dispatches for station |

> **Bonus endpoint (required for Active Incidents page):**
> `GET /api/police/incidents/active` — Returns all incidents where `is_active = true`. Requires auth token.

---

## Dispatch Business Logic

**Creating a dispatch:**
1. Verify incident exists and `is_active = true`
2. Verify police station exists and `is_active = true`
3. Reject duplicate Police dispatch for the same incident → `409 Conflict`
4. Insert with `responder_type = 'Police'`, `hospital_id = NULL`, `station_id = <id>`

**Updating dispatch status:**
- Only allow: `Pending → En Route → Resolved`
- On `Resolved`: set `incidents.is_active = false` (**no `resolved_at` — column does not exist**)
- Any backward or invalid transition → `422 Unprocessable Entity`

**Valid transitions map (enforce in service layer):**
```js
const VALID_TRANSITIONS = {
  'Pending':  'En Route',
  'En Route': 'Resolved',
};
// If VALID_TRANSITIONS[currentStatus] !== newStatus → reject with 422
```

---

## Response Format

```js
// Success
{ "success": true, "message": "...", "data": { ... } }

// Error
{ "success": false, "message": "Human-readable reason", "error": "Technical detail" }
```

| Scenario | Status |
|---|---|
| Not found | 404 |
| Duplicate dispatch | 409 |
| Validation failure | 400 |
| Invalid status transition | 422 |
| Server error | 500 |

---

## Safe Column Selection

Never return `password_hash` in any API response.

Define a constant in the repository:
```js
const SAFE_STATION_COLUMNS = [
  'station_id', 'station_name', 'address', 'city',
  'phone', 'email', 'is_active'
];
```
Use this in all SELECT queries for `police_stations`.

---

## Repository Patterns (Supabase JS Client)

### Get all active stations
```js
const { data, error } = await supabase
  .from('police_stations')
  .select(SAFE_STATION_COLUMNS.join(', '))
  .eq('is_active', true);
```

### Get dispatches for a station (JOIN incidents)
```js
const { data, error } = await supabase
  .from('incident_dispatch')
  .select(`
    *,
    incidents (
      incident_id,
      latitude,
      longitude,
      detected_at,
      is_active
    )
  `)
  .eq('station_id', stationId)
  .eq('responder_type', 'Police');
```
> Without this JOIN, every dispatch card will show **"Unknown Location"**. Always include it.

### Create dispatch
```js
const { data, error } = await supabase
  .from('incident_dispatch')
  .insert({
    incident_id: incidentId,
    responder_type: 'Police',
    station_id: stationId,
    hospital_id: null,
    dispatch_status: 'Pending',
    dispatched_at: new Date().toISOString(),
  })
  .select()
  .single();
```

### Resolve incident (no resolved_at column)
```js
// When dispatch status becomes 'Resolved':
const { error } = await supabase
  .from('incidents')
  .update({ is_active: false })
  .eq('incident_id', incidentId);
// DO NOT reference resolved_at — column does not exist
```

---

## Known Bugs to Pre-empt (Implement Correctly From the Start)

These are the same class of bugs found in the hospital module. Do not repeat them.

### Route Order: `GET /:id` Must NOT Shadow `GET /:station_id/dispatches` 🔴
Register the dispatches route BEFORE the generic `/:id` route:
```js
router.get('/incidents/active',   authMiddleware, controller.getActiveIncidents);
router.get('/:station_id/dispatches', validate.stationIdParam, controller.getDispatchesByStation);
router.get('/:id',                validate.stationId,      controller.getStationById); // must be last
```
If `/:id` is registered first, Express will catch `/123/dispatches` as `id = "123"` and the dispatches route will never fire.

### Parse All `req.params` as Integers 🔴
`req.params` values are always strings. Pass them as integers to the service:
```js
parseInt(req.params.id, 10)
parseInt(req.params.station_id, 10)
parseInt(req.params.incident_id, 10)
parseInt(req.params.dispatch_id, 10)
```

### `create()` Must Not Accept or Silently Ignore `password` 🟡
The `police_stations` table stores `password_hash = 'temp_password'` by default. The frontend sends a `password` field for Supabase Auth (step 2). The repository `create()` function must NOT destructure or store the raw `password` field:
```js
const create = async ({ station_name, address, city, phone, email }) => {
  // password_hash defaults to 'temp_password' in the DB schema
  // actual password is handled by Supabase Auth in step 2
};
```

### `password_hash` Must Never Be Returned in Responses 🔴
All `SELECT` queries on `police_stations` must exclude `password_hash`. Use `SAFE_STATION_COLUMNS`.

### Duplicate Dispatch Check Must Filter by `responder_type = 'Police'` 🔴
The `incident_dispatch` table is shared between Hospital and Police. When checking for duplicates, always scope the check to `responder_type = 'Police'`:
```js
const { data } = await supabase
  .from('incident_dispatch')
  .select('dispatch_id')
  .eq('incident_id', incidentId)
  .eq('responder_type', 'Police')
  .single();
if (data) throw { status: 409, message: 'Police already dispatched to this incident' };
```

---

## Frontend Integration Requirements

### Environment Variables (never hardcode)
```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL
if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set")

const TOKEN_KEY  = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY!
const STATION_KEY = process.env.NEXT_PUBLIC_STATION_KEY!
```

### Auth Token on Every Protected Request
```ts
const token = localStorage.getItem(TOKEN_KEY)
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
}
```

### 401 Redirect on Every Fetch
```ts
if (res.status === 401) { router.push("/login"); return }
```

### Check `data.success`, Not Just `res.ok`
```ts
// ❌ Wrong
if (!res.ok) throw new Error("Failed")

// ✅ Correct
const data = await res.json()
if (!data.success) throw new Error(data.message || "Request failed")
```

### Status Update Requires Two Sequential Calls if Current Status is `Pending`
The backend enforces strict one-step transitions. To go from `Pending → Resolved`, two calls are required:
1. `PATCH /dispatch/:id/status` with `{ dispatch_status: 'En Route' }`
2. `PATCH /dispatch/:id/status` with `{ dispatch_status: 'Resolved' }`

Each must be awaited and its `data.success` verified before proceeding.

### Loading / Error / Success States
- Every mutating action (dispatch, resolve, status update) must set `isLoading` / `isResolving` state
- Disable submit/action buttons while `isLoading === true`
- Reset state in `finally` block
- Display `success: false` responses as visible error messages (never silent)
- Re-fetch data after every successful mutation

---

## Auth Provider Requirements

- `auth-provider.tsx` must read and write localStorage using env variable keys — never hardcoded strings like `"token"` or `"station"`
- Both login (write) and all API calls (read) must use the same env variable key
- On initial load, read session from localStorage
- Guard all protected routes: if no token and route is not `/login` or `/register`, redirect to `/login`

---

## Registration Flow (2-Step)

```
Step 1: POST /api/police         → creates police_stations DB record
Step 2: POST /api/auth/register  → creates Supabase Auth account with real password
```

**Rollback rule:** If Step 2 fails after Step 1 succeeds, send `DELETE /api/police/:id` immediately to remove the orphaned station record. Without rollback, the email becomes permanently locked — user cannot log in and cannot re-register.

**Password handling:**
- Step 1: Backend ignores the `password` field; DB stores `password_hash = 'temp_password'` by default
- Step 2: Real password is registered with Supabase Auth
- Login uses Supabase Auth (works); `change-password` endpoint must use Supabase Admin API (not `password_hash` in DB)

---

## Validator Requirements (`police.validator.js`)

Use `express-validator`. Validate all fields before they reach the controller.

### `validateCreateStation`
| Field | Rule |
|---|---|
| `station_name` | required, string, non-empty |
| `address` | required, string, non-empty |
| `city` | required, string, non-empty |
| `phone` | required, string, matches phone pattern |
| `email` | required, valid email format |

### `validateUpdateStation`
Same fields as create, all optional (PATCH semantics).

### `validateDispatch`
| Field | Rule |
|---|---|
| `incident_id` | required, integer, > 0 |
| `station_id` | required, integer, > 0 |

### `validateStatusUpdate`
| Field | Rule |
|---|---|
| `dispatch_status` | required, one of: `'En Route'`, `'Resolved'` |

### `validateStationIdParam` / `validateIncidentIdParam` / `validateDispatchIdParam`
All route params must be validated as positive integers.

---

## Test File Requirements (`police.test.js`)

Cover at minimum:

| Test | Expected |
|---|---|
| `GET /api/police` | 200, returns array |
| `POST /api/police` with valid data | 201, station created |
| `POST /api/police` with missing fields | 400 |
| `GET /api/police/:id` with valid ID | 200, station returned |
| `GET /api/police/:id` with invalid ID | 404 |
| `POST /api/police/dispatch` valid | 201, dispatch created |
| `POST /api/police/dispatch` duplicate | 409 |
| `POST /api/police/dispatch` inactive incident | 400/404 |
| `PATCH /dispatch/:id/status` valid transition | 200 |
| `PATCH /dispatch/:id/status` invalid transition | 422 |
| `GET /api/police/incidents/active` | 200, active incidents only |
| `GET /api/police/:station_id/dispatches` | 200, includes lat/lng from JOIN |

---

## Out of Scope — Do Not Touch

- `src/modules/hospital/` — hands off
- `src/modules/admin/` — hands off
- `src/modules/auth/` — do not modify
- Any frontend page unrelated to Police
- Database schema — no ALTER TABLE, no migrations
- `responder_type = 'Hospital'` records — never modify or return them from police endpoints

---

## Definition of Done

- [ ] Schema verified — no missing or mismatched columns
- [ ] All 10 endpoints implemented, no stubs
- [ ] `GET /api/police/incidents/active` endpoint added
- [ ] `resolved_at` never referenced anywhere (column does not exist)
- [ ] Dispatch logic enforces `responder_type = 'Police'` on insert and duplicate check
- [ ] Dispatch logic enforces one-way status transitions via `VALID_TRANSITIONS` map
- [ ] `Pending → Resolved` direct jump rejected with `422`
- [ ] All responses use standard `{ success, message, data }` shape
- [ ] `password_hash` excluded from all API responses via `SAFE_STATION_COLUMNS`
- [ ] `GET /api/police/:station_id/dispatches` JOINs `incidents` table — `latitude`, `longitude`, `detected_at`, `is_active` included
- [ ] `GET /:station_id/dispatches` route registered BEFORE `GET /:id` in routes file
- [ ] `GET /incidents/active` route registered BEFORE `GET /:id` in routes file
- [ ] All `req.params` values parsed with `parseInt()` in controller
- [ ] `create()` in repository does not accept or store raw `password`
- [ ] `hospital_id` is always `NULL` on police dispatch inserts
- [ ] Frontend reads all config from env vars — zero hardcoded values
- [ ] No `|| "http://localhost:..."` fallback URLs anywhere in frontend
- [ ] Auth token key sourced from env variable in `auth-provider` (read and write)
- [ ] All fetch calls check `data.success`, not just `res.ok`
- [ ] All fetch calls handle `401` with redirect to login
- [ ] Loading / isResolving states implemented — action buttons disabled during calls
- [ ] Data re-fetched after every successful mutation
- [ ] `success: false` shows visible error message to user
- [ ] Registration Step 2 failure rolls back Step 1 station record via DELETE
- [ ] All test cases in `police.test.js` pass
- [ ] Zero browser console errors on Police pages