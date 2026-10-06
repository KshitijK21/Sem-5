## Status
- Working dir: C:\Users\Kshitij\Downloads\sem-5 (local repo)
- Remote: https://github.com/KshitijK21/Sem-5.git
- Checklist: see docs/CHECKLIST.md

## Warehouse (done)
- Real Olist ETL loaded into the star schema; verified KPIs in docs/KPIs.md.
- Dashboard + Analytics pages wired to real KPI/chart APIs.

## ML (done, parallel track)
- 5 features trained/evaluated on real data; metrics in docs/ML_BASELINES.md.
- Backend serves models via /api/ml (status, forecast, segments, anomalies, predict/sales).
- Frontend /models page: status cards, forecast chart, segment chart, anomaly table, predict form.

## Auth / RBAC (done)
- Two roles only: **admin** + **analyst** (no viewer). Matrix: docs/RBAC.md.
- JWT login with access + refresh tokens, bcrypt-hashed users persisted in the
  `app_user` table, router-level role deps (`require_bi_user` for business
  routers, `require_admin` for `/api/admin`), `AUTH_REQUIRED` default true.
- Single role source of truth (`VALID_ROLES`/`ROLE_RANK` in
  `app/services/users.py`); legacy `viewer` rows migrate to `analyst`.
- Last-admin protection (409) on role changes; invalid roles rejected.
- User management API (profile/password/role), admin user list.
- Frontend login page, protected routes, `RequireAdmin` + `AccessDenied`,
  auth-aware API client with automatic token refresh on 401; BI vs
  Administration navigation split.

## AI Insights (done)
- Provider-agnostic LLM (Ollama preferred) with deterministic data-grounded fallback.
- Role-scoped controlled context; /insights page with examples and sources.

## Reporting & Admin (done)
- CSV export API (`/api/reports/export`) for KPIs, monthly revenue, revenue by
  category, orders by status; permission-aware.
- Admin API (system status, ETL status, warehouse status, ML status, settings)
  + administration frontend section (`/admin/users`, `/admin/health`,
  `/admin/data`, `/admin/warehouse`, `/admin/ml`, `/admin/settings`).
- Dashboard date-range and order-status filters.

## Quality / tooling (done)
- Dialect-aware warehouse SQL (`month_expr`) with a Postgres migration guide
  (`docs/POSTGRES.md`).
- LLM provider status endpoint (`GET /api/insights/status`).
- ESLint (flat config) enforcing `npm run lint`.
- Route-level code-splitting + vendor/charts/motion chunks (no >500 kB chunk).

## Tests (done)
- Backend: 50 passing (health, auth, refresh, users, RBAC matrix incl. forged
  JWT role claim, reports, admin, dashboard, dialect, ml, insights).
- ML: 8 passing (feature builders, metrics, metadata).
- Frontend: 15 passing (auth service, RequireAuth, RequireAdmin); lint clean;
  build green.
- E2E: 5 passing (Playwright: landing, login form, real admin sign-in →
  dashboard, admin user management, analyst BI-only access). E2E surfaced and
  fixed a nested-`<Router>` runtime bug.

## Next
- None required. Optional future work: CI workflow, Docker Compose for
  one-command startup, live Ollama integration test.
