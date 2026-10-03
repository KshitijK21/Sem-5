import { useEffect, useState } from 'react'
import { health } from '@/services/api'

export default function Dashboard() {
  const [h, setH] = useState<string>('checking')
  useEffect(() => {
    health().then(r => setH(r.status)).catch(() => setH('error'))
  }, [])
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
      <p className="text-neutral-400 mb-4">Backend health: {h}</p>
      <p className="text-neutral-400">KPIs from Olist will load after ETL + APIs.</p>
    </div>
  )
}
