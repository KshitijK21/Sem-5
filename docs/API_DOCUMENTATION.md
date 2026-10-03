# API_DOCUMENTATION.md

## Base
- Base URL: `http://localhost:8000`
- Auth: JWT Bearer. Obtained via `POST /api/auth/login` (OAuth2 form).
- Backend enforces RBAC. Set `AUTH_REQUIRED=true` to require a token on all
  protected routers.

## Auth — `/api/auth`
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/login` | public | form: username, password -> `{access_token, token_type, user}` |
| GET | `/me` | any authenticated | current user |
| GET | `/admin/users` | admin | list users (no hashes) |

## Dashboard — `/api/dashboard`
| Method | Path | Notes |
|---|---|---|
| GET | `/kpis` | filters: date_from, date_to, order_status |
| GET | `/monthly-revenue` | 24 monthly points |
| GET | `/revenue-by-category` | top categories |
| GET | `/orders-by-status` | order status counts |

## Analytics — `/api/analytics`
| Method | Path | Notes |
|---|---|---|
| GET | `/sales` | `{monthly_revenue}` |
| GET | `/orders` | `{by_status}` |
| GET | `/products` | `{revenue_by_category}` |
| GET | `/customers` | planned (repeat rate, geography) |
| GET | `/sellers` | planned |
| GET | `/delivery` | delivery KPIs |

## ML — `/api/ml`
| Method | Path | Notes |
|---|---|---|
| GET | `/status` | per-feature real status + metrics |
| GET | `/models/{name}` | full metadata for one model |
| GET | `/forecast?periods=N` | recursive daily order forecast (1–90) |
| GET | `/segments/customers` | cluster sizes/means |
| GET | `/anomalies` | anomaly metrics + top days |
| POST | `/predict/sales` | order item revenue prediction |

## Insights (AI) — `/api/insights`
| Method | Path | Notes |
|---|---|---|
| POST | `/query` | `{question, filters?, context_limit?}`; returns answer + sources; controlled tools only |

## Contracts
- Consistent error shape: `{detail: ...}` (FastAPI default) or `{error:{code,message}}`.
- Filters validated; no arbitrary SQL from client/LLM.
- ML endpoints return `503` if the artifact is unavailable, with honest status.

## Security
- RBAC enforced backend; CORS restricted to the frontend origin; input validation.
- Passwords stored as bcrypt hashes only; no secrets exposed in responses/logs.
