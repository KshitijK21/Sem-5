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
- JWT login, bcrypt-hashed users (admin/analyst/viewer), role deps, auth_gate.
- Frontend login page, protected routes (VITE_AUTH_REQUIRED), auth-aware API client.

## AI Insights (done)
- Provider-agnostic LLM (Ollama preferred) with deterministic data-grounded fallback.
- Role-scoped controlled context; /insights page with examples and sources.

## Tests (done)
- 11 backend tests passing (auth, health, dashboard, ml, insights).
- Frontend build green (`npm run build`).

## Next
- Optional: real DB-backed users, refresh tokens.
- Optional: reports/CSV export, admin system status page.
- Optional: expand tests to ML pipeline and frontend components.
