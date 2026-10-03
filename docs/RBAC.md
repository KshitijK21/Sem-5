# RBAC.md

## Roles
- **Admin**: manage users/roles, system health, data processing status, view all analytics, ML status, settings.
- **Analyst**: dashboards/analytics, filters, predictions/segments, reports, AI insights, model performance.
- **Viewer**: permitted dashboards/reports/filters, AI insights within limits.

Role hierarchy: `viewer < analyst < admin`.

## Implementation (backend)
- `app/core/security.py`: bcrypt password hashing + HS256 JWT (python-jose).
  Issues both access tokens and refresh tokens (`type` claim distinguishes them).
- `app/models/user.py` + `app/services/users.py`: users persisted in the
  `app_user` table (SQLAlchemy); default users seeded from `AUTH_*_PASSWORD` env
  vars (admin/analyst/viewer). Passwords stored as bcrypt hashes only.
- `app/api/deps.py`:
  - `get_current_user` — requires a valid Bearer token (401 otherwise).
  - `require_roles(*roles)` / `require_min_role(role)` — 403 when insufficient.
  - `auth_gate` — global gate applied to dashboard/analytics/ml/insights/users/
    reports routers; enforces authentication when `AUTH_REQUIRED=true`. In dev
    (default false) read access passes through; admin endpoints always enforce.
- `app/api/routes/auth.py`: `POST /api/auth/login` (OAuth2 form),
  `POST /api/auth/refresh`, `GET /api/auth/me`, `POST /api/auth/register` (admin).
- `app/api/routes/users.py`: `GET/PATCH /api/users/me`, admin `GET /api/users`,
  `PATCH /api/users/{username}/role`.
- `app/api/routes/reports.py`: permission-aware CSV export (`GET /api/reports/export`).
- `app/api/routes/admin.py`: admin-only system + ETL status.

## Frontend
- `services/auth.ts`: stores JWT + user in localStorage; `login`/`logout`.
- `components/RequireAuth.tsx`: guards app routes when `VITE_AUTH_REQUIRED=true`.
- `pages/Login.tsx`: sign-in form.
- `services/api.ts`: attaches `Authorization: Bearer <token>` to all requests.

## Enforcement notes
- Authorization is enforced server-side, never frontend-only.
- Set `AUTH_REQUIRED=true` in production to require a token on every protected
  router. Admin endpoints enforce role checks regardless of that flag.
- Passwords are never stored in plain text; only bcrypt hashes in memory.
