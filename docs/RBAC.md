# RBAC.md (draft)
## Roles
- Admin: manage users/roles, system health, data processing status, view all analytics, ML status, settings (documented).
- Analyst: dashboards/analytics, filters, predictions/segments, reports, AI insights, model performance.
- Viewer: permitted dashboards/reports/filters, AI insights within limits.

## Enforcement
- Backend authorization required for all protected actions (not FE-only).
- Permissions checked per endpoint/resource; LLM respects same permissions.
- Principle of least privilege.
