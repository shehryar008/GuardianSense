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
| ❌ **DO NOT** | Touch `Police_Stations`, `Admins`, or any police/admin routes or frontend pages |
| ❌ **DO NOT** | Fix frontend bugs unrelated to Hospital or the backend connection |
| ❌ **DO NOT** | Modify any table schema |
| ❌ **DO NOT** | Create backend files outside the Hospital module folder |
| ❌ **DO NOT** | Leave any endpoint incomplete, untested, or throwing unhandled errors |

---

## 🗄️ Relevant Database Tables

You will work **only** with these tables:

### `Hospitals`
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

### `Incidents` (READ ONLY — do not modify schema)
```sql
CREATE TABLE Incidents (
    incident_id  SERIAL PRIMARY KEY,
    user_id      INT NOT NULL,
    latitude     DECIMAL(10, 8) NOT NULL,
    longitude    DECIMAL(11, 8) NOT NULL,
    is_active    BOOLEAN DEFAULT TRUE,
    detected_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at  TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
```

### `Incident_Dispatch` (Hospital rows only)
```sql
-- You only handle rows where responder_type = 'Hospital'
-- hospital_id must NOT be NULL, station_id must be NULL
CREATE TABLE Incident_Dispatch (
    dispatch_id     SERIAL PRIMARY KEY,
    incident_id     INT NOT NULL,
    responder_type  VARCHAR(20) NOT NULL CHECK (responder_type IN ('Hospital', 'Police')),
    hospital_id     INT NULL,
    station_id      INT NULL,
    dispatch_status VARCHAR(20) DEFAULT 'Pending' CHECK (dispatch_status IN ('Pending', 'En Route', 'Resolved')),
    dispatched_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES Incidents(incident_id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES Hospitals(hospital_id),
    FOREIGN KEY (station_id) REFERENCES Police_Stations(station_id)
);
```

> ⚠️ When inserting into `Incident_Dispatch`, always set `responder_type = 'Hospital'`, `hospital_id = <valid id>`, `station_id = NULL`.

---

## 📁 Required Backend File Structure

You **must** follow this exact structure. Do not deviate.

```
src/
└── modules/
    └── hospital/
        ├── hospital.routes.js        ← Route definitions only
        ├── hospital.controller.js    ← Request/response handling only
        ├── hospital.service.js       ← Business logic only
        ├── hospital.repository.js    ← All raw SQL / DB queries
        ├── hospital.validator.js     ← Input validation (Joi / Zod / express-validator)
        └── hospital.test.js          ← Unit + integration tests
```

| File | Responsibility |
|------|---------------|
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
- On `Resolved`: set `Incidents.resolved_at = NOW()` and `Incidents.is_active = false`
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
dispatch_status → required, must be exactly one of: 'Pending', 'En Route', 'Resolved'
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

The frontend is **already built**. Your job is to connect it to the backend and **fix every error or broken interaction that appears** — whether the fix lives in the backend code or the frontend code. Both are your responsibility within the Hospital scope.

You are allowed to edit frontend files **only** if:
- The file makes API calls to a Hospital endpoint, OR
- The bug is directly caused by the backend connection (wrong URL, response mismatch, missing headers, etc.), OR
- The file is a shared utility (`api.js`, `axiosConfig.js`, `httpClient.js`) and your fix does not break any non-Hospital flow

---

### Phase 1 — Audit the Frontend BEFORE Writing Any Backend Code

Before writing a single backend file, open every Hospital-related frontend file and document:

| What to find | Why |
|---|---|
| Exact URL of every API call | Your backend route must match it character-for-character |
| HTTP method used | Must match (`GET`, `POST`, `PATCH`, etc.) |
| Exact request body shape and field names | Must match your validator's expectations |
| Exact response fields the frontend reads | Your backend must return those exact field names |
| Hardcoded base URLs or env variables | Must point to the correct backend address and port |
| Whether an auth token is attached | If yes, backend must accept and validate it |

> 🔍 Build the backend to match what the frontend already expects — not the other way around.
> If the frontend calls `POST /api/hospital/dispatch-hospital`, that is the route you build.

---

### Phase 2 — Frontend Bug Categories to Find and Fix

Work through every category. Fix everything you find.

---

#### 🌐 Network & CORS Errors
*Symptoms: `CORS policy`, `ERR_CONNECTION_REFUSED`, `Network Error` in the browser console*

- **Missing CORS headers on backend** → Add `cors()` middleware with the frontend's origin:
  ```js
  app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
  ```
- **Wrong port or domain in frontend `baseURL`** → Correct it to match the running backend
- **`http` vs `https` mismatch** → Make protocol consistent across all API calls
- **Preflight `OPTIONS` request failing** → Ensure backend handles `OPTIONS` on all Hospital routes

---

#### 📦 Request Construction Errors
*Symptoms: `400 Bad Request`, backend receives empty or malformed body*

- **Missing `Content-Type: application/json`** on POST/PUT/PATCH:
  ```js
  headers: { 'Content-Type': 'application/json', ...authHeaders }
  ```
- **Body not stringified** — sending a raw JS object via `fetch` instead of `JSON.stringify(body)`
- **Field name mismatch** — frontend sends `{ hospitalName }` but backend expects `{ hospital_name }`:
  - Fix: align frontend field names to match `snake_case` DB/backend convention
- **`undefined` or `null` in URL params** — route becomes `/api/hospitals/undefined`:
  ```js
  // Add a guard before building the URL
  if (!hospitalId) throw new Error('Missing hospital ID');
  const url = `/api/hospitals/${hospitalId}`;
  ```

---

#### 📥 Response Handling Errors
*Symptoms: blank UI, crashes reading `undefined`, stale data after actions*

- **Response shape mismatch** — frontend reads `response.hospitals` but backend returns `response.data`:
  ```js
  // Fix the frontend to match the backend shape
  const hospitals = response.data; // not response.hospitals
  ```
- **No null/undefined guard** before reading nested fields:
  ```js
  const name = response?.data?.hospital_name ?? 'Unknown';
  ```
- **`success: false` not handled** — frontend tries to use data even when request failed:
  ```js
  if (!response.success) {
    showError(response.message);
    return;
  }
  ```
- **Stale data after mutation** — list doesn't update after a hospital is added/edited/dispatched:
  - Fix: re-fetch the list or update local state after every successful POST/PUT/PATCH/DELETE
- **Backend error message never shown to user** — wire `response.message` into a toast or alert on failure

---

#### 🔄 Loading & UI State Errors
*Symptoms: button stays stuck, spinner never appears, UI freezes*

- **No loading state during API calls** → Add `isLoading` flag, show spinner, disable submit button
- **No error state when request fails** → Show a user-visible error message — never just a `console.error`
- **Loading state never resets after failure** — always reset in `finally`:
  ```js
  try {
    setLoading(true);
    await dispatchHospital(data);
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false); // Must run even if the request fails
  }
  ```
- **UI doesn't reflect status change** after dispatching or resolving — trigger re-fetch or state patch after success

---

#### 🔑 Auth & Token Errors
*Symptoms: `401 Unauthorized` on Hospital endpoints*

- **Token not attached** to Hospital API calls:
  ```js
  const token = localStorage.getItem('token'); // verify exact key
  headers: { Authorization: `Bearer ${token}` }
  ```
- **Wrong localStorage key** — search every file where the token is written on login, use the exact same key everywhere
- **No `401` handler** — if backend returns `401`, redirect user to the login page

---

#### 🗺️ Frontend Routing Errors
*Symptoms: blank page, crash on navigation, `undefined` params*

- **Hospital page route missing** from the frontend router → Add it
- **Route param is undefined** on navigation (`/hospitals/undefined`):
  ```js
  const { hospitalId } = useParams();
  if (!hospitalId) return <Navigate to="/hospitals" />;
  ```
- **API fires before auth is ready** — component mounts and fetches before token is loaded:
  - Fix: guard the fetch behind an auth-ready check or use the existing auth context

---

### Phase 3 — Full Integration Checklist

Every item must be checked before the task is done.

**Backend**
- [ ] All 10 routes implemented and mounted in `app.js` / `server.js`
- [ ] CORS configured to accept the frontend's origin
- [ ] `express.json()` middleware active — request bodies are parsed
- [ ] All responses use the standard `{ success, message, data }` shape
- [ ] No route returns `undefined` or an empty body on success
- [ ] No unhandled promise rejections anywhere

**Frontend**
- [ ] Audited all Hospital frontend files — URLs, methods, body shapes, response fields documented
- [ ] `API_URL` / `baseURL` points to the correct backend address and port
- [ ] `Content-Type: application/json` sent on all POST/PUT/PATCH calls
- [ ] Auth token attached to all requests that require it
- [ ] Request body field names match backend validator expectations exactly
- [ ] Response fields read by the frontend match exactly what the backend returns
- [ ] `success: false` responses display a visible error message to the user
- [ ] Loading state shown during every API call; resets in `finally`
- [ ] Data re-fetched or local state updated after every successful mutation
- [ ] No `undefined` values in API call URLs — params validated before use
- [ ] All fetch/axios errors are caught and shown to the user

**Both**
- [ ] No hardcoded URLs or credentials — use `.env` variables throughout
- [ ] No `console.log` left in production code paths
- [ ] No `TODO` or stub comments anywhere in Hospital files

---

## 🧪 Testing Requirements (`hospital.test.js`)

- [ ] `GET /api/hospitals` — returns list, handles empty DB gracefully
- [ ] `GET /api/hospitals/:id` — found returns data, not found returns `404`
- [ ] `POST /api/hospitals` — valid input creates record; invalid input returns `400`
- [ ] `POST /api/hospitals/dispatch` — success; duplicate → `409`; inactive hospital → `404`; inactive incident → `404`
- [ ] `PATCH /api/hospitals/dispatch/:id/status` — valid transitions work; backwards/invalid → `422`
- [ ] All validators reject bad or missing input with correct status codes and messages

---

## 🚫 Out of Scope — Do Not Touch

```
src/modules/police/          ← Hands off — completely
src/modules/admin/           ← Hands off — completely
src/modules/auth/            ← Do not modify existing auth logic
Database schema files        ← No ALTER TABLE, no migrations outside hospital
```

Any frontend page, component, or API call that is **not related to Hospital** is also out of scope.
If you find a bug in the Police or Admin frontend — **report it, do not fix it**.

---

## 📌 Definition of Done

Your task is complete **only when ALL of the following are true**:

1. All 10 backend endpoints implemented, working, and tested
2. Backend file structure matches the 6-file module layout exactly
3. All input validation returns correct HTTP status codes
4. Dispatch business logic enforced without exception
5. Frontend calls every Hospital endpoint successfully with **zero browser console errors**
6. Every frontend bug discovered during integration is found and fixed (Hospital scope only)
7. UI correctly shows loading states, error messages, and updated data after every action
8. Auth tokens correctly attached wherever required
9. No stubs, no `TODO` comments, no hardcoded values anywhere
10. All tests pass

> **One broken UI interaction or one incomplete backend endpoint = task is NOT done. No exceptions.**