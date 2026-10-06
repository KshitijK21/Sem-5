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
# Backend (48 tests)
cd backend
pip install -r requirements-dev.txt
python -m pytest -q

# ML pipeline units (8 tests)
cd ml
pip install -r requirements-dev.txt
python -m pytest -q

# Frontend unit/component (13 tests), lint, build
cd frontend
npm install
npm test
npm run lint
npm run build

# Browser E2E (5 tests) — first run installs Chromium â€” first run installs Chromium
npm run e2e:install
npm run e2e
```

## Backend suite (`backend/tests/`)
| File | Covers |
|---|---|
| test_health.py | `/health` |
| test_auth.py | login, `/me`, role enforcement (analyst BI 200 / admin 200 / anon 401) |
| test_refresh.py | refresh flow; access token rejected as refresh |
| test_users.py | `/me`, admin list, register (analyst/admin only), password change, role change + last-admin 409 |
| test_rbac.py | full permission matrix: business endpoints (both roles), admin endpoints (403 for analyst), 401 anonymous |
| test_reports.py | CSV exports; both roles; unknown report 404 |
| test_admin.py | system status + ETL status + warehouse/ML/settings; analyst 403; no secrets |
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
| auth.test.ts | login stores tokens/user; invalid creds; logout clears; role helpers (`isAdmin`, `isAnalyst`, `isAdminOrAnalyst`); auth-required default; unknown roles ignored |
| RequireAuth.test.tsx | redirect to `/login`; passthrough when auth off |
| RequireAdmin.test.tsx | analyst gets `AccessRestricted`; admin passes; backend role re-checked against cached role; redirect to `/login` when anonymous |

## E2E suite (`frontend/e2e/`)
| File | Covers |
|---|---|
| smoke.spec.ts | landing hero; login form; real `admin` sign-in → `/dashboard`; admin sees Administration + opens user management; real `analyst` sign-in → BI works, Administration hidden, direct `/admin/users` blocked in UI |

Playwright starts both servers automatically (`frontend/playwright.config.ts`):
backend `uvicorn` on :8000 and Vite dev on :5173.

Result (last run): **backend 48 passed**, **ml 8 passed**, **frontend 13 passed**,
**E2E 5 passed**, `npm run lint` clean, `npm run build` green.

## Notes
- Dashboard/ML tests are data-dependent and skip on a fresh clone until
  `python -m app.services.etl` (backend) and `python run_all.py` (ml) are run.
- The E2E sign-in tests exercise the real seeded `admin`/`admin123` and
  `analyst`/`analyst123` users.
- Hiding navigation in the UI is UX only: `test_rbac.py` proves the backend
  returns 403 for every admin endpoint regardless of what the UI shows.
- The initial JS bundle is split (`vendor` / `charts` / `motion` + lazy routes),
  so no chunk exceeds ~384 kB.
