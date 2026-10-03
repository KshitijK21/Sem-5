# TESTING.md

## Approach
- Backend API contract tests via `fastapi.testclient` (auth, users, reports,
  admin, health, dashboard, ML, insights).
- ML unit tests use small synthetic DataFrames (no dataset/artifacts required).
- Frontend tests via Vitest + Testing Library (jsdom).
- Tests that need the warehouse skip automatically when it is not loaded.
- Run tests after changes; do not assume pass.

## Running
```powershell
# Backend (22 tests)
cd backend
pip install -r requirements-dev.txt
python -m pytest -q

# ML pipeline units (8 tests)
cd ml
pip install pytest
python -m pytest -q

# Frontend (5 tests) + build
cd frontend
npm install
npm test
npm run build
```

## Backend suite (`backend/tests/`)
| File | Covers |
|---|---|
| test_health.py | `/health` |
| test_auth.py | login, `/me`, role enforcement (viewer 403 / admin 200) |
| test_refresh.py | refresh flow; access token rejected as refresh |
| test_users.py | `/me`, admin list, register, password change, role change |
| test_reports.py | CSV exports; analyst-only; unknown report 404 |
| test_admin.py | system status + ETL status; viewer 403 |
| test_dashboard.py | real KPIs + monthly series (skips if ETL not run) |
| test_ml.py | `/api/ml/status` lists all features with valid statuses |
| test_insights.py | `/api/insights/query` returns an answer; empty question 422 |

## ML suite (`ml/tests/`)
| File | Covers |
|---|---|
| test_pipeline.py | feature builders, `make_features` lags, `regression_metrics`, metadata schema/validation |

## Frontend suite (`frontend/tests/`)
| File | Covers |
|---|---|
| auth.test.ts | login stores tokens/user; invalid creds; logout clears |
| RequireAuth.test.tsx | redirect to `/login`; passthrough when auth off |

Result (last run): **backend 22 passed**, **ml 8 passed**, **frontend 5 passed**,
`npm run build` green.

## Notes
- Dashboard/ML tests are data-dependent and skip on a fresh clone until
  `python -m app.services.etl` (backend) and `python run_all.py` (ml) are run.
- Frontend build is validated with `npm run build` (tsc + vite).
