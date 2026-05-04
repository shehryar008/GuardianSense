# GuardianSense — Hospital Portal Documentation

## 1. Overview
The **GuardianSense Hospital Portal** is a web application designed for medical centers and hospitals to manage emergency dispatches, view active incidents, monitor their ambulance fleet, and update incident statuses in real-time. It acts as the bridging interface between detected emergencies (accidents) and medical response teams.

## 2. Tech Stack & Architecture
- **Frontend Framework**: Next.js 15 (App Router), React 19
- **Styling**: Tailwind CSS v4, Lucide React (Icons)
- **Backend Framework**: Node.js, Express.js
- **Database**: PostgreSQL (managed via Supabase)
- **Authentication**: Supabase Auth (JWT-based)
- **Communication**: REST APIs (Frontend communicates with the Express backend, which in turn interacts with the Supabase database and Auth services).

---

## 3. File Structure

### 3.1 Backend (`Web-App/apps/backend/`)
```text
src/
├── config/
│   ├── db.js                # Supabase client initialization (requires SUPABASE_URL & SUPABASE_KEY)
│   └── env.js               # Environment variables validation and export
├── middleware/
│   └── auth.middleware.js   # JWT verification middleware (checks Supabase token)
├── modules/
│   ├── auth/                # Authentication APIs
│   │   └── auth.routes.js   # Login, Register, Change Password logic
│   ├── hospital/            # Hospital Management & Dispatch APIs
│   │   ├── hospital.controller.js
│   │   ├── hospital.repository.js
│   │   ├── hospital.routes.js
│   │   ├── hospital.service.js
│   │   └── hospital.validator.js
│   └── admin/               # Admin APIs (Out of scope for hospital)
server.js                    # Express app entry point, global error handler, CORS config
.env                         # Environment variables
package.json                 # Dependencies
```

### 3.2 Frontend (`Web-App/apps/hospital/`)
```text
src/
├── app/                     # Next.js App Router Pages
│   ├── layout.tsx           # Root layout with Geist font & AuthProvider wrapper
│   ├── page.tsx             # Root redirect to /login
│   ├── active-incidents/    # Page: View active undispatched and dispatched incidents
│   ├── ambulance-fleet/     # Page: View ambulance fleet status (dynamically calculated)
│   ├── dashboard/           # Page: High-level metrics, critical alerts, and live dispatches
│   ├── incident-history/    # Page: View past resolved incidents
│   ├── login/               # Page: Hospital login form
│   ├── profile/             # Page: Hospital information & demo data
│   ├── register/            # Page: New hospital registration (2-step process)
│   └── settings/            # Page: Preferences (Dark mode, Change password)
components/                  # Reusable React Components
├── auth/
│   └── auth-provider.tsx    # React Context for Auth State & LocalStorage sync
├── dashboard/
│   ├── critical-alert.tsx   # Red alert banner for active incidents
│   ├── header.tsx           # Top navigation with Dispatch Modal
│   ├── incident-card.tsx    # Card displaying incident details on dashboard
│   ├── sidebar.tsx          # Left navigation menu with dynamic unread counts
│   └── stat-card.tsx        # Dashboard metric cards
├── active-incidents/
│   └── active-incident-card.tsx # Card for active-incidents page
├── login/
│   └── hospital-login-form.tsx  # Login UI
├── shared/
│   └── icons.tsx            # SVG Icons collection
└── ui/                      # Base UI components (Button, Input, Checkbox)
.env.local                   # Frontend environment variables
```

---

## 4. Database Schema (Supabase)

### `hospitals`
- `hospital_id` (integer, PK)
- `hospital_name` (varchar)
- `address` (text)
- `city` (varchar)
- `phone` (varchar)
- `email` (varchar)
- `bed_capacity` (integer)
- `is_active` (boolean)
- `password_hash` (varchar) - *Defaults to 'temp_password'. Actual password is in Supabase Auth.*

### `incidents` (Read-only for Hospital)
- `incident_id` (integer, PK)
- `user_id` (uuid)
- `latitude` (double precision)
- `longitude` (double precision)
- `is_active` (boolean) - *Marks if the incident is currently open or resolved.*
- `detected_at` (timestamptz)

### `incident_dispatch`
- `dispatch_id` (integer, PK)
- `incident_id` (integer, FK to incidents)
- `responder_type` (varchar) - *Always 'Hospital' for this module.*
- `hospital_id` (integer, FK to hospitals)
- `station_id` (integer, nullable) - *Always NULL for hospitals.*
- `dispatch_status` (varchar) - *'Pending', 'En Route', 'Resolved'*
- `dispatched_at` (timestamptz)

---

## 5. Backend APIs & Logic (`http://localhost:5001`)

### 5.1 Auth APIs (`/api/auth`)
- **`POST /login`**: 
  - Validates credentials against Supabase Auth (`signInWithPassword`).
  - Auto-creates an Auth user if the email exists in the `hospitals` table but not in Auth (for backward compatibility).
  - Checks if `is_active` is true. If false, returns 403 (Pending Admin Approval).
  - Returns JWT tokens and hospital DB record.
- **`POST /register`**:
  - Registers a user directly via Supabase Auth Admin API (skips email verification).
- **`POST /change-password`**:
  - Requires current password and new password. Validates current password via `signInWithPassword`, then updates via Admin API.

### 5.2 Hospital APIs (`/api/hospitals`)
- **`GET /`**: Lists all active hospitals.
- **`POST /`**: Registers a new hospital in the DB (used in step 1 of registration flow).
- **`GET /:hospital_id/dispatches`**: 
  - Returns all dispatches assigned to this hospital.
  - **Logic**: Performs a JOIN on the `incidents` table to include `latitude`, `longitude`, `detected_at`, and `is_active`.
- **`GET /:id`**: Gets hospital by ID.
- **`PUT /:id`**: Updates hospital details.
- **`PATCH /:id/status`**: Toggles `is_active` status.
- **`DELETE /:id`**: Soft deletes hospital (sets `is_active = false`).

### 5.3 Dispatch APIs (`/api/hospitals/dispatch`)
- **`GET /api/hospitals/incidents/active`**: Returns all incidents where `is_active = true`.
- **`POST /api/hospitals/dispatch`**: 
  - Creates a new dispatch.
  - **Logic**: Verifies incident exists and is active. Verifies hospital exists and is active. Prevents duplicate dispatches for the same incident (`409 Conflict`). Inserts with `responder_type = 'Hospital'`.
- **`GET /api/hospitals/dispatch/:incident_id`**: Gets dispatch details for a specific incident.
- **`PATCH /api/hospitals/dispatch/:dispatch_id/status`**: 
  - Updates dispatch status.
  - **Logic**: Enforces strict state transitions: `Pending -> En Route -> Resolved`.
  - Rejects invalid transitions with `422 Unprocessable Entity`.
  - When status becomes `Resolved`, it automatically sets the corresponding incident's `is_active = false`.

---

## 6. Frontend Application (`http://localhost:3001`)

### 6.1 State Management (`auth-provider.tsx`)
- Uses React Context to provide `token`, `hospital` data, and `isAuthenticated` boolean.
- Stores data in `localStorage` using environment variables for keys (`NEXT_PUBLIC_AUTH_TOKEN_KEY`, `NEXT_PUBLIC_HOSPITAL_KEY`).
- On initial load, it reads from `localStorage`.
- Guards protected routes. If no token is present and the route isn't `/login` or `/register`, redirects to `/login`.

### 6.2 Key UI Components
- **`Sidebar`**: Left navigation. Fetches active incidents and dispatches on mount to calculate the `activeCount` badge dynamically.
- **`Header`**: Contains a "Dispatch" button that opens a modal to manually enter an Incident ID and dispatch an ambulance. Handles the `POST /dispatch` API call.
- **`CriticalAlert`**: Red banner shown on the dashboard when there are unassigned incidents or active dispatches.

### 6.3 Pages
- **`/login`**: Captures email/password, calls `/api/auth/login`. Updates `AuthProvider` context on success.
- **`/register`**: Two-step registration logic:
  1. Calls `POST /api/hospitals` to create the DB record.
  2. Calls `POST /api/auth/register` to create the Supabase Auth account.
  - *Rollback Logic*: If step 2 fails, it sends a `DELETE` request to rollback step 1.
- **`/dashboard`**: 
  - Fetches hospital's dispatches and all active incidents.
  - Calculates stats (Active Dispatches, Resolved, etc.).
  - Displays a live feed of dispatches (excluding 'Resolved').
  - Allows updating status directly from cards (`Pending -> En Route`, `En Route -> Resolved`).
- **`/active-incidents`**:
  - Displays two lists: "Awaiting Dispatch" (active incidents with no hospital assigned) and "Dispatched" (incidents assigned to this hospital currently Pending or En Route).
- **`/ambulance-fleet`**:
  - Dynamically calculates fleet size based on `bed_capacity` (1 amb per 25 beds, min 2).
  - Maps active dispatches to "On Mission" or "En Route" ambulances.
  - Generates remaining fleet with random "Available" or "Maintenance" statuses.
- **`/incident-history`**:
  - Displays a list of dispatches where status is "Resolved".
- **`/profile`**:
  - Displays hospital info. Contains placeholder/demo data for Certifications and Departments.
- **`/settings`**:
  - UI to change password (calls `/api/auth/change-password`).
  - Dark mode toggle (toggles `dark` class on the `<html>` element).

### 6.4 General Frontend Logic Rules
- **Environment Variables**: API URLs are strictly fetched via `process.env.NEXT_PUBLIC_API_URL`. No hardcoded fallbacks like `http://localhost:5001`.
- **API Responses**: All API calls expect a `{ success: boolean, message: string, data?: any }` structure and validate `data.success`.
- **401 Unauthorized**: Every protected API call catches `401` status codes and immediately redirects the user to `/login`.
- **Loading States**: All mutating actions (Dispatch, Resolve, Login) implement `isLoading`/`isResolving` boolean states to disable buttons and prevent duplicate submissions.

---

## 7. Minute Logic Details

- **Registration Password Issue**: The `hospitals` table has a `password_hash` column, but the actual password is managed by Supabase Auth. During registration step 1, the backend `repository.create()` ignores the frontend's password and inserts `'temp_password'` into the DB. Step 2 creates the real Auth account.
- **Status Updates**: Updating to "Resolved" requires two API calls if the current status is "Pending" (Pending -> En Route, then En Route -> Resolved) to satisfy the backend's strict state machine validation.
- **ID Parsing**: All route parameters (e.g., `req.params.id`) in the backend controller are parsed with `parseInt(id, 10)` before passing to the service layer to avoid PostgreSQL type errors.
- **Route Shadowing**: In Express routes, `/:hospital_id/dispatches` must be defined *before* `/:id` so it doesn't get shadowed by the wildcard parameter.
