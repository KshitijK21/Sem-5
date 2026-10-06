import { useState } from 'react'
import { downloadReport } from '@/services/api'
import { getStoredUser } from '@/services/auth'

const REPORTS = [
  { name: 'kpis', label: 'KPIs', minRole: 'Both roles' },
  { name: 'orders_by_status', label: 'Orders by Status', minRole: 'Both roles' },
  { name: 'monthly_revenue', label: 'Monthly Revenue', minRole: 'Both roles' },
  { name: 'revenue_by_category', label: 'Revenue by Category', minRole: 'Both roles' },
]

export default function Reports() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const user = getStoredUser()

  const run = async (report: string) => {
    setError(null)
    try {
      const params: Record<string, string> = {}
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      await downloadReport(report, params)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-neutral-500">
          Export warehouse data as CSV. All reports are available to both roles (admin and analyst).
        </p>
      </div>

      <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <label className="flex flex-col gap-1">
            Date from (optional)
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-neutral-800 rounded px-3 py-1.5"
            />
          </label>
          <label className="flex flex-col gap-1">
            Date to (optional)
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-neutral-800 rounded px-3 py-1.5"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {REPORTS.map((r) => (
            <button
              key={r.name}
              onClick={() => run(r.name)}
              className="bg-blue-600 hover:bg-blue-500 rounded px-3 py-2 text-sm text-left"
            >
              <div className="font-medium">{r.label}</div>
              <div className="text-xs text-blue-100/70">{r.minRole}+</div>
            </button>
          ))}
        </div>

        {user && (
          <div className="text-xs text-neutral-500">
            Signed in as <span className="text-neutral-300">{user.username}</span> ({user.role})
          </div>
        )}
        {error && <div className="text-sm text-red-400">{error}</div>}
      </div>

      <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 text-sm text-neutral-400">
        CSV export uses the same verified warehouse aggregates as the dashboards. No fabricated
        values are written.
      </div>
    </div>
  )
}
