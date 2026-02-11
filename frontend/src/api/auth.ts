import { getApiBaseUrl } from './config'

const base = () => getApiBaseUrl() + '/auth'

const TOKEN_STORAGE_KEY = 'toolme_access_token'

export type SignUpInput = {
  email: string
  password: string
  password_confirm: string
}

export type LoginInput = {
  email: string
  password: string
}

export type TokenResponse = {
  access_token: string
  token_type: string
}

function parseErrorResponse(res: Response, body: Record<string, unknown>): string {
  const detail = body.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((d: { msg?: string }) => d.msg ?? JSON.stringify(d)).join(', ')
  }
  return `Request failed: ${res.status}`
}

/**
 * Create a new account. Backend must implement POST /auth/signup.
 */
export async function signUp(input: SignUpInput): Promise<{ id: string; email: string }> {
  const res = await fetch(`${base()}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: input.email.trim(),
      password: input.password,
      password_confirm: input.password_confirm,
    }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>
    throw new Error(parseErrorResponse(res, body))
  }
  return res.json()
}

/**
 * Log in with email and password. Returns JWT and stores it in localStorage.
 */
export async function login(input: LoginInput): Promise<TokenResponse> {
  const res = await fetch(`${base()}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: input.email.trim(), password: input.password }),
  })
  const body = await res.json().catch(() => ({})) as Record<string, unknown>
  if (!res.ok) {
    throw new Error(parseErrorResponse(res, body))
  }
  const data = body as TokenResponse
  setStoredToken(data.access_token)
  return data
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

/**
 * Decode JWT payload without verification (for display only; backend verifies).
 */
export function decodeTokenPayload(token: string): { sub?: string; email?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    return payload
  } catch {
    return null
  }
}
