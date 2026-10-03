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
  getKpis,
  getMonthlyRevenue,
  getRevenueByCategory,
  type Kpis,
  type MonthlyPoint,
  type CategoryPoint,
} from '@/services/api'

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-neutral-900/60 p-4 rounded-lg border border-neutral-800">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {hint && <div className="text-xs text-neutral-500 mt-1">{hint}</div>}
    </div>
  )
}

const fmtMoney = (n: number) =>
  `R$ ${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

export default function Dashboard() {
  const [kpis, setKpis] = useState<Kpis | null>(null)
  const [monthly, setMonthly] = useState<MonthlyPoint[]>([])
  const [cats, setCats] = useState<CategoryPoint[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    Promise.all([getKpis(), getMonthlyRevenue(), getRevenueByCategory()])
      .then(([k, m, c]) => {
        setKpis(k)
        setMonthly(m.series)
        setCats(c.series)
        setState('ready')
      })
      .catch(() => setState('error'))
  }, [])

  if (state === 'loading') {
    return <div className="text-neutral-400">Loading verified KPIs from Olist data…</div>
  }
  if (state === 'error') {
    return (
      <div className="text-red-400">
        Could not load data. Ensure the backend is running and the ETL has been executed.
      </div>
    )
  }

  const k = kpis!.kpis

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-neutral-500">
          Historical Olist dataset (Sep 2016 – Oct 2018). Revenue = sum of order item prices.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard label="Total Orders" value={k.total_orders.toLocaleString()} />
        <KpiCard label="Total Revenue" value={fmtMoney(k.total_revenue)} hint="sum of item prices" />
        <KpiCard label="Avg Order Value" value={fmtMoney(k.avg_order_value)} />
        <KpiCard label="Unique Customers" value={k.unique_customers.toLocaleString()} />
        <KpiCard label="Items Sold" value={k.items_sold.toLocaleString()} />
        <KpiCard label="Active Sellers" value={k.active_sellers.toLocaleString()} />
        <KpiCard
          label="Avg Review"
          value={k.avg_review_score != null ? k.avg_review_score.toFixed(2) : '—'}
          hint="out of 5"
        />
        <KpiCard
          label="Avg Delivery"
          value={k.avg_delivery_days != null ? `${k.avg_delivery_days.toFixed(1)} days` : '—'}
          hint="delivered only"
        />
        <KpiCard label="Freight Total" value={fmtMoney(k.total_freight)} />
        <KpiCard label="Products" value={k.products_sold.toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900/60 p-4 rounded-lg border border-neutral-800">
          <h2 className="mb-3 font-medium">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="period" stroke="#666" fontSize={11} />
              <YAxis stroke="#666" fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip
                formatter={(v: number) => fmtMoney(v)}
                contentStyle={{ background: '#171717', border: '1px solid #333' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-neutral-900/60 p-4 rounded-lg border border-neutral-800">
          <h2 className="mb-3 font-medium">Top Categories by Revenue</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="category" stroke="#666" fontSize={10} angle={-30} textAnchor="end" height={70} />
              <YAxis stroke="#666" fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip
                formatter={(v: number) => fmtMoney(v)}
                contentStyle={{ background: '#171717', border: '1px solid #333' }}
              />
              <Bar dataKey="revenue" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
