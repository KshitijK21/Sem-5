import { useEffect, useState } from 'react'
import { getSystemStatus, getEtlStatus, type SystemStatus, type EtlStatus } from '@/services/api'
import { getStoredUser, isAdmin } from '@/services/auth'

export default function Admin() {
  const [system, setSystem] = useState<SystemStatus | null>(null)
  const [etl, setEtl] = useState<EtlStatus | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const user = getStoredUser()

  useEffect(() => {
    if (!isAdmin()) {
      setState('ready')
      return
    }
    Promise.all([getSystemStatus(), getEtlStatus()])
      .then(([s, e]) => {
        setSystem(s)
        setEtl(e)
        setState('ready')
      })
      .catch(() => setState('error'))
  }, [])

  if (!isAdmin()) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-red-400 text-sm">
          Admin access required. Signed in as {user?.username ?? 'anonymous'}
          {user ? ` (${user.role})` : ''}.
        </p>
      </div>
    )
  }

  if (state === 'loading') return <div className="text-neutral-400">Loading system status…</div>
  if (state === 'error') return <div className="text-red-400">Could not load admin status.</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin</h1>

      {system && (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-4">
          <h2 className="font-medium mb-3">System</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-neutral-500 text-xs uppercase">App</div>
              {system.app} v{system.version}
            </div>
            <div>
              <div className="text-neutral-500 text-xs uppercase">Env</div>
              {system.env}
            </div>
            <div>
              <div className="text-neutral-500 text-xs uppercase">Database</div>
              {system.database}
            </div>
            <div>
              <div className="text-neutral-500 text-xs uppercase">Auth required</div>
              {String(system.auth_required)}
            </div>
            <div>
              <div className="text-neutral-500 text-xs uppercase">Python</div>
              {system.python}
            </div>
            <div className="col-span-2">
              <div className="text-neutral-500 text-xs uppercase">Platform</div>
              {system.platform}
            </div>
            <div>
              <div className="text-neutral-500 text-xs uppercase">Uptime</div>
              {Math.round(system.uptime_seconds)}s
            </div>
          </div>
        </div>
      )}

      {etl && (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">Warehouse / ETL</h2>
            <span className={`text-xs uppercase ${etl.loaded ? 'text-emerald-400' : 'text-amber-400'}`}>
              {etl.loaded ? 'loaded' : 'not loaded'}
            </span>
          </div>
          <table className="w-full text-sm">
            <thead className="text-neutral-500 text-xs uppercase">
              <tr>
                <th className="text-left py-1">Table</th>
                <th className="text-right py-1">Rows</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(etl.tables).map(([table, count]) => (
                <tr key={table} className="border-t border-neutral-800">
                  <td className="py-1">{table}</td>
                  <td className="text-right">{count == null ? '—' : count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-xs text-neutral-500 mt-2">Source: {etl.olist_dir}</div>
        </div>
      )}
    </div>
  )
}
