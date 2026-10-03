# PROJECT_PLAN.md (sem-5)

Phases (parallel ML after P2):

Phase 1 - Env & Repo
- [x] Inspect env, dataset, tools
- [x] Create local structure
- [x] Write .gitignore, .env.example, README
- [ ] Git init + repo creation when gh available

Phase 2 - Dataset + Contracts
- [x] Olist CSV inventory (9 files)
- [ ] Detailed schema/profile (row counts, nulls, keys, dates, dtypes)
- [ ] Warehouse draft (facts/dims)
- [ ] API contracts (auth, dashboard, analytics, ml, insights)
- [ ] ML I/O schemas + status model
- [ ] RBAC matrix draft

Phase 3 - Core FE/BE
- [ ] Design system (Tailwind, layout, ui components)
- [ ] Landing, auth, RBAC
- [ ] FastAPI skeleton + DB setup
- [ ] Dashboard endpoints (real data-backed later)
- [ ] FE connect to BE

Phase 4 - WH + Descriptive Analytics
- [ ] ETL (read from %USERPROFILE%\Downloads\olist, validate, load)
- [ ] Star schema + integrity checks
- [ ] Verified KPIs (no fake numbers)
- [ ] Interactive dashboard + filters + charts

Phase 5 - ML Parallel
- [ ] EDA/preprocessing, baselines
- [ ] Forecasting (time-series), Sales prediction, Segmentation, Anomaly detection (feasibility-checked)
- [ ] Training/eval, model artifacts, metadata, tests
- [ ] ML backend interfaces with status

Phase 6 - AI Insights
- [ ] Controlled data retrieval tools
- [ ] LLM integration (Ollama preferred; provider-agnostic)
- [ ] Permission-aware context, fallbacks

Phase 7 - Premium Interactions
- [ ] Cursor lighting, hover cards, chart animations, scroll-triggered, smooth transitions; reduced-motion + a11y

Phase 8 - ML Integration
- [ ] Wire evaluated models; show honest statuses when not ready

Phase 9 - Testing + Docs
- [ ] Unit/integration/E2E; fix; docs complete

Phase 10 - GitHub completion
- [ ] Final checks (no secrets/dataset), commits, push
