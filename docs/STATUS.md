## Status vs Master Prompt

### Done (so far)
- Phase 1 (Env & Repo)
  - [x] Environment inspected (OS, Downloads, olist found, tools)
  - [x] Local project dir created at Downloads/sem-5
  - [x] Git initialized; remote set to https://github.com/KshitijK21/Sem-5.git; pushed to main
  - [x] Project structure created (frontend/backend/ml/database/docs/scripts/tests/.github/workflows)
  - [x] .gitignore, .env.example, README.md written
- Phase 2 (Dataset + Contracts) - started
  - [x] Olist inventory (9 CSVs) with headers/row counts
  - [x] Dataset profiling: nulls per file + orders date range (2016-09-04 to 2018-11-12)
  - [x] Draft docs: DATASET_SUMMARY, DATA_DICTIONARY_DRAFT, DATASET_PROFILE, DECISIONS, RBAC, PROJECT_PLAN

### In Progress
- Phase 2 continued: warehouse schema (facts/dims, grain), API contracts, ML I/O schemas (model metadata/status). No code yet for FE/BE/ML models; focused on docs/contracts.

### Not started
- Phase 3 FE/BE core (design system, FastAPI skeleton, React+Vite+TS+Tailwind, auth/RBAC implementation)
- Phase 4 WH+ETL implementation + KPIs + dashboards
- Phase 5 ML parallel (EDA, preprocessing, baselines, models, artifacts)
- Phase 6 AI Insights (Ollama/provider-agnostic, controlled tools)
- Phase 7 Premium interactions
- Phase 8 ML integration
- Phase 9 Testing + full docs
- Phase 10 Final checks

### Blockers
- GitHub CLI not used (as requested); repo connected via HTTPS (push succeeded). No auth issues reported after setting correct username.

### Parallel readiness
- Contracts (API + ML I/O + warehouse) defined before FE/ML implementation - next priority per prompt.
