# PROJECT_PLAN.md (sem-5)

AI-Powered BI & Predictive Analytics Platform (Olist). ML runs as a parallel
track after Phase 2. Status is tracked live in `docs/CHECKLIST.md`.

## Phase 1 — Env & Repo  — DONE
- [x] Inspect env, dataset (9 Olist CSVs), tools
- [x] Create local structure
- [x] Write .gitignore, .env.example, README
- [x] Git init + connect origin over HTTPS (gh CLI intentionally unused)

## Phase 2 — Dataset + Contracts — DONE
- [x] Olist CSV inventory
- [x] Schema/profile (row counts, nulls, keys, dates, dtypes)
- [x] Warehouse draft (facts/dims, grain)
- [x] API contracts (auth, dashboard, analytics, ml, insights)
- [x] ML I/O schemas + status model
- [x] RBAC matrix

## Phase 3 — Core FE/BE — DONE
- [x] Design system (Tailwind, layout, ui components)
- [x] Landing, auth, RBAC
- [x] FastAPI skeleton + DB setup
- [x] Dashboard endpoints (data-backed)
- [x] FE ↔ BE integration

## Phase 4 — Warehouse + Descriptive Analytics — DONE
- [x] ETL (reads `%USERPROFILE%\Downloads\olist`, validates, loads) — idempotent
- [x] Star schema + integrity checks
- [x] Verified KPIs (no fake numbers) — `docs/KPIs.md`
- [x] Interactive dashboard + filters + charts

## Phase 5 — ML Parallel — DONE
- [x] EDA/preprocessing, real baselines (no stubs)
- [x] Forecasting, Sales prediction, Customer/Product segmentation, Anomaly detection
- [x] Training/eval, metadata artifacts; docs/ML_BASELINES.md
- [x] ML pipeline unit tests (`ml/tests/`)
- [x] ML backend interfaces with honest status (`/api/ml/*`)

## Phase 6 — AI Insights — DONE
- [x] Controlled data retrieval tools (role-scoped, no arbitrary SQL)
- [x] LLM integration (Ollama preferred; provider-agnostic)
- [x] Permission-aware context, deterministic fallback
- [x] Provider status endpoint (`GET /api/insights/status`)

## Phase 7 — Premium Interactions — DONE
- [x] Cursor lighting, hover cards, chart animations, scroll-triggered,
      smooth transitions; reduced-motion + a11y

## Phase 8 — ML Integration — DONE
- [x] Wire evaluated models (forecast, predict/sales, segments, anomalies)
- [x] Honest statuses; artifact-aware metadata
- [x] Frontend ML/Analytics pages wired to real endpoints

## Phase 9 — Testing + Docs — DONE
- [x] Backend API tests (22), ML unit tests (8), frontend component tests (5)
- [x] Browser E2E smoke tests (Playwright)
- [x] Docs suite complete (SRS, KPIs, API, RBAC, ML, Testing, Postgres)

## Phase 10 — GitHub Completion — DONE
- [x] Final checks (no secrets/dataset committed)
- [x] Commits + push to origin/main

## Phase 11 — Extended (optional items removed) — DONE
- [x] DB-backed users, refresh tokens, user/report/admin APIs
- [x] CSV reports + admin pages; dashboard filters; auto token refresh
- [x] ESLint configured; routes code-split
