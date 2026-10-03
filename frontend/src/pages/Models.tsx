import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import {
  getMlStatus,
  getForecast,
  getCustomerSegments,
  getAnomalies,
  predictSales,
  type MlFeature,
  type ForecastPoint,
  type SegmentMetrics,
  type AnomalyMetrics,
  type SalesPredictInput,
} from '@/services/api'

const statusColor: Record<string, string> = {
  available: 'text-emerald-400',
  integration: 'text-amber-400',
  failed: 'text-red-400',
  planned: 'text-neutral-500',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-medium uppercase ${statusColor[status] ?? 'text-neutral-400'}`}>
      {status}
    </span>
  )
}

const fmtMoney = (n: number) =>
  `R$ ${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

export default function Models() {
  const [features, setFeatures] = useState<MlFeature[]>([])
  const [history, setHistory] = useState<ForecastPoint[]>([])
  const [forecast, setForecast] = useState<ForecastPoint[]>([])
  const [segments, setSegments] = useState<SegmentMetrics | null>(null)
  const [anomalies, setAnomalies] = useState<AnomalyMetrics | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  const [form, setForm] = useState<SalesPredictInput>({
    purchase_month: 11,
    purchase_weekday: 4,
    purchase_hour: 15,
    n_items: 2,
    customer_state: 'SP',
    product_category_name: 'bed_bath_table',
  })
  const [prediction, setPrediction] = useState<number | null>(null)
  const [predicting, setPredicting] = useState(false)

  useEffect(() => {
    Promise.all([getMlStatus(), getForecast(30), getCustomerSegments(), getAnomalies()])
      .then(([s, f, seg, an]) => {
        setFeatures(s.features)
        setHistory(f.history_tail)
        setForecast(f.forecast)
        setSegments(seg.metrics)
        setAnomalies(an.metrics)
        setState('ready')
      })
      .catch(() => setState('error'))
  }, [])

  const runPredict = async () => {
    setPredicting(true)
    try {
      const r = await predictSales(form)
      setPrediction(r.predicted_item_revenue)
    } finally {
      setPredicting(false)
    }
  }

  if (state === 'loading') return <div className="text-neutral-400">Loading ML models…</div>
  if (state === 'error') {
    return (
      <div className="text-red-400">
        Could not load ML data. Ensure the backend is running and models are trained
        (`cd ml && python run_all.py`).
      </div>
    )
  }

  const forecastData = [
    ...history.map((p) => ({ date: p.date, history: p.orders, forecast: null as number | null })),
    ...forecast.map((p) => ({ date: p.date, history: null as number | null, forecast: p.orders })),
  ]

  const segmentData = segments
    ? Object.entries(segments.cluster_sizes).map(([cluster, size]) => ({
        cluster: `C${cluster}`,
        size,
      }))
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">ML Models</h1>
        <p className="text-sm text-neutral-500">
          Real models trained on the Olist dataset. Metrics are honest; status reflects local artifacts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <div key={f.name} className="bg-neutral-900/60 p-4 rounded-lg border border-neutral-800">
            <div className="flex items-center justify-between">
              <div className="font-medium capitalize">{f.name.replace(/_/g, ' ')}</div>
              <StatusBadge status={f.status} />
            </div>
            {f.models.map((m) => (
              <div key={m.name} className="text-xs text-neutral-500 mt-2">
                <div>{m.algorithm}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="bg-neutral-900/60 p-4 rounded-lg border border-neutral-800">
        <h2 className="mb-3 font-medium">Daily Orders — History (30d) vs Forecast (30d)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="date" stroke="#666" fontSize={10} minTickGap={40} />
            <YAxis stroke="#666" fontSize={11} />
            <Tooltip contentStyle={{ background: '#171717', border: '1px solid #333' }} />
            <Line type="monotone" dataKey="history" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900/60 p-4 rounded-lg border border-neutral-800">
          <h2 className="mb-3 font-medium">
            Customer Segments{segments ? ` (k=${segments.k}, silhouette ${segments.silhouette})` : ''}
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={segmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="cluster" stroke="#666" fontSize={11} />
              <YAxis stroke="#666" fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip contentStyle={{ background: '#171717', border: '1px solid #333' }} />
              <Bar dataKey="size" fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-neutral-900/60 p-4 rounded-lg border border-neutral-800">
          <h2 className="mb-3 font-medium">
            Anomalous Days{anomalies ? ` (${anomalies.n_anomalies}/${anomalies.n_days})` : ''}
          </h2>
          <div className="max-h-[220px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-neutral-500 text-xs uppercase">
                <tr>
                  <th className="text-left py-1">Date</th>
                  <th className="text-right py-1">Orders</th>
                  <th className="text-right py-1">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {anomalies?.top_anomalies.map((a) => (
                  <tr key={a.date} className="border-t border-neutral-800">
                    <td className="py-1">{a.date}</td>
                    <td className="text-right">{a.orders.toLocaleString()}</td>
                    <td className="text-right">{fmtMoney(a.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900/60 p-4 rounded-lg border border-neutral-800">
        <h2 className="mb-3 font-medium">Sales Prediction (order item revenue)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
          <label className="flex flex-col gap-1">
            Month
            <input
              type="number"
              min={1}
              max={12}
              value={form.purchase_month}
              onChange={(e) => setForm({ ...form, purchase_month: +e.target.value })}
              className="bg-neutral-800 rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            Weekday (0-6)
            <input
              type="number"
              min={0}
              max={6}
              value={form.purchase_weekday}
              onChange={(e) => setForm({ ...form, purchase_weekday: +e.target.value })}
              className="bg-neutral-800 rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            Hour (0-23)
            <input
              type="number"
              min={0}
              max={23}
              value={form.purchase_hour}
              onChange={(e) => setForm({ ...form, purchase_hour: +e.target.value })}
              className="bg-neutral-800 rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            Items
            <input
              type="number"
              min={1}
              value={form.n_items}
              onChange={(e) => setForm({ ...form, n_items: +e.target.value })}
              className="bg-neutral-800 rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            State
            <input
              value={form.customer_state}
              onChange={(e) => setForm({ ...form, customer_state: e.target.value })}
              className="bg-neutral-800 rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            Category
            <input
              value={form.product_category_name}
              onChange={(e) => setForm({ ...form, product_category_name: e.target.value })}
              className="bg-neutral-800 rounded px-2 py-1"
            />
          </label>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={runPredict}
            disabled={predicting}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded px-3 py-1.5 text-sm"
          >
            {predicting ? 'Predicting…' : 'Predict'}
          </button>
          {prediction != null && (
            <span className="text-sm">
              Predicted item revenue: <span className="font-semibold">{fmtMoney(prediction)}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
