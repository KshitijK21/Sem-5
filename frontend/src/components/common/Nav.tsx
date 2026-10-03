import { Link } from 'react-router-dom'

export default function Nav() {
  return (
    <nav className="flex gap-4 text-sm">
      <Link to="/">Home</Link>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/analytics">Analytics</Link>
      <Link to="/models">ML Models</Link>
      <Link to="/insights">AI Insights</Link>
    </nav>
  )
}
