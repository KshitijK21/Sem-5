import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getStoredUser,
  getToken,
  isAdmin,
  isAnalyst,
  isAdminOrAnalyst,
  login,
  logout,
} from '@/services/auth'

describe('auth service', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('login stores access token, refresh token, and user', async () => {
    const payload = {
      access_token: 'access-123',
      refresh_token: 'refresh-456',
      token_type: 'bearer',
      user: { id: 1, username: 'admin', role: 'admin' },
    }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => payload }),
    )

    const user = await login('admin', 'admin123')

    expect(user.role).toBe('admin')
    expect(getToken()).toBe('access-123')
    expect(localStorage.getItem('sem5_refresh')).toBe('refresh-456')
    expect(getStoredUser()?.username).toBe('admin')
  })

  it('login throws on invalid credentials', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }),
    )
    await expect(login('admin', 'wrong')).rejects.toThrow('Invalid credentials')
  })

  it('logout clears stored state', async () => {
    const payload = {
      access_token: 'a',
      refresh_token: 'r',
      token_type: 'bearer',
      user: { id: 1, username: 'admin', role: 'admin' },
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => payload }))
    await login('admin', 'admin123')

    logout()

    expect(getToken()).toBeNull()
    expect(getStoredUser()).toBeNull()
    expect(localStorage.getItem('sem5_refresh')).toBeNull()
  })
})

describe('role helpers', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  function store(role: string) {
    localStorage.setItem(
      'sem5_user',
      JSON.stringify({ id: 1, username: role, role }),
    )
  }

  it('identifies the admin role', () => {
    store('admin')
    expect(isAdmin()).toBe(true)
    expect(isAnalyst()).toBe(false)
    expect(isAdminOrAnalyst()).toBe(true)
  })

  it('identifies the analyst role', () => {
    store('analyst')
    expect(isAdmin()).toBe(false)
    expect(isAnalyst()).toBe(true)
    expect(isAdminOrAnalyst()).toBe(true)
  })

  it('ignores unknown/retired roles such as viewer', () => {
    store('viewer')
    expect(getStoredUser()).toBeNull()
    expect(isAdmin()).toBe(false)
    expect(isAnalyst()).toBe(false)
    expect(isAdminOrAnalyst()).toBe(false)
  })

  it('defaults to auth being required', () => {
    vi.unstubAllEnvs()
    expect(import.meta.env.VITE_AUTH_REQUIRED).not.toBe('false')
  })
})
