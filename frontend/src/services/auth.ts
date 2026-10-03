const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const TOKEN_KEY = 'sem5_token'
const USER_KEY = 'sem5_user'

export interface AuthUser {
  id: number
  username: string
  role: string
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function isAuthRequired(): boolean {
  return import.meta.env.VITE_AUTH_REQUIRED === 'true'
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const body = new URLSearchParams({ username, password })
  const r = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!r.ok) throw new Error(r.status === 401 ? 'Invalid credentials' : `Login failed: ${r.status}`)
  const data = (await r.json()) as { access_token: string; user: AuthUser }
  localStorage.setItem(TOKEN_KEY, data.access_token)
  localStorage.setItem(USER_KEY, JSON.stringify(data.user))
  return data.user
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
