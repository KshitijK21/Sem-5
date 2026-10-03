import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getStoredUser, getToken, login, logout } from '@/services/auth'

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
