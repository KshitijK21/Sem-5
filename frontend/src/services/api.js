import { getRefreshToken, getToken, refreshAccessToken } from './auth';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
function authHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}
async function request(path, init = {}, retry = true) {
    const r = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: { ...init.headers, ...authHeaders() },
    });
    if (r.status === 401 && retry && getRefreshToken()) {
        const token = await refreshAccessToken();
        if (token)
            return request(path, init, false);
    }
    if (!r.ok)
        throw new Error(await errorMessage(r));
    return r.json();
}
/** Turn an error response into a human-readable message (uses `detail`). */
async function errorMessage(r) {
    const fallback = `Request failed: ${r.status}`;
    try {
        const body = (await r.json());
        if (typeof body.detail === 'string' && body.detail.trim())
            return body.detail;
        if (Array.isArray(body.detail)) {
            const msgs = body.detail
                .map((d) => (d && typeof d === 'object' && 'msg' in d ? String(d.msg) : ''))
                .filter(Boolean);
            if (msgs.length)
                return msgs.join('; ');
        }
    }
    catch {
        // non-JSON error body: keep the fallback
    }
    return fallback;
}
function getJson(path) {
    return request(path);
}
export function health() {
    return getJson('/health');
}
export function getKpis(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return getJson(`/api/dashboard/kpis${qs ? `?${qs}` : ''}`);
}
export function getMonthlyRevenue() {
    return getJson('/api/dashboard/monthly-revenue');
}
export function getRevenueByCategory() {
    return getJson('/api/dashboard/revenue-by-category');
}
export function getOrdersByStatus() {
    return getJson('/api/dashboard/orders-by-status');
}
// ---- Analytics ----
export function getAnalyticsSales() {
    return getJson('/api/analytics/sales');
}
export function getAnalyticsOrders() {
    return getJson('/api/analytics/orders');
}
export function getAnalyticsProducts() {
    return getJson('/api/analytics/products');
}
export function getAnalyticsCustomers() {
    return getJson('/api/analytics/customers');
}
export function getAnalyticsSellers() {
    return getJson('/api/analytics/sellers');
}
// ---- ML ----
function postJson(path, body) {
    return request(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}
export function getMlStatus() {
    return getJson('/api/ml/status');
}
function dateQs(f) {
    const qs = new URLSearchParams();
    if (f?.date_from)
        qs.set('date_from', f.date_from);
    if (f?.date_to)
        qs.set('date_to', f.date_to);
    return qs;
}
function withQuestion(qs) {
    const s = qs.toString();
    return s ? `?${s}` : '';
}
export function getForecast(opts = {}) {
    const qs = new URLSearchParams();
    qs.set('periods', String(opts.periods ?? 30));
    qs.set('target', opts.target ?? 'orders');
    const dates = dateQs(opts);
    for (const [k, v] of dates)
        qs.set(k, v);
    return getJson(`/api/ml/forecast?${qs.toString()}`);
}
export function getCustomerSegments(f = {}) {
    return getJson(`/api/ml/segments/customers${withQuestion(dateQs(f))}`);
}
export function getProductSegments(f = {}) {
    return getJson(`/api/ml/segments/products${withQuestion(dateQs(f))}`);
}
export function getAnomalies(f = {}) {
    return getJson(`/api/ml/anomalies${withQuestion(dateQs(f))}`);
}
export function predictSales(input) {
    return postJson('/api/ml/predict/sales', input);
}
export function queryInsights(question, context_limit = 20) {
    return postJson('/api/insights/query', { question, context_limit });
}
// ---- Reports ----
export async function downloadReport(report, params = {}) {
    const qs = new URLSearchParams({ report, ...params }).toString();
    const r = await fetch(`${API_BASE}/api/reports/export?${qs}`, { headers: authHeaders() });
    if (!r.ok)
        throw new Error(`Export failed: ${r.status}`);
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
export function getSystemStatus() {
    return getJson('/api/admin/system/status');
}
export function getEtlStatus() {
    return getJson('/api/admin/data/etl/status');
}
export function getMe() {
    return getJson('/api/users/me');
}
export function listUsers() {
    return getJson('/api/users');
}
export function createUser(username, password, role) {
    return postJson('/api/auth/register', { username, password, role });
}
export function updateUserRole(username, role) {
    return request(`/api/users/${encodeURIComponent(username)}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
    });
}
export function getWarehouseStatus() {
    return getJson('/api/admin/warehouse/status');
}
export function getMlAdminStatus() {
    return getJson('/api/admin/ml/status');
}
export function getSystemSettings() {
    return getJson('/api/admin/settings');
}
