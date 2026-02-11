import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signUp, login, me, logout } from './auth'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('auth api', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('signUp sends payload and returns user', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '1', email: 'u@example.com' }),
    })
    const user = await signUp({
      email: 'u@example.com',
      password: 'secret123',
      password_confirm: 'secret123',
    })
    expect(user).toEqual({ id: '1', email: 'u@example.com' })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/signup'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('signUp throws on error with detail message', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ detail: 'Email already registered' }),
    })
    await expect(
      signUp({
        email: 'u@example.com',
        password: 'x',
        password_confirm: 'x',
      }),
    ).rejects.toThrow('Email already registered')
  })

  it('login returns token response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ access_token: 'tok', token_type: 'bearer' }),
    })
    const res = await login({ email: 'u@example.com', password: 'p' })
    expect(res.access_token).toBe('tok')
  })

  it('login throws on invalid credentials', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ detail: 'Invalid email or password' }),
    })
    await expect(
      login({ email: 'u@example.com', password: 'wrong' }),
    ).rejects.toThrow('Invalid email or password')
  })

  it('me returns null on 401', async () => {
    mockFetch.mockResolvedValue({ status: 401 })
    const user = await me()
    expect(user).toBeNull()
  })

  it('me returns user on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '1', email: 'u@example.com' }),
    })
    const user = await me()
    expect(user).toEqual({ id: '1', email: 'u@example.com' })
  })

  it('logout calls POST logout', async () => {
    mockFetch.mockResolvedValue({ ok: true })
    await logout()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/logout'),
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
