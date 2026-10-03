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
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000

## ML
cd ml && pip install -r requirements.txt
