import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  getAnalyticsSales,
  getAnalyticsOrders,
  getAnalyticsProducts,
  getAnalyticsCustomers,
  getAnalyticsSellers,
  type MonthlyPoint,
  type StatusPoint,
  type CategoryPoint,
  type PlannedResponse,
} from '@/services/api'

const fmtMoney = (n: number) =>
  `R$ ${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

export default function Analytics() {
  const [monthly, setMonthly] = useState<MonthlyPoint[]>([])
  const [statuses, setStatuses] = useState<StatusPoint[]>([])
  const [cats, setCats] = useState<CategoryPoint[]>([])
  const [customers, setCustomers] = useState<PlannedResponse | null>(null)
  const [sellers, setSellers] = useState<PlannedResponse | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    Promise.all([
      getAnalyticsSales(),
      getAnalyticsOrders(),
      getAnalyticsProducts(),
      getAnalyticsCustomers(),
      getAnalyticsSellers(),
    ])
      .then(([s, o, p, c, se]) => {
        setMonthly(s.monthly_revenue)
        setStatuses(o.by_status)
        setCats(p.revenue_by_category)
        setCustomers(c)
        setSellers(se)
        setState('ready')
      })
      .catch(() => setState('error'))
  }, [])

  if (state === 'loading') return <div className="text-neutral-400">Loading analytics…</div>
  if (state === 'error') {
    return (
      <div className="text-red-400">
        Could not load analytics. Ensure the backend is running and the ETL has been executed.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-neutral-500">Historical analysis from the Olist warehouse.</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900/60 p-4 rounded-lg border border-neutral-800">
          <h2 className="mb-3 font-medium">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={statuses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="status" stroke="#666" fontSize={10} angle={-20} textAnchor="end" height={60} />
              <YAxis stroke="#666" fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip contentStyle={{ background: '#171717', border: '1px solid #333' }} />
              <Bar dataKey="orders" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-neutral-900/60 p-4 rounded-lg border border-neutral-800">
          <h2 className="mb-3 font-medium">Top Categories by Revenue</h2>
          <ResponsiveContainer width="100%" height={240}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-neutral-900/60 p-4 rounded-lg border border-neutral-800">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Customer Analytics</h2>
            <span className="text-xs uppercase text-neutral-500">{customers?.status}</span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">{customers?.message}</p>
        </div>
        <div className="bg-neutral-900/60 p-4 rounded-lg border border-neutral-800">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Seller Analytics</h2>
            <span className="text-xs uppercase text-neutral-500">{sellers?.status}</span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">{sellers?.message}</p>
        </div>
      </div>
    </div>
  )
}
