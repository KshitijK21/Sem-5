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
- JWT login with access + refresh tokens, bcrypt-hashed users persisted in the
  `app_user` table (admin/analyst/viewer), role deps, auth_gate.
- User management API (profile/password/role), admin user list.
- Frontend login page, protected routes (VITE_AUTH_REQUIRED), auth-aware API
  client with automatic token refresh on 401.

## AI Insights (done)
- Provider-agnostic LLM (Ollama preferred) with deterministic data-grounded fallback.
- Role-scoped controlled context; /insights page with examples and sources.

## Reporting & Admin (done)
- CSV export API (`/api/reports/export`) for KPIs, monthly revenue, revenue by
  category, orders by status; permission-aware.
- Admin API (system status, ETL status) + `/reports` and `/admin` frontend pages.
- Dashboard date-range and order-status filters.

## Tests (done)
- Backend: 22 passing (auth, refresh, users, reports, admin, health, dashboard,
  ml, insights).
- ML: 8 passing (feature builders, metrics, metadata).
- Frontend: 5 passing (auth service, RequireAuth) + build green (`npm run build`).

## Next
- Optional polish only: ESLint config, code-splitting to reduce bundle size,
  Postgres migration docs. Core scope complete.
