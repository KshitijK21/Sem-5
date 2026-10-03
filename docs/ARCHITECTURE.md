# ARCHITECTURE.md (draft)

## Overview
React+TS+Vite+Tailwind (FE), FastAPI+SQLAlchemy (BE), PostgreSQL (warehouse), scikit-learn/statsmodels (ML), Ollama/provider-agnostic (AI). External Olist dataset.

## Data Flow
1. Raw CSVs in %USERPROFILE%\Downloads\olist (read-only)
2. ETL validates/cleans -> warehouse (star schema)
3. APIs serve aggregated KPIs/analytics
4. FE renders dashboards/charts
5. ML interfaces return honest status; predictions only when available
6. AI uses controlled backend tools with RBAC

## Principles
- Contracts first (API/ML I/O)
- ML/LLM optional
- Backend-enforced authZ
- No secrets in repo
- Parallel dev
