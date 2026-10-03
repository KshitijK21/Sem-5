# RBAC.md

## Roles
- **Admin**: manage users/roles, system health, data processing status, view all analytics, ML status, settings.
- **Analyst**: dashboards/analytics, filters, predictions/segments, reports, AI insights, model performance.
- **Viewer**: permitted dashboards/reports/filters, AI insights within limits.

Role hierarchy: `viewer < analyst < admin`.

## Implementation (backend)
- `app/core/security.py`: bcrypt password hashing + HS256 JWT (python-jose).
- `app/services/users.py`: user registry with hashed passwords and roles; default
  users seeded from `AUTH_*_PASSWORD` env vars (admin/analyst/viewer).
- `app/api/deps.py`:
  - `get_current_user` — requires a valid Bearer token (401 otherwise).
  - `require_roles(*roles)` / `require_min_role(role)` — 403 when insufficient.
  - `auth_gate` — global gate applied to dashboard/analytics/ml/insights routers;
    enforces authentication when `AUTH_REQUIRED=true`. In dev (default false)
    read access passes through; admin endpoints always enforce roles.
- `app/api/routes/auth.py`: `POST /api/auth/login` (OAuth2 form), `GET /api/auth/me`,
  `GET /api/auth/admin/users` (admin only).

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
