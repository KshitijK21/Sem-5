# AI-Powered Business Intelligence and Predictive Analytics Platform (sem-5)

Semester 5 academic project: AI, Data Warehousing & Mining, and Software
Engineering integrated into one working platform. Uses the Olist Brazilian
E-Commerce dataset.

## Quick Status — complete
- Local repo: `%USERPROFILE%\Downloads\sem-5`
- Dataset: `%USERPROFILE%\Downloads\olist` (9 CSVs, never committed)
- Tools: git, node, python, pip, docker. `gh` CLI intentionally not used.
- Phase: all master-prompt phases done (see `docs/CHECKLIST.md`); live status in
  `docs/STATUS.md`.

## Stack (delivered)
- Frontend: React + TypeScript + Vite + TailwindCSS + Recharts + Framer Motion
  (routes code-split; ESLint configured; Vitest + Playwright tests)
- Backend: FastAPI + Pydantic + SQLAlchemy (JWT auth/RBAC, CSVs, admin APIs)
- DB/WH: SQLite for dev, PostgreSQL as documented target (star schema)
- ML: pandas, numpy, scikit-learn, joblib (5 features; real metrics)
- AI: provider-agnostic LLM (Ollama preferred) with deterministic fallback

## Setup (local)
1. Ensure the dataset is at `%USERPROFILE%\Downloads\olist`.
2. Copy `.env.example` to `.env` (optional; sensible dev defaults exist).
3. Frontend: `cd frontend && npm install`
4. Backend: `cd backend && pip install -r requirements.txt`
5. ML: `cd ml && pip install -r requirements.txt`
6. Build the warehouse: `cd backend && python -m app.services.etl`
7. Train the models: `cd ml && python run_all.py`
8. Run the API: `cd backend && python -m uvicorn app.main:app --reload`
9. Run the UI: `cd frontend && npm run dev`

## Testing
```powershell
cd backend; python -m pytest -q          # 48 API tests (incl. RBAC matrix)
cd ml;      python -m pytest -q          # 8 pipeline tests
cd frontend; npm test                    # 13 component tests (Vitest)
cd frontend; npm run e2e                 # 5 browser E2E (Playwright)
cd frontend; npm run lint; npm run build
```

## Roles (two only — see `docs/RBAC.md`)
| Role | Can do | Cannot do |
|---|---|---|
| `analyst` | Dashboard, analytics, ML models + metrics, AI insights, reports & CSV exports | Users, roles, system health, ETL, warehouse/ML admin, settings |
| `admin` | Everything above **plus** platform administration | — |

Seeded dev accounts: `admin` / `admin123`, `analyst` / `analyst123`.
There is no viewer role; legacy `viewer` accounts become `analyst`. Authorization
is enforced by the backend (frontend guards are UX only).

## Docs
See `docs/` (SRS, ARCHITECTURE, DATABASE_DESIGN, KPIs, ML_DOCUMENTATION,
API_DOCUMENTATION, RBAC, TESTING, POSTGRES, SETUP, PROJECT_PLAN, DECISIONS,
STATUS, CHECKLIST).

## Notes
- ML and website were developed in parallel and integrated via documented interfaces.
- AI assistant uses authorized backend data only (no arbitrary SQL).
- `AUTH_REQUIRED` and `VITE_AUTH_REQUIRED` default to `true` (login required).
- No secrets or raw dataset committed.
