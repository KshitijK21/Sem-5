import { useEffect, useState } from 'react'
import { health } from '@/services/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const sample = [
  { name: 'Jan', orders: 400 },
  { name: 'Feb', orders: 300 },
  { name: 'Mar', orders: 500 },
  { name: 'Apr', orders: 200 },
  { name: 'May', orders: 350 },
]

export default function Dashboard() {
  const [h, setH] = useState<string>('checking')
  useEffect(() => {
    health().then(r => setH(r.status)).catch(() => setH('error'))
  }, [])
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="text-neutral-400">Backend health: {h}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-neutral-900/60 p-4 rounded-lg border border-neutral-800">
          <h2 className="mb-2 font-medium">Sample Orders Trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={sample}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-neutral-900/60 p-4 rounded-lg border border-neutral-800">
          <h2 className="mb-2 font-medium">Sample Orders Bar</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sample}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Bar dataKey="orders" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="text-neutral-400 text-sm">Charts are placeholder; real data from Olist via APIs after ETL.</p>
    </div>
  )
}
