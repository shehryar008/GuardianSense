# Hospital Backend Integration — Agent Instructions

> **Scope: Hospital module ONLY.** Do not touch Police, Admin, Auth, or any unrelated module.

---

## ⚠️ CRITICAL: Schema Verification — Do This First

Before writing any code, verify the actual Supabase schema matches what is documented below.
Run this query and confirm every column exists with the correct name and type:

```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('hospitals', 'incidents', 'incident_dispatch')
ORDER BY table_name, ordinal_position;
```

### Confirmed Schema (verified against Supabase)

**`hospitals`**
| Column | Type |
|---|---|
| hospital_id | integer (PK) |
| hospital_name | varchar |
| address | text |
| city | varchar |
| phone | varchar |
| email | varchar |
| bed_capacity | integer |
| is_active | boolean |
| password_hash | varchar |

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
| incident_id | integer (FK) |
| responder_type | varchar — `'Hospital'` or `'Police'` |
| hospital_id | integer (nullable) |
| station_id | integer (nullable) |
| dispatch_status | varchar — `'Pending'`, `'En Route'`, `'Resolved'` |
| dispatched_at | timestamptz |

> When inserting: always set `responder_type = 'Hospital'`, `hospital_id = <id>`, `station_id = NULL`.

**If any field used in the backend or frontend is missing from the schema above — STOP and report it before proceeding.**

---

## Required Backend File Structure

```
src/
├── config/
│   └── env.js
└── modules/
    └── hospital/
        ├── hospital.routes.js
        ├── hospital.controller.js
        ├── hospital.service.js
        ├── hospital.repository.js
        ├── hospital.validator.js
        └── hospital.test.js
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
Frontend must use `VITE_API_BASE_URL` and `VITE_AUTH_TOKEN_KEY` — never hardcode URLs or keys.

---

## API Endpoints (all 10 required)

| Method | Route | Description |
|---|---|---|
| GET | `/api/hospitals` | List all active hospitals |
| GET | `/api/hospitals/:id` | Get hospital by ID |
| POST | `/api/hospitals` | Register hospital |
| PUT | `/api/hospitals/:id` | Update hospital |
| PATCH | `/api/hospitals/:id/status` | Toggle is_active |
| DELETE | `/api/hospitals/:id` | Soft delete (is_active = false) |
| POST | `/api/hospitals/dispatch` | Dispatch hospital to incident |
| GET | `/api/hospitals/dispatch/:incident_id` | Get dispatch for incident |
| PATCH | `/api/hospitals/dispatch/:dispatch_id/status` | Update dispatch status |
| GET | `/api/hospitals/:hospital_id/dispatches` | All dispatches for hospital |

---

## Dispatch Business Logic

**Creating a dispatch:**
1. Verify incident exists and `is_active = true`
2. Verify hospital exists and `is_active = true`
3. Reject duplicate Hospital dispatch for same incident → `409`
4. Insert with `responder_type = 'Hospital'`, `station_id = NULL`

**Updating dispatch status:**
- Only allow: `Pending → En Route → Resolved`
- On `Resolved`: set `incidents.is_active = false` (**no `resolved_at` — column does not exist**)
- Any backward/invalid transition → `422 Unprocessable Entity`

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

## Frontend Fixes Required

Check and fix every Hospital-related frontend file for:

- API base URL read from `import.meta.env.VITE_API_BASE_URL` (never hardcoded)
- `Content-Type: application/json` on all POST/PUT/PATCH
- Auth token attached via `localStorage.getItem(import.meta.env.VITE_AUTH_TOKEN_KEY)`
- Response read as `response.data`, guarded against null/undefined
- `success: false` shows visible error message to user
- Loading state shown during calls, reset in `finally`
- Data re-fetched after every successful mutation
- `401` response redirects to login

---

## Known Bugs to Fix (Active Incidents Page)

These specific bugs were found in `ActiveIncidentsPage` and **must** be fixed.

### Bug 1 — Hardcoded Fallback URL 🔴
Remove `|| "http://localhost:5001"`. Replace with:
```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL
if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set")
```

### Bug 2 — Missing Backend Endpoint 🔴
The frontend calls `GET /api/hospitals/incidents/active` which is **not in the required API spec**.
Add this endpoint to the backend:
- Returns all incidents where `is_active = true`
- Requires auth token
- Returns `{ success: true, data: Incident[] }`

### Bug 3 — Status Update Checks `.ok` Instead of `data.success`
Parse the response body and check `data.success` instead of just `.ok`:
```ts
const d1 = await p1.json()
if (!d1.success) throw new Error(d1.message || "Failed to update to En Route")
const d2 = await p2.json()
if (!d2.success) throw new Error(d2.message || "Failed to resolve")
```

### Bug 4 — `dispatch.incidents` Always `undefined` Without JOIN
`GET /api/hospitals/:hospital_id/dispatches` must JOIN `incidents` so location data is returned.
The repository query must be:
```sql
SELECT d.*, i.latitude, i.longitude, i.detected_at, i.is_active
FROM incident_dispatch d
JOIN incidents i ON i.incident_id = d.incident_id
WHERE d.hospital_id = $1
```
Without this JOIN, every dispatch card shows **"Unknown Location"**.

### Bug 5 — Auth Token Key May Be Hardcoded in `auth-provider`
Verify the localStorage key in `auth-provider` comes from an env variable, not hardcoded as `"token"` or `"authToken"`. Both login (write) and every API call (read) must use the same env variable key.

### Bug 6 — No `401` Redirect to Login
After every fetch call, check for `401` and redirect:
```ts
if (res.status === 401) { router.push("/login"); return }
```

---

## Known Bugs to Fix (Backend — hospital.routes.js, hospital.repository.js, hospital.controller.js)

### Bug B1 — Route Order: `GET /:id` Shadows `GET /:hospital_id/dispatches` 🔴
**File:** `hospital.routes.js`
`GET /:id` is registered before `GET /:hospital_id/dispatches`, so `/123/dispatches` is caught by `/:id` and the dispatches route never fires. Move dispatches route above `GET /:id`:
```js
router.get('/:hospital_id/dispatches', validator.validateHospitalIdParam, controller.getDispatchesByHospital);
router.get('/:id', validator.validateHospitalId, controller.getHospitalById); // must come after
```

### Bug B2 — `req.params.id` Passed as String, Not Integer 🔴
**File:** `hospital.controller.js`
`req.params` values are always strings. Pass them as integers to the service:
```js
await service.getHospitalById(parseInt(req.params.id, 10))
await service.updateHospital(parseInt(req.params.id, 10), req.body)
await service.toggleHospitalStatus(parseInt(req.params.id, 10))
await service.deleteHospital(parseInt(req.params.id, 10))
await service.getDispatchesByHospital(parseInt(req.params.hospital_id, 10))
```

### Bug B3 — `create()` Accepts Unused `password` Parameter 🟡
**File:** `hospital.repository.js`
The `create()` function destructures a `password` param that is never sent by the frontend or validated. Remove it and hardcode `'temp_password'` directly:
```js
const create = async ({ hospital_name, address, city, phone, email, bed_capacity }) => {
  // ... insert with password_hash: 'temp_password'
}
```

---

## Known Bugs to Fix (Frontend Components)

### Bug F1 — Hardcoded localStorage Keys in `auth-provider.tsx` 🔴
All 6 localStorage calls use hardcoded string keys `"token"` and `"hospital"`. Both must come from env variables:
```ts
const TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY!
const HOSPITAL_KEY = process.env.NEXT_PUBLIC_HOSPITAL_KEY!
// Replace all: localStorage.getItem("token") → localStorage.getItem(TOKEN_KEY)
// Replace all: localStorage.setItem("token", ...) → localStorage.setItem(TOKEN_KEY, ...)
// Same for "hospital" → HOSPITAL_KEY
```

### Bug F2 — Hardcoded Fallback URLs in 3 Files 🔴
**Files:** `header.tsx` (line 7), `hospital-login-form.tsx` (line 11), `sidebar.tsx` (lines 24–27, twice inline)
All use `|| "http://localhost:5001"`. Remove every fallback:
```ts
// ❌ const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
// ✅ const API_URL = process.env.NEXT_PUBLIC_API_URL
//    if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set")
```

### Bug F3 — No `401` Redirect in `page.tsx`, `header.tsx`, `sidebar.tsx` 🔴
None of these files check for `401` responses. After every fetch, add:
```ts
if (res.status === 401) { router.push("/login"); return }
```

### Bug F4 — `handleResolve` Checks `.ok` Instead of `data.success` in `page.tsx` 🔴
Already documented as Bug 3 above — applies specifically to `page.tsx` `handleResolve` function.

### Bug F5 — Silent `catch` Block in `sidebar.tsx` 🟡
```ts
} catch (e) {}  // swallows all errors silently
```
At minimum log the error in dev and handle `401` explicitly.

### Bug F6 — `hospital_id` Can Be `undefined` in `header.tsx` Dispatch Body 🟡
`hospital?.hospital_id` can be `undefined` if session is lost. Add guard before the fetch:
```ts
if (!hospital?.hospital_id) {
  setError("Hospital session not found. Please log in again.")
  return
}
```

### Bug F7 — No Guard for Missing `session` Object in `hospital-login-form.tsx` 🟡
```ts
// ❌ Crashes if data.data.session is undefined
login(data.data.session.access_token, ...)

// ✅ Fix
if (!data.data?.session?.access_token) {
  setError("Login failed: invalid server response")
  return
}
```

### Bug F8 — `Status` Type in `active-incident-card.tsx` Includes Dead Values 🟡
`"In Progress"` and `"Dispatched"` are in the `Status` type but the backend never sends them. Tighten to match backend reality:
```ts
type Status = "Pending" | "En Route" | "Resolved"
```

### Bug F9 — `dispatchesData.data` Accessed Without Null Check in `page.tsx` 🟡
Inside `if (incidentsData.success)`, `dispatchesData.data` is used without checking `dispatchesData.success` first — causes crash if dispatches call failed:
```ts
const dispatchedIncidentIds = new Set(
  (dispatchesData.success ? (dispatchesData.data as Dispatch[]) : []).map((d) => d.incident_id)
)
```


---

## Known Bugs to Fix (Page-Level Frontend Files)

### Bug P1 — Hardcoded Fallback URLs in 6 Page Files 🔴
Every page that makes API calls uses `|| "http://localhost:5001"`. Remove the fallback from ALL of these files:
- `settings/page.tsx` (inside `handleChangePassword` function)
- `active-incidents/page.tsx` (line 9)
- `ambulance-fleet/page.tsx` (line 9)
- `dashboard/page.tsx` (line 10)
- `register/page.tsx` (line 9)
- `incident-history/page.tsx` (line 7)

Replace every occurrence with:
```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL
if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set")
```

### Bug P2 — `handleResolve` in `dashboard/page.tsx` Checks `.ok` Instead of `data.success` 🔴
Same as Bug F4 — also present in the dashboard page:
```ts
// ❌
if (!p1.ok) throw new Error("Failed to update status to En Route")
if (!p2.ok) throw new Error("Failed to update status to Resolved")

// ✅ Fix
const d1 = await p1.json()
if (!d1.success) throw new Error(d1.message || "Failed to update to En Route")
const d2 = await p2.json()
if (!d2.success) throw new Error(d2.message || "Failed to resolve")
```

### Bug P3 — No `401` Redirect in `settings`, `dashboard`, `ambulance-fleet`, `incident-history` 🔴
None of these pages redirect to login on `401`. All fetch calls need:
```ts
if (res.status === 401) { router.push("/login"); return }
```
`settings/page.tsx` does not import `useRouter` at all — it must be added before this fix can be applied.

### Bug P4 — `register/page.tsx` Sends `password` But Backend Always Stores `'temp_password'` 🔴
The registration form sends `password: form.password` to `POST /api/hospitals`, but `hospital.repository.js` `create()` ignores the `password` field and always stores `password_hash = 'temp_password'`. This means:
1. The hospital record has `password_hash = 'temp_password'`
2. Step 2 calls `POST /api/auth/register` with the real password
3. Supabase auth has the real password; the hospitals table has `'temp_password'`
4. Login via `hospital.email` will use Supabase auth (works), but `change-password` endpoint that reads `hospitals.password_hash` will break

**Fix required in both files:**
- `hospital.repository.js` `create()`: accept and hash the password before storing
- `register/page.tsx`: ensure the password is correctly passed through

### Bug P5 — `register/page.tsx` No Rollback If Step 2 Fails After Step 1 Succeeds 🔴
If hospital record is created (Step 1 succeeds) but Supabase auth registration fails (Step 2 fails), the hospital row exists in the DB with no auth account. The user cannot log in and cannot re-register (duplicate email). There is no cleanup call.
**Fix:** Either use a backend transaction endpoint that does both steps atomically, or add a DELETE call to remove the hospital record if Step 2 fails.

### Bug P6 — `ambulance-fleet/page.tsx` Silent `catch` — No Error Shown to User 🟡
```ts
} catch {
  setFleet([])  // user sees empty fleet with no explanation
}
```
Add an error state and display a message:
```ts
} catch {
  setFleet([])
  setError("Failed to load fleet data. Please try again.")
}
```

### Bug P7 — `dashboard/page.tsx` No Loading State on `handleResolve` 🟡
The Resolve button in the dashboard has no `isResolving` state — it stays clickable during the API call. Double-clicking can submit duplicate status update requests, potentially causing a `422` invalid transition error. Add an `isResolving` flag and disable the button while the call is in progress.

### Bug P8 — `register/page.tsx` `password` Field Not in Backend Validator 🟡
`validateCreateHospital` in `hospital.validator.js` does not validate the `password` field. It is silently passed through and ignored. The validator must either include `password` validation (if the backend starts using it after Bug P4 is fixed), or the frontend should stop sending it until the backend supports it.

### Bug P9 — `settings/page.tsx` Dark Mode Toggle Is Non-Functional 🟡
The `darkMode` state toggles correctly in React but never applies a CSS class to `<html>` or `<body>`. The toggle does nothing visible.
**Fix:** Apply the dark class on toggle:
```ts
onChange={() => {
  setDarkMode(!darkMode)
  document.documentElement.classList.toggle("dark", !darkMode)
}}
```

### Bug P10 — `profile/page.tsx` Static Fake Data Presented as Real Hospital Information 🟡
The following values are hardcoded and fabricated — they are not from the database:
- Establishment date: `"January 15, 1985"` (hardcoded)
- Certifications: Joint Commission, Level 1 Trauma, Stroke Center, Cardiac Care (all fake)
- Staff count: calculated as `beds * 2` (made up formula)
- Department names and staff counts (all hardcoded)

These are displayed as factual hospital data. Either remove them or clearly mark them as placeholder/demo data.

---

## Out of Scope — Do Not Touch

- `src/modules/police/` — hands off
- `src/modules/admin/` — hands off
- `src/modules/auth/` — do not modify
- Any frontend page unrelated to Hospital
- Database schema — no ALTER TABLE, no migrations

---

## Definition of Done

- [ ] Schema verified — no missing or mismatched columns
- [ ] All 10 endpoints implemented, no stubs
- [ ] `resolved_at` never referenced anywhere (column does not exist)
- [ ] Dispatch logic enforces one-way status transitions
- [ ] All responses use standard `{ success, message, data }` shape
- [ ] Frontend reads all config from env vars — zero hardcoded values
- [ ] Loading, error, and success UI states all work correctly
- [ ] All tests pass
- [ ] Zero browser console errors on Hospital pages
- [ ] `GET /api/hospitals/incidents/active` added to backend
- [ ] `GET /api/hospitals/:hospital_id/dispatches` JOINs `incidents` table
- [ ] Status update responses checked via `data.success`, not just `.ok`
- [ ] Zero hardcoded fallback URLs — no `|| "http://localhost:..."` anywhere
- [ ] Auth token key sourced from env variable in `auth-provider` (read and write)
- [ ] All fetch calls handle `401` with redirect to login
- [ ] `GET /:hospital_id/dispatches` route registered BEFORE `GET /:id` in routes.js
- [ ] All `req.params.id` values parsed with `parseInt()` in controller
- [ ] `create()` in repository does not accept or destructure `password` param
- [ ] `auth-provider.tsx` localStorage keys read from env variables — not hardcoded strings
- [ ] No `|| "http://localhost:..."` fallback in header.tsx, hospital-login-form.tsx, sidebar.tsx
- [ ] `sidebar.tsx` catch block handles errors and 401, not silently swallowed
- [ ] `header.tsx` guards against undefined `hospital_id` before dispatch fetch
- [ ] `hospital-login-form.tsx` guards against missing `data.data.session` before calling login()
- [ ] `active-incident-card.tsx` Status type only includes: Pending, En Route, Resolved
- [ ] `page.tsx` checks `dispatchesData.success` before accessing `dispatchesData.data`
- [ ] Hardcoded fallback URLs removed from all 6 page files (settings, active-incidents, ambulance-fleet, dashboard, register, incident-history)
- [ ] `dashboard/page.tsx` handleResolve checks `data.success`, not `.ok`
- [ ] `settings`, `dashboard`, `ambulance-fleet`, `incident-history` all handle `401` with redirect; `settings/page.tsx` imports `useRouter`
- [ ] Registration password flow fixed — backend stores actual password hash, not `'temp_password'`
- [ ] Registration Step 2 failure rolls back Step 1 hospital record
- [ ] `ambulance-fleet/page.tsx` catch block shows error to user
- [ ] `dashboard/page.tsx` Resolve button disabled while resolving (isResolving state)
- [ ] `register/page.tsx` password field validated by backend validator
- [ ] `settings/page.tsx` dark mode toggle applies `dark` class to `<html>`
- [ ] `profile/page.tsx` fake/static data is removed or clearly marked as placeholder