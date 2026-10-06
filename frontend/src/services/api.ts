import { getRefreshToken, getToken, refreshAccessToken, type Role } from './auth'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...(init.headers as Record<string, string>), ...authHeaders() },
  })
  if (r.status === 401 && retry && getRefreshToken()) {
    const token = await refreshAccessToken()
    if (token) return request<T>(path, init, false)
  }
  if (!r.ok) throw new Error(`Request failed: ${r.status}`)
  return r.json() as Promise<T>
}

function getJson<T>(path: string): Promise<T> {
  return request<T>(path)
}

export function health() {
  return getJson<{ status: string }>('/health')
}

export interface Kpis {
  filters: { date_from: string | null; date_to: string | null; order_status: string | null }
  kpis: {
    total_orders: number
    total_revenue: number
    total_freight: number
    avg_order_value: number
    unique_customers: number
    items_sold: number
    products_sold: number
    active_sellers: number
    avg_review_score: number | null
    avg_delivery_days: number | null
  }
}

export function getKpis(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString()
  return getJson<Kpis>(`/api/dashboard/kpis${qs ? `?${qs}` : ''}`)
}

export interface MonthlyPoint {
  period: string
  orders: number
  revenue: number
}

export function getMonthlyRevenue() {
  return getJson<{ series: MonthlyPoint[] }>('/api/dashboard/monthly-revenue')
}

export interface CategoryPoint {
  category: string
  revenue: number
  items: number
}

export function getRevenueByCategory() {
  return getJson<{ series: CategoryPoint[] }>('/api/dashboard/revenue-by-category')
}

export interface StatusPoint {
  status: string
  orders: number
}

export function getOrdersByStatus() {
  return getJson<{ series: StatusPoint[] }>('/api/dashboard/orders-by-status')
}

// ---- Analytics ----

export function getAnalyticsSales() {
  return getJson<{ monthly_revenue: MonthlyPoint[] }>('/api/analytics/sales')
}

export function getAnalyticsOrders() {
  return getJson<{ by_status: StatusPoint[] }>('/api/analytics/orders')
}

export function getAnalyticsProducts() {
  return getJson<{ revenue_by_category: CategoryPoint[] }>('/api/analytics/products')
}

export interface PlannedResponse {
  status: string
  message: string
}

export function getAnalyticsCustomers() {
  return getJson<PlannedResponse>('/api/analytics/customers')
}

export function getAnalyticsSellers() {
  return getJson<PlannedResponse>('/api/analytics/sellers')
}

// ---- ML ----

function postJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export interface MlModel {
  name: string
  algorithm: string | null
  trained_at: string | null
  metrics: Record<string, unknown> | null
  artifact_available: boolean
}

export interface MlFeature {
  name: string
  status: string
  models: MlModel[]
}

export function getMlStatus() {
  return getJson<{ features: MlFeature[] }>('/api/ml/status')
}

export interface ForecastPoint {
  date: string
  orders: number
}

export function getForecast(periods = 30) {
  return getJson<{ history_tail: ForecastPoint[]; forecast: ForecastPoint[] }>(
    `/api/ml/forecast?periods=${periods}`,
  )
}

export interface SegmentMetrics {
  k: number
  silhouette: number
  cluster_sizes: Record<string, number>
  cluster_means: Record<string, Record<string, number>>
}

export function getCustomerSegments() {
  return getJson<{ metrics: SegmentMetrics; status: string }>('/api/ml/segments/customers')
}

export interface AnomalyMetrics {
  contamination: number
  n_days: number
  n_anomalies: number
  top_anomalies: Array<{ date: string; orders: number; revenue: number; score: number }>
}

export function getAnomalies() {
  return getJson<{ metrics: AnomalyMetrics; status: string }>('/api/ml/anomalies')
}

export interface SalesPredictInput {
  purchase_month: number
  purchase_weekday: number
  purchase_hour: number
  n_items: number
  customer_state: string
  product_category_name: string
}

export function predictSales(input: SalesPredictInput) {
  return postJson<{ predicted_item_revenue: number; currency: string }>(
    '/api/ml/predict/sales',
    input,
  )
}

// ---- AI Insights ----

export interface InsightsResponse {
  answer: string
  sources: string[]
  status: string
  provider: string | null
  role: string
}

export function queryInsights(question: string, context_limit = 20) {
  return postJson<InsightsResponse>('/api/insights/query', { question, context_limit })
}

// ---- Reports ----

export async function downloadReport(report: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ report, ...params }).toString()
  const r = await fetch(`${API_BASE}/api/reports/export?${qs}`, { headers: authHeaders() })
  if (!r.ok) throw new Error(`Export failed: ${r.status}`)
  const blob = await r.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${report}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ---- Admin ----

export interface SystemStatus {
  app: string
  version: string
  env: string
  auth_required: boolean
  database: string
  python: string
  platform: string
  uptime_seconds: number
}

export function getSystemStatus() {
  return getJson<SystemStatus>('/api/admin/system/status')
}

export interface EtlStatus {
  loaded: boolean
  tables: Record<string, number | null>
  olist_dir: string
}

export function getEtlStatus() {
  return getJson<EtlStatus>('/api/admin/data/etl/status')
}

// ---- Users ----

export interface PublicUser {
  id: number
  username: string
  role: Role
}

export function getMe() {
  return getJson<{ user: PublicUser }>('/api/users/me')
}

export function listUsers() {
  return getJson<{ users: PublicUser[] }>('/api/users')
}

export function createUser(username: string, password: string, role: Role) {
  return postJson<{ user: PublicUser }>('/api/auth/register', { username, password, role })
}

export function updateUserRole(username: string, role: Role) {
  return request<{ user: PublicUser }>(`/api/users/${encodeURIComponent(username)}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  })
}

// ---- Administration ----

export interface WarehouseStatus {
  dialect: string
  schema_tables: string[]
  warehouse_tables: Record<string, number | null>
  expected_tables: number
  loaded_tables: number
  total_rows: number
  complete: boolean
  source: string
}

export function getWarehouseStatus() {
  return getJson<WarehouseStatus>('/api/admin/warehouse/status')
}

export interface ArtifactInfo {
  file: string
  size_bytes: number
  modified_at: string
}

export interface MlAdminStatus {
  models_dir: string
  artifacts: ArtifactInfo[]
  artifact_count: number
  metadata_entries: number
  features: MlFeature[]
  data_dir_exists: boolean
  retraining: string
}

export function getMlAdminStatus() {
  return getJson<MlAdminStatus>('/api/admin/ml/status')
}

export interface SystemSettings {
  app: string
  version: string
  env: string
  auth_required: boolean
  access_token_expire_minutes: number
  refresh_token_expire_minutes: number
  roles: Role[]
  llm: { enabled: boolean; provider: string; timeout_seconds: number }
  dataset: string
  reports: string[]
  secrets_exposed: boolean
}

export function getSystemSettings() {
  return getJson<SystemSettings>('/api/admin/settings')
}
