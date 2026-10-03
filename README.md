# AI-Powered Business Intelligence and Predictive Analytics Platform (sem-5)

Semester 5 academic project: AI, Data Warehousing & Mining, Software Engineering integrated into one working platform. Uses Olist Brazilian E-Commerce dataset.

## Quick Status
- Local repo path: %USERPROFILE%\Downloads\sem-5
- Dataset: %USERPROFILE%\Downloads\olist (9 CSVs)
- Tools: git, node, python, pip, docker available; gh CLI not installed (auth blocked)
- Phase: 1-2 in progress (setup + dataset inspection)

## Stack (planned)
- Frontend: React + TypeScript + Vite + TailwindCSS + Recharts + Framer Motion
- Backend: FastAPI + Pydantic + SQLAlchemy
- DB/WH: PostgreSQL (star schema)
- ML: pandas, numpy, scikit-learn, matplotlib, statsmodels (as needed)
- AI: Local LLM via Ollama (fallback: provider-agnostic)

## Setup (local)
1. Ensure dataset at %USERPROFILE%\Downloads\olist
2. Create .env from .env.example
3. Install frontend deps: cd frontend && npm install
4. Install backend deps: cd backend && pip install -r requirements.txt (or use venv)
5. Install ml deps: cd ml && pip install -r requirements.txt
6. Start services (docker-compose or run individually)

## Docs
See docs/ (SRS, ARCHITECTURE, DATABASE_DESIGN, ML_DOCUMENTATION, API_DOCUMENTATION, RBAC, TESTING, SETUP, PROJECT_PLAN, DECISIONS)

## Notes
- ML and website developed in parallel.
- AI assistant uses authorized backend data only (no arbitrary SQL).
- No secrets committed.
