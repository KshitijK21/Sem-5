import { useEffect, useState } from 'react'
import { getSystemStatus, type SystemStatus } from '@/services/api'

export default function AdminHealth() {
  const [system, setSystem] = useState<SystemStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getSystemStatus()
      .then(setSystem)
      .catch(() => setError('Could not load system health.'))
  }, [])

  if (error) return <div className="text-red-400 text-sm">{error}</div>
  if (!system) return <div className="text-neutral-400 text-sm">Loading system health…</div>

  return (
    <div className="space-y-4">
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

      <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 text-sm text-neutral-500">
        Secrets (JWT signing key, database credentials, environment values) are deliberately not
        exposed here.
      </div>
    </div>
  )
}
