# SETUP.md

## Prerequisites
- Git, Node.js (v24+), Python 3.14+, Docker (optional)

## Dataset
- Place Olist CSVs at %USERPROFILE%\Downloads\olist (already present)
- Do not commit raw data.

## Environment
- Copy .env.example to .env and adjust values

## Frontend
cd frontend && npm install && npm run dev (http://localhost:5173)

## Backend
cd backend && pip install -r requirements.txt

## Load data (ETL) - run once after install
cd backend && python -m app.services.etl
# Reads from %USERPROFILE%\Downloads\olist and loads the warehouse into
# SQLite by default (backend/sem5.db). Set DATABASE_URL for PostgreSQL.

## Run backend
cd backend && uvicorn app.main:app --reload --port 8000
# Health: http://localhost:8000/health
# Docs:   http://localhost:8000/docs

## ML - install and train
cd ml && pip install -r requirements.txt
python run_all.py
# Builds processed datasets, trains 5 models, writes metrics metadata to
# ml/models/*.metadata.json (large .joblib artifacts are gitignored).

## Tests / quality
cd backend  && python -m pytest -q                    # 26 API tests
cd ml       && python -m pytest -q                    # 8 pipeline tests
cd frontend && npm test && npm run lint && npm run build
cd frontend && npm run e2e:install && npm run e2e     # 3 browser E2E tests
