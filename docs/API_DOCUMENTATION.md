# API_DOCUMENTATION.md (contracts draft)

## Base
- Base URL: http://localhost:8000/api
- Auth: token-based (JWT) or session; implement secure storage. Backend enforces RBAC.

## Endpoints (proposed, minimal but aligned)
- Auth: POST /auth/login, POST /auth/logout, POST /auth/register? (role-based; admin-only creating users or open per policy)
- Users: GET/PUT/PATCH /users/me, GET /admin/users (Admin)
- Dashboard: GET /dashboard/kpis?date_from&date_to&category&state&seller&order_status
- Analytics: /analytics/sales, /analytics/orders, /analytics/customers, /analytics/products, /analytics/sellers, /analytics/delivery (GET with filters)
- Insights (AI): POST /insights/query with {question, filters, context_limit}; returns answer + sources (authorized data only)
- ML: GET /ml/status (per feature: planned/training/testing/integration/available/failed), POST /ml/forecast (if available), GET /ml/segments, POST /ml/predict (sales)
- Reports: GET /reports/export?type=csv (permission-aware)
- Admin: /admin/system/status, /admin/data/etl/status (Admin)

## Contracts
- All responses: consistent error shape {error:{code,message,details?}}
- Pagination where large results.
- Filters validated; no arbitrary SQL from client/LLM.
- AI uses controlled backend functions (tools) only.
- ML endpoints return 503/appropriate if not available with honest status.

## Security
- RBAC enforced backend; CORS restricted; input validation; no secrets exposed.
