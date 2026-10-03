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

## ML
cd ml && pip install -r requirements.txt
