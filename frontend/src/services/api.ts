import { getToken } from './auth'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function getJson<T>(path: string): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, { headers: authHeaders() })
  if (!r.ok) throw new Error(`Request failed: ${r.status}`)
  return r.json()
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

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`Request failed: ${r.status}`)
  return r.json()
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
