const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function health() {
  const r = await fetch(${API_BASE}/health)
  return r.json()
}
