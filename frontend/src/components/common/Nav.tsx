import { Link, useNavigate } from 'react-router-dom'
import { getStoredUser, isAdmin, logout } from '@/services/auth'

export default function Nav() {
  const user = getStoredUser()
  const navigate = useNavigate()

  const signOut = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="flex items-center gap-4 text-sm">
      <Link to="/">Home</Link>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/analytics">Analytics</Link>
      <Link to="/models">ML Models</Link>
      <Link to="/reports">Reports</Link>
      {isAdmin() && <Link to="/admin">Admin</Link>}
      <Link to="/insights">AI Insights</Link>
      {user ? (
        <span className="flex items-center gap-2 text-neutral-400">
          <span className="text-neutral-200">{user.username}</span>
          <span className="text-xs uppercase text-neutral-500">{user.role}</span>
          <button onClick={signOut} className="text-red-400 hover:text-red-300">
            Sign out
          </button>
        </span>
      ) : (
        <Link to="/login" className="text-blue-400">
          Sign in
        </Link>
      )}
    </nav>
  )
}
