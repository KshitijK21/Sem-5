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
- [x] 3.8 Auth & RBAC (skeleton deferred to minimal stubs? marking partial) (models, schemas, routes, deps)
- [x] 3.9 Dashboard endpoints stubs (real data later)
- [x] 3.10 Frontend layout (shell, nav, theme) + routes
- [x] 3.11 Connect FE to BE health (api service)

## Phase 4 — Warehouse & Descriptive Analytics
- [ ] 4.1 ETL: read external olist, validate, clean, load (scripts + services)
- [ ] 4.2 Star schema migrations/tables
- [ ] 4.3 Data quality checks + integrity
- [ ] 4.4 Verified KPIs (documented calc)
- [ ] 4.5 Dashboard pages + filters + charts (Recharts)

## Phase 5 — ML Parallel
- [x] 5.1 ML folder structure complete
- [x] 5.2 EDA/preprocessing (notebooks + src)
- [ ] 5.3 Baselines
- [ ] 5.4 Forecasting, Sales prediction, Segmentation, Anomaly (feasibility)
- [ ] 5.5 Training/eval, model artifacts, metadata
- [ ] 5.6 ML backend interfaces + status

## Phase 6 — AI Business Insights
- [ ] 6.1 Controlled data retrieval (tools/functions)
- [ ] 6.2 LLM integration (Ollama preferred, provider-agnostic)
- [ ] 6.3 Permission-aware context, fallbacks
- [ ] 6.4 Assistant UI + examples

## Phase 7 — Premium Interactions
- [ ] 7.1 Cursor-responsive lighting
- [ ] 7.2 Hover cards
- [ ] 7.3 Chart animations
- [ ] 7.4 Scroll-triggered
- [ ] 7.5 Smooth transitions + reduced-motion + a11y

## Phase 8 — ML Integration
- [ ] 8.1 Wire evaluated models
- [ ] 8.2 Validate schemas, honest statuses

## Phase 9 — Testing & Docs
- [ ] 9.1 Unit/integration/E2E scaffolds + tests
- [ ] 9.2 Run tests, fix
- [ ] 9.3 Complete docs, setup verification

## Phase 10 — GitHub Completion
- [ ] 10.1 Final checks (secrets/dataset)
- [ ] 10.2 Commits, push, report


