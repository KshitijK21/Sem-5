import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import AccessDenied from '@/components/AccessDenied'
import { getMe } from '@/services/api'
import { getToken, getStoredUser, isAdmin, isAuthRequired, setStoredUser } from '@/services/auth'

type State = 'checking' | 'allowed' | 'denied'

/**
 * Administration guard.
 *
 * The backend is authoritative: we ask /api/users/me which role the server
 * actually sees, reconcile the cached copy, and only render admin content once
 * the answer is known (no restricted content flash while loading).
 */
export default function RequireAdmin() {
  const location = useLocation()
  const [state, setState] = useState<State>('checking')
  const needsLogin = isAuthRequired() && !getToken()

  useEffect(() => {
    if (needsLogin) return undefined
    let cancelled = false

    getMe()
      .then(({ user }) => {
        if (cancelled) return
        setStoredUser(user)
        setState(user.role === 'admin' ? 'allowed' : 'denied')
      })
      .catch(() => {
        if (cancelled) return
        // Backend unreachable / error: fall back to the locally cached role.
        setState(isAdmin() ? 'allowed' : 'denied')
      })

    return () => {
      cancelled = true
    }
  }, [needsLogin])

  if (needsLogin) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (state === 'checking') {
    return <div className="text-neutral-500 text-sm">Checking access…</div>
  }

  if (state === 'denied') {
    return <AccessDenied />
  }

  if (!getStoredUser()) {
    return <AccessDenied />
  }

  return <Outlet />
}
