# TESTING.md

## Approach
- Backend API contract tests via `fastapi.testclient` (auth, users, reports,
  admin, health, dashboard, ML, insights).
- ML unit tests use small synthetic DataFrames (no dataset/artifacts required).
- Frontend component tests via Vitest + Testing Library (jsdom).
- Browser E2E via Playwright against a real backend + Vite dev server.
- Tests that need the warehouse skip automatically when it is not loaded.
- Run tests after changes; do not assume pass.

## Running
```powershell
# Backend (26 tests)
cd backend
pip install -r requirements-dev.txt
python -m pytest -q

# ML pipeline units (8 tests)
cd ml
pip install -r requirements-dev.txt
python -m pytest -q

# Frontend unit/component (5 tests), lint, build
cd frontend
npm install
npm test
npm run lint
npm run build

# Browser E2E (3 tests) — first run installs Chromium
npm run e2e:install
npm run e2e
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
| test_analytics_dialect.py | dialect-aware month expression (SQLite/Postgres) |
| test_ml.py | `/api/ml/status` lists all features with valid statuses |
| test_insights.py | `/api/insights/query` answer; empty 422; `/status` |

## ML suite (`ml/tests/`)
| File | Covers |
|---|---|
| test_pipeline.py | feature builders, `make_features` lags, `regression_metrics`, metadata schema/validation |

## Frontend suite (`frontend/tests/`)
| File | Covers |
|---|---|
| auth.test.ts | login stores tokens/user; invalid creds; logout clears |
| RequireAuth.test.tsx | redirect to `/login`; passthrough when auth off |

## E2E suite (`frontend/e2e/`)
| File | Covers |
|---|---|
| smoke.spec.ts | landing hero; login form; real `admin` sign-in → `/dashboard` |

Playwright starts both servers automatically (`frontend/playwright.config.ts`):
backend `uvicorn` on :8000 and Vite dev on :5173.

Result (last run): **backend 26 passed**, **ml 8 passed**, **frontend 5 passed**,
**E2E 3 passed**, `npm run lint` clean, `npm run build` green.

## Notes
- Dashboard/ML tests are data-dependent and skip on a fresh clone until
  `python -m app.services.etl` (backend) and `python run_all.py` (ml) are run.
- The E2E sign-in test exercises the real seeded `admin`/`admin123` user.
- The initial JS bundle is split (`vendor` / `charts` / `motion` + lazy routes),
  so no chunk exceeds ~384 kB.
