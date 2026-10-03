# DECISIONS.md (initial)
## Tech choices
- FE: React+TS+Vite+Tailwind; Recharts; Framer Motion (or equivalent). Keep lightweight.
- BE: FastAPI (typed, OpenAPI). SQLAlchemy.
- DB/WH: PostgreSQL; star schema (facts: orders_items/payments; dims: date/customer/product/seller/location).
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
