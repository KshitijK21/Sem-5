# DECISIONS.md (initial)
## Tech choices
- FE: React+TS+Vite+Tailwind; Recharts; Framer Motion (or equivalent). Keep lightweight.
- BE: FastAPI (typed, OpenAPI). SQLAlchemy.
- DB/WH: PostgreSQL is the target; star schema (facts: order_items/orders; dims: date/customer/product/seller).
  - Development default is SQLite (`DATABASE_URL` unset -> `sqlite:///./sem5.db`) so the project runs on a
    student laptop with zero setup. Set `DATABASE_URL` to PostgreSQL to use the production target.
  - ETL is idempotent (clears and reloads warehouse tables) and rebuilds tables via SQLAlchemy.
  - Note: the monthly-revenue query uses SQLite `strftime`; a Postgres port would use `to_char` (documented).
- ML: sklearn + pandas/numpy; statsmodels if time-series needs; serialize models (joblib/pkl). 
- AI: Ollama (local) preferred; provider-agnostic interface; no arbitrary SQL; permission-aware context.
- Infra: Docker Compose optional but compatible; avoid unnecessary complexity.

## Data/metrics
- Revenue definition: sum of order_items.price (item value). Total order value can be cross-checked against order_payments sum. Document assumptions. No profit unless derived; avoid live sales claims.
- KPIs only when verifiably computable from Olist.
- Treat predictions as ML outputs only when models trained+evaluated; otherwise show "status: planned/training/integration".
- Do not fabricate metrics/accuracy.

## UX/Effects
- Restraint: cursor lighting, hover cards, chart animations, scroll-triggered, smooth transitions. prefers-reduced-motion respected. Touch-friendly; no cursor takeover that breaks UX.
- Liquid cursor: subtle, non-blocking, accessibility-first.

## Security/RBAC
- Enforce authZ on backend. Hash passwords. No secrets in repo. LLM gets controlled tools only.
- Roles: Admin, Analyst, Viewer (document matrix in docs/RBAC.md).

## Parallel dev
- ML starts in P2 alongside contracts; interfaces fixed early. Website usable without ML/LLM.
