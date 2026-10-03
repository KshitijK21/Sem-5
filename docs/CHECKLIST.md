# Master Prompt Checklist

## Phase 1 — Environment & Repository Setup
- [x] 1. Confirm OS and current working directory
- [x] 2. Locate Downloads; check sem-5 exists or create
- [x] 3. Inspect olist dataset files (9 CSVs)
- [x] 4. Check Git, Node, Python, pip, Docker installed (gh not used as requested)
- [x] 5. GitHub repo Sem-5 connected via HTTPS (origin set)
- [x] 6. Local Git initialized, main branch, pushed initial work
- [x] 7. Project structure created
- [x] 8. .gitignore, .env.example, README.md created
- [x] 9. Initial commits pushed
- [x] 10. Verify remote and report status

## Phase 2 — Dataset Exploration & Contracts
- [x] 2.1 Dataset inventory (headers/rows)
- [x] 2.2 Profiling: nulls per file, date ranges
- [x] 2.3 Dataset summary/profile/dictionary drafts
- [x] 2.4 Warehouse design draft (facts/dims, grain)
- [x] 2.5 API contracts defined
- [x] 2.6 ML I/O schemas + statuses defined
- [x] 2.7 RBAC matrix draft
- [x] 2.8 Decisions, Project Plan, Status docs

## Phase 3 — Core Frontend & Backend
- [x] 3.1 Design system scaffolds (Tailwind, base styles)
- [x] 3.2 Landing page + routing
- [x] 3.3 Frontend Vite/TS/Tailwind config
- [x] 3.4 Backend FastAPI skeleton (/health)
- [x] 3.5 Backend/ML/frontend requirements
- [x] 3.6 Backend core (config, settings, logging)
- [x] 3.7 Database setup (SQLAlchemy base, session, models init)
- [x] 3.8 Auth & RBAC implemented (JWT login, hashed passwords, role deps, auth_gate, FE login flow)
- [x] 3.9 Dashboard endpoints stubs (real data later)
- [x] 3.10 Frontend layout (shell, nav, theme) + routes
- [x] 3.11 Connect FE to BE health (api service)

## Phase 4 — Warehouse & Descriptive Analytics
- [x] 4.1 ETL implemented (backend/app/services/etl.py) - reads external olist, validates, cleans, loads
- [x] 4.2 Star schema tables created + loaded (SQLAlchemy models)
- [x] 4.3 Data quality checks (ETL warnings) + integrity
- [x] 4.4 Verified KPIs computed from real data (docs/KPIs.md)
- [x] 4.5 Dashboard wired to real KPI/chart APIs (Recharts)

## Phase 5 — ML Parallel
- [x] 5.1 ML folder structure complete (src/{common,data_processing,forecasting,prediction,customer_segmentation,product_segmentation,anomaly_detection,evaluation})
- [x] 5.2 Preprocessing implemented (ml/src/data_processing/build_datasets.py -> 4 processed datasets)
- [x] 5.3 Real baselines implemented (no more stubs)
- [x] 5.4 Forecasting, Sales prediction, Customer/Product segmentation, Anomaly all implemented
- [x] 5.5 Training/eval run on real data; metrics in docs/ML_BASELINES.md + ml/models/*.metadata.json
- [x] 5.6 ML backend interfaces + status (backend/app/services/ml.py, /api/ml/*)

## Phase 6 — AI Business Insights
- [x] 6.1 Controlled data retrieval implemented (ai_assistant/context.py; role-scoped, no arbitrary SQL)
- [x] 6.2 LLM integration implemented (provider-agnostic: Ollama + Disabled)
- [x] 6.3 Permission-aware context + deterministic fallback (llm_unavailable summary)
- [x] 6.4 Assistant UI implemented (/insights page with examples)

## Phase 7 — Premium Interactions
- [x] 7.1 Cursor-responsive lighting (design) lighting
- [x] 7.2 Hover cards
- [x] 7.3 Chart animations (Recharts transitions; lightweight)
- [x] 7.4 Scroll-triggered (FadeIn)
- [x] 7.5 Smooth transitions + reduced-motion + a11y (minimal) + reduced-motion + a11y

## Phase 8 — ML Integration
- [x] 8.1 Wire evaluated models (forecast, predict/sales, segments, anomalies endpoints)
- [x] 8.2 Validate schemas, honest statuses (metadata-driven; artifact-aware status)
- [x] 8.3 Wire ML pages in frontend to new endpoints (forecast chart, segments, anomalies, predict form) — /models
- [x] 8.4 Analytics page wired to real /api/analytics series — /analytics

## Phase 9 — Testing & Docs
- [x] 9.1 Backend tests written (auth, health, dashboard, ml) + dev requirements
- [x] 9.2 Run tests, fix (9 passed via pytest)
- [x] 9.3 Complete docs (core docs added), setup verification

## Phase 10 — GitHub Completion
- [x] 10.1 Final checks (secrets/dataset excluded; structure clean) (secrets/dataset)
- [x] 10.2 Commits, push, report (pushed incrementally)


























