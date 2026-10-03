# TESTING.md

## Approach
- Backend API contract tests via `fastapi.testclient` (auth, health, dashboard, ML).
- Tests that need the warehouse skip automatically when it is not loaded.
- Run tests after changes; do not assume pass.

## Running
```powershell
cd backend
pip install -r requirements-dev.txt
python -m pytest -q
```

## Current suite (`backend/tests/`)
| File | Covers |
|---|---|
| test_health.py | `/health` |
| test_auth.py | login, `/me`, role enforcement (viewer 403 / admin 200) |
| test_dashboard.py | real KPIs + monthly series (skips if ETL not run) |
| test_ml.py | `/api/ml/status` lists all features with valid statuses |
| test_insights.py | `/api/insights/query` returns an answer; empty question 422 |

Result (last run): **11 passed**.

## Notes
- Dashboard/ML tests are data-dependent and skip on a fresh clone until
  `python -m app.services.etl` (backend) and `python run_all.py` (ml) are run.
- Frontend build is validated with `npm run build` (tsc + vite).
