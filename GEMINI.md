# 🏥 Hospital Backend + Frontend Integration — Agent Task Instructions

> **Agent:** You are responsible for two things:
> 1. **Complete the Hospital backend** from scratch following the structure below
> 2. **Find and fix every frontend error** that surfaces when connecting to the Hospital backend
>
> **Scope is strictly limited to Hospital.** Do not touch Police, Admin, or any unrelated modules.
> Read every section carefully before writing a single line of code.

---

## 🔴 Critical Rules (Non-Negotiable)

| Rule | Detail |
|------|--------|
| ✅ **DO** | Build and complete all Hospital-related backend endpoints |
| ✅ **DO** | Actively find and fix ALL frontend errors related to Hospital — components, API calls, routing, state |
| ✅ **DO** | Link Hospital backend to the already-completed frontend, end-to-end |
| ✅ **DO** | Follow the exact backend file structure defined below |
| ✅ **DO** | Read all configuration values (URLs, ports, secrets) from environment variables |
| ❌ **DO NOT** | Touch `Police_Stations`, `Admins`, or any police/admin routes or frontend pages |
| ❌ **DO NOT** | Fix frontend bugs unrelated to Hospital or the backend connection |
| ❌ **DO NOT** | Modify any table schema |
| ❌ **DO NOT** | Create backend files outside the Hospital module folder |
| ❌ **DO NOT** | Leave any endpoint incomplete, untested, or throwing unhandled errors |
| ❌ **DO NOT** | Hardcode any URL, port, credential, or environment-specific value |

---

## ⚙️ Environment Variables

All configuration **must** come from environment variables. Create a `.env` file at the project root (never commit it) and reference every value through `process.env`.

### Required `.env` Keys

```env
# ── Server ────────────────────────────────────────────────
PORT=                        # e.g. 5000
NODE_ENV=                    # development | production

# ── Database (Supabase / PostgreSQL) ──────────────────────
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
DATABASE_URL=                # Full connection string (alternative to individual keys)

# ── Auth ──────────────────────────────────────────────────
JWT_SECRET=
JWT_EXPIRES_IN=              # e.g. 7d

# ── CORS ──────────────────────────────────────────────────
FRONTEND_URL=                # e.g. http://localhost:5173
```

> ⚠️ **If any required variable is missing at startup, the server must log a clear error and exit.**

### Startup Validation (add to `src/config/env.js`)

```js
// src/config/env.js
const REQUIRED_VARS = [
  'PORT',
  'DATABASE_URL',   // or DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
  'JWT_SECRET',
  'FRONTEND_URL',
];

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`[Config] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

module.exports = {
  port:        process.env.PORT,
  nodeEnv:     process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret:   process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL,
};
```

Import `src/config/env.js` at the very top of `server.js` so validation runs before anything else.

---

## 🗄️ Relevant Database Tables

You will work **only** with these tables. Column names come from Supabase — verify them in Phase 0 before writing any code.

### `hospitals`
```sql
CREATE TABLE hospitals (
    hospital_id   SERIAL PRIMARY KEY,
    hospital_name VARCHAR(150) NOT NULL,
    address       TEXT NOT NULL,
    city          VARCHAR(100) NOT NULL,
    phone         VARCHAR(20) NOT NULL,
    email         VARCHAR(100) NOT NULL,
    bed_capacity  INT NOT NULL,
    is_active     BOOLEAN DEFAULT TRUE,
    password_hash VARCHAR(255) NOT NULL DEFAULT 'temp_password'
);
```

### `incidents` (READ ONLY — do not modify schema)
```sql
CREATE TABLE incidents (
    incident_id  SERIAL PRIMARY KEY,
    user_id      INT NOT NULL,
    latitude     DECIMAL(10, 8) NOT NULL,
    longitude    DECIMAL(11, 8) NOT NULL,
    is_active    BOOLEAN DEFAULT TRUE,
    detected_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at  TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### `incident_dispatch` (Hospital rows only)
```sql
-- Handle only rows where responder_type = 'Hospital'
-- hospital_id must NOT be NULL; station_id must be NULL
CREATE TABLE incident_dispatch (
    dispatch_id     SERIAL PRIMARY KEY,
    incident_id     INT NOT NULL,
    responder_type  VARCHAR(20) NOT NULL CHECK (responder_type IN ('Hospital', 'Police')),
    hospital_id     INT NULL,
    station_id      INT NULL,
    dispatch_status VARCHAR(20) DEFAULT 'Pending' CHECK (dispatch_status IN ('Pending', 'En Route', 'Resolved')),
    dispatched_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(incident_id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id),
    FOREIGN KEY (station_id)  REFERENCES police_stations(station_id)
);
```

> ⚠️ When inserting into `incident_dispatch`, always set:
> - `responder_type = 'Hospital'`
> - `hospital_id = <valid id>`
> - `station_id = NULL`

---

## 📁 Required Backend File Structure

```
src/
├── config/
│   └── env.js                    ← Environment variable validation + export
└── modules/
    └── hospital/
        ├── hospital.routes.js    ← Route definitions only
        ├── hospital.controller.js← Request/response handling only
        ├── hospital.service.js   ← Business logic only
        ├── hospital.repository.js← All raw SQL / DB queries
        ├── hospital.validator.js ← Input validation (Joi / Zod / express-validator)
        └── hospital.test.js      ← Unit + integration tests
```

| File | Responsibility |
|------|---------------|
| `env.js` | Validates env vars at startup; exports typed config object |
| `routes.js` | Maps HTTP methods + paths to controller functions |
| `controller.js` | Parses req/res, calls service, sends response |
| `service.js` | Business rules, dispatch logic, orchestration |
| `repository.js` | All DB queries in one place — easy to debug SQL |
| `validator.js` | Validates all incoming data before it hits the DB |
| `test.js` | Catches regressions, verifies every endpoint |

> 🔍 **Debug order when something breaks:** `repository.js` (DB) → `service.js` (logic) → `controller.js` (request parsing)

---

## 📋 Required API Endpoints

Implement **all** of the following. No stubs allowed.

### Hospital Management

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/hospitals` | Get all active hospitals |
| `GET` | `/api/hospitals/:id` | Get a single hospital by ID |
| `POST` | `/api/hospitals` | Register a new hospital |
| `PUT` | `/api/hospitals/:id` | Update hospital info |
| `PATCH` | `/api/hospitals/:id/status` | Toggle `is_active` (activate/deactivate) |
| `DELETE` | `/api/hospitals/:id` | Soft delete — set `is_active = false` |

### Incident Dispatch (Hospital Only)

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/hospitals/dispatch` | Dispatch a hospital to an incident |
| `GET` | `/api/hospitals/dispatch/:incident_id` | Get hospital dispatch info for an incident |
| `PATCH` | `/api/hospitals/dispatch/:dispatch_id/status` | Update dispatch status |
| `GET` | `/api/hospitals/:hospital_id/dispatches` | Get all dispatches for a hospital |

> ⚠️ Status is one-way only: `Pending` → `En Route` → `Resolved`. Backwards transitions must be rejected.

---

## ✅ Dispatch Business Logic

**On creating a dispatch** (`POST /api/hospitals/dispatch`):
1. Verify `incident_id` exists and `is_active = true`
2. Verify `hospital_id` exists and `is_active = true`
3. Check no existing `Hospital` dispatch exists for this incident — reject duplicates with `409`
4. Insert: `responder_type = 'Hospital'`, `station_id = NULL`, `dispatch_status = 'Pending'`

**On updating dispatch status** (`PATCH .../status`):
- Only allow `Pending → En Route` and `En Route → Resolved`
- On `Resolved`: set `incidents.resolved_at = NOW()` and `incidents.is_active = false`
- Any other transition → reject with `422 Unprocessable Entity` and a clear error message

---

## 🛡️ Validation Requirements (`hospital.validator.js`)

### POST `/api/hospitals`
```
hospital_name  → required, string, max 150 chars
address        → required, string
city           → required, string, max 100 chars
phone          → required, string, max 20 chars
email          → required, valid email format
bed_capacity   → required, integer, min 1
```

### POST `/api/hospitals/dispatch`
```
incident_id    → required, positive integer
hospital_id    → required, positive integer
```

### PATCH `.../status`
```
dispatch_status → required, one of: 'Pending' | 'En Route' | 'Resolved'
```

> Return `400 Bad Request` with a descriptive message on any validation failure.

---

## ⚙️ Response & Error Standards

```js
// All success responses
{ "success": true,  "message": "...", "data": { ... } }

// All error responses
{ "success": false, "message": "Human-readable reason", "error": "Technical detail (dev only)" }
```

| Scenario | HTTP Status |
|----------|-------------|
| Hospital not found | `404` |
| Incident not found or inactive | `404` |
| Duplicate dispatch | `409 Conflict` |
| Validation failure | `400 Bad Request` |
| Invalid status transition | `422 Unprocessable Entity` |
| Server / DB error | `500 Internal Server Error` |

No endpoint may throw an unhandled promise rejection. All async functions must be wrapped in try/catch.

---

## 🖥️ Frontend Integration + Bug Fixing

The frontend is **already built**. Your job is to connect it to the backend and **fix every error or broken interaction that appears** — whether the fix lives in the backend or the frontend. Both are your responsibility within the Hospital scope.

You may edit frontend files **only** if:
- The file makes API calls to a Hospital endpoint, **or**
- The bug is directly caused by the backend connection (wrong URL, response mismatch, missing headers, etc.), **or**
- The file is a shared utility (`api.js`, `axiosConfig.js`, `httpClient.js`) and your fix does not break any non-Hospital flow

### Frontend Environment Variables

The frontend must also read all configuration from environment variables — never hardcode URLs or tokens.

```env
# Frontend .env (e.g. Vite)
VITE_API_BASE_URL=           # e.g. http://localhost:5000/api
VITE_AUTH_TOKEN_KEY=         # localStorage key used to store the JWT
```

All API calls must use `import.meta.env.VITE_API_BASE_URL` (or equivalent for your bundler) instead of a literal URL string.

---

### Phase 0 — Frontend Field Audit + Supabase Schema Verification ⚠️ DO THIS FIRST

> **This phase is mandatory and must be completed before writing a single line of backend code.**

#### Step 1 — Extract Every Field Used in the Frontend

Open **every** Hospital-related frontend file and build a complete field inventory:

| What to extract | Where to look |
|---|---|
| Every field sent in a request body | Forms, `POST`/`PUT`/`PATCH` API calls, state objects |
| Every field read from a response | Table renders, detail views, conditional logic, destructuring |
| Every URL param or query param | Route definitions, `useParams()`, dynamic URL builders |
| Field names and exact casing | camelCase? snake_case? Note exactly as written |
| Data types expected | string, number, boolean, array, nested object |

Produce a consolidated inventory like this:

```
FRONTEND FIELD INVENTORY
========================
Forms / Request Bodies:
  - hospital_name     (string)
  - address           (string)
  - city              (string)
  - phone             (string)
  - email             (string)
  - bed_capacity      (number)
  - [any other fields the frontend sends]

Response Fields Read:
  - hospital_id       (number)
  - hospital_name     (string)
  - is_active         (boolean)
  - [any other fields the frontend reads]

Dispatch Fields:
  - incident_id       (number)
  - hospital_id       (number)
  - dispatch_status   (string)
  - [any other dispatch fields]
```

---

#### Step 2 — Cross-Check Every Field Against Supabase

Query `information_schema.columns` for each relevant table and verify every frontend field exists with the correct name and type:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('hospitals', 'incidents', 'incident_dispatch')
ORDER BY table_name, ordinal_position;
```

For every frontend field, complete this table:

| Frontend Field | Expected Table | Column Exists? | Type Match? |
|---|---|---|---|
| `hospital_name` | `hospitals` | ✅ / ❌ | ✅ / ❌ |
| `bed_capacity` | `hospitals` | ✅ / ❌ | ✅ / ❌ |
| `dispatch_status` | `incident_dispatch` | ✅ / ❌ | ✅ / ❌ |
| *(every other field)* | ... | ... | ... |

---

#### Step 3 — Report Gaps — STOP AND ASK

If **any** frontend field is missing from the Supabase schema, or there is a name/type mismatch:

> **⛔ STOP. Do not proceed with backend implementation.**

Report the gap and wait for confirmation:

```
⚠️  SCHEMA GAP FOUND — ACTION REQUIRED BEFORE PROCEEDING

The following fields are used by the Hospital frontend but are MISSING
from the current Supabase database schema:

  Table: hospitals
  Missing columns:
    - [field_name]  (expected type: [type])

  Table: incident_dispatch
  Missing columns:
    - [field_name]  (expected type: [type])

Please add these columns to Supabase before I continue.
Once you confirm, I will proceed with backend implementation.
```

Do not work around missing columns. Do not rename fields to cover a schema gap. Ask now, wait for confirmation, then proceed.

---

#### Step 4 — Document the Verified Field Contract

Once all fields are confirmed, write the contract that the backend will be built against:

```
VERIFIED FIELD CONTRACT
=======================
hospitals table       ↔  frontend field   ↔  validator rule
------------------------------------------------------------
hospital_id           ↔  hospital_id      ↔  positive integer (response only)
hospital_name         ↔  hospital_name    ↔  required, string, max 150
address               ↔  address          ↔  required, string
city                  ↔  city             ↔  required, string, max 100
phone                 ↔  phone            ↔  required, string, max 20
email                 ↔  email            ↔  required, valid email
bed_capacity          ↔  bed_capacity     ↔  required, integer, min 1
is_active             ↔  is_active        ↔  boolean (response only)

incident_dispatch table ↔ frontend field  ↔  validator rule
------------------------------------------------------------
dispatch_id           ↔  dispatch_id      ↔  positive integer (response only)
incident_id           ↔  incident_id      ↔  required, positive integer
hospital_id           ↔  hospital_id      ↔  required, positive integer
dispatch_status       ↔  dispatch_status  ↔  'Pending' | 'En Route' | 'Resolved'
dispatched_at         ↔  dispatched_at    ↔  timestamp (response only)
```

> This document is your single source of truth. Every validator, every repository query, and every response shape must match it exactly.

---

### Phase 1 — Audit the Frontend BEFORE Writing Any Backend Code

> ✅ Begin Phase 1 only after Phase 0 is fully complete and all schema gaps are resolved.

Open every Hospital-related frontend file and document:

| What to find | Why |
|---|---|
| Exact URL of every API call | Your backend route must match it character-for-character |
| HTTP method used | Must match (`GET`, `POST`, `PATCH`, etc.) |
| Exact request body shape and field names | Must match your validator's expectations |
| Exact response fields the frontend reads | Your backend must return those exact field names |
| Base URL source (env var or hardcoded) | Must be read from `process.env` / `import.meta.env` — never hardcoded |
| Whether an auth token is attached | If yes, backend must accept and validate it |

> 🔍 Build the backend to match what the frontend already expects — not the other way around.

---

### Phase 2 — Frontend Bug Categories to Find and Fix

Work through every category. Fix everything you find.

---

#### 🌐 Network & CORS Errors
*Symptoms: `CORS policy`, `ERR_CONNECTION_REFUSED`, `Network Error` in the browser console*

- **Missing CORS headers on backend** → Configure `cors()` using the env variable:
  ```js
  const { frontendUrl } = require('./config/env');
  app.use(cors({ origin: frontendUrl }));
  ```
- **Wrong port or domain in frontend `baseURL`** → Read it from `import.meta.env.VITE_API_BASE_URL`
- **`http` vs `https` mismatch** → Make protocol consistent and driven by env
- **Preflight `OPTIONS` failing** → Ensure backend handles `OPTIONS` on all Hospital routes

---

#### 📦 Request Construction Errors
*Symptoms: `400 Bad Request`, backend receives empty or malformed body*

- **Missing `Content-Type: application/json`** on POST/PUT/PATCH:
  ```js
  headers: { 'Content-Type': 'application/json', ...authHeaders }
  ```
- **Body not stringified** — sending a raw JS object via `fetch` instead of `JSON.stringify(body)`
- **Field name mismatch** — align frontend field names to match the backend's `snake_case` convention
- **`undefined` or `null` in URL params** — guard before building the URL:
  ```js
  if (!hospitalId) throw new Error('Missing hospital ID');
  const url = `${import.meta.env.VITE_API_BASE_URL}/hospitals/${hospitalId}`;
  ```

---

#### 📥 Response Handling Errors
*Symptoms: blank UI, crashes reading `undefined`, stale data after actions*

- **Response shape mismatch** — frontend must read `response.data`, not `response.hospitals`
- **No null/undefined guard** before reading nested fields:
  ```js
  const name = response?.data?.hospital_name ?? 'Unknown';
  ```
- **`success: false` not handled** — display the error message, do not use the data:
  ```js
  if (!response.success) {
    showError(response.message);
    return;
  }
  ```
- **Stale data after mutation** — re-fetch the list after every successful POST/PUT/PATCH/DELETE
- **Backend error message never shown** — wire `response.message` into a toast or alert on failure

---

#### 🔄 Loading & UI State Errors
*Symptoms: button stays stuck, spinner never appears, UI freezes*

- **No loading state during API calls** → Add `isLoading` flag, show spinner, disable submit button
- **No error state when request fails** → Show a user-visible error — never just `console.error`
- **Loading state never resets after failure** — always reset in `finally`:
  ```js
  try {
    setLoading(true);
    await dispatchHospital(data);
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false); // runs even if the request fails
  }
  ```
- **UI doesn't reflect status change** after dispatching or resolving — trigger re-fetch or state patch after success

---

#### 🔑 Auth & Token Errors
*Symptoms: `401 Unauthorized` on Hospital endpoints*

- **Token not attached** — read the key from the env variable:
  ```js
  const tokenKey = import.meta.env.VITE_AUTH_TOKEN_KEY;
  const token = localStorage.getItem(tokenKey);
  headers: { Authorization: `Bearer ${token}` }
  ```
- **Wrong localStorage key** — the key used on login and the key used on every API call must match exactly; both must come from the same env variable
- **No `401` handler** — if the backend returns `401`, redirect the user to the login page

---

#### 🗺️ Frontend Routing Errors
*Symptoms: blank page, crash on navigation, `undefined` params*

- **Hospital page route missing** from the frontend router → Add it
- **Route param is undefined** on navigation:
  ```js
  const { hospitalId } = useParams();
  if (!hospitalId) return <Navigate to="/hospitals" />;
  ```
- **API fires before auth is ready** — guard the fetch behind an auth-ready check or use the existing auth context

---

### Phase 3 — Full Integration Checklist

**Pre-Implementation (Phase 0)**
- [ ] All Hospital frontend fields inventoried and documented
- [ ] Every field cross-checked against Supabase — no missing columns
- [ ] Any schema gaps reported and confirmed resolved before proceeding
- [ ] Verified field contract written and used as the implementation reference

**Environment & Configuration**
- [ ] `.env` file created with all required keys (not committed to version control)
- [ ] `src/config/env.js` validates all required vars at startup and exits on missing values
- [ ] Backend reads every URL, port, secret, and credential from `process.env`
- [ ] Frontend reads API base URL and token key from `import.meta.env` (or equivalent)
- [ ] No hardcoded string contains a URL, port, credential, or environment-specific value anywhere

**Backend**
- [ ] All 10 routes implemented and mounted in `app.js` / `server.js`
- [ ] CORS configured with `frontendUrl` from env — never a hardcoded origin
- [ ] `express.json()` middleware active — request bodies are parsed
- [ ] All responses use the standard `{ success, message, data }` shape
- [ ] No route returns `undefined` or an empty body on success
- [ ] No unhandled promise rejections anywhere

**Frontend**
- [ ] Audited all Hospital frontend files — URLs, methods, body shapes, response fields documented
- [ ] API base URL read from env variable — never hardcoded
- [ ] `Content-Type: application/json` sent on all POST/PUT/PATCH calls
- [ ] Auth token key read from env variable; token attached to all authenticated requests
- [ ] Request body field names match backend validator expectations exactly
- [ ] Response fields read by the frontend match exactly what the backend returns
- [ ] `success: false` responses display a visible error message to the user
- [ ] Loading state shown during every API call; resets in `finally`
- [ ] Data re-fetched or local state updated after every successful mutation
- [ ] No `undefined` values in API call URLs — params validated before use
- [ ] All fetch/axios errors are caught and shown to the user

**Both**
- [ ] No hardcoded URLs, ports, or credentials anywhere — all from `.env`
- [ ] No `console.log` left in production code paths
- [ ] No `TODO` or stub comments anywhere in Hospital files

---

## 🧪 Testing Requirements (`hospital.test.js`)

Tests must read any base URLs or credentials from env variables — never hardcode them.

- [ ] `GET /api/hospitals` — returns list, handles empty DB gracefully
- [ ] `GET /api/hospitals/:id` — found returns data; not found returns `404`
- [ ] `POST /api/hospitals` — valid input creates record; invalid input returns `400`
- [ ] `POST /api/hospitals/dispatch` — success; duplicate → `409`; inactive hospital → `404`; inactive incident → `404`
- [ ] `PATCH /api/hospitals/dispatch/:id/status` — valid transitions work; backwards/invalid → `422`
- [ ] All validators reject bad or missing input with correct status codes and messages

---

## 🚫 Out of Scope — Do Not Touch

```
src/modules/police/     ← Hands off
src/modules/admin/      ← Hands off
src/modules/auth/       ← Do not modify existing auth logic
Database schema files   ← No ALTER TABLE, no migrations outside hospital
```

Any frontend page, component, or API call that is **not related to Hospital** is also out of scope.
If you find a bug in the Police or Admin frontend — **report it, do not fix it.**

---

## 📌 Definition of Done

Your task is complete **only when ALL of the following are true**:

1. All Hospital frontend fields audited and verified present in Supabase — no schema gaps remain
2. All 10 backend endpoints implemented, working, and tested
3. Backend file structure matches the 6-file module layout exactly (plus `src/config/env.js`)
4. All input validation returns correct HTTP status codes
5. Dispatch business logic enforced without exception
6. Frontend calls every Hospital endpoint successfully with **zero browser console errors**
7. Every frontend bug discovered during integration is found and fixed (Hospital scope only)
8. UI correctly shows loading states, error messages, and updated data after every action
9. Auth tokens correctly attached wherever required, using the env-variable key
10. **No hardcoded URLs, ports, credentials, or environment-specific values anywhere**
11. All tests pass

> **One broken UI interaction, one incomplete endpoint, or one hardcoded value = task is NOT done. No exceptions.**