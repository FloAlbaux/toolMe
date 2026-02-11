import { getApiBaseUrl } from './config'

const base = () => getApiBaseUrl() + '/auth'

const fetchOpts: RequestInit = {
  credentials: 'include', // Send/receive HTTP-only cookie (E-2)
}

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

export type MeResponse = {
  id: string
  email: string
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
 * Create a new account. Backend may return verification_link in dev when SMTP is not configured.
 */
export async function signUp(input: SignUpInput): Promise<{ id: string; email: string; verification_link?: string }> {
  const res = await fetch(`${base()}/signup`, {
    ...fetchOpts,
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
 * Log in with email and password. Backend sets HTTP-only cookie (E-2); token is not stored in JS.
 */
export async function login(input: LoginInput): Promise<TokenResponse> {
  const res = await fetch(`${base()}/login`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: input.email.trim(), password: input.password }),
  })
  const body = await res.json().catch(() => ({})) as Record<string, unknown>
  if (!res.ok) {
    throw new Error(parseErrorResponse(res, body))
  }
  return body as TokenResponse
}

/**
 * Return current user from session cookie. 401 if not authenticated.
 */
export async function me(): Promise<MeResponse | null> {
  const res = await fetch(`${base()}/me`, { ...fetchOpts })
  if (res.status === 401) return null
  if (!res.ok) throw new Error(`Failed to get user: ${res.status}`)
  return res.json()
}

/**
 * Clear auth cookie (must be called with credentials so cookie is sent).
 */
export async function logout(): Promise<void> {
  await fetch(`${base()}/logout`, { ...fetchOpts, method: 'POST' })
}

/**
 * Request password reset email. Backend may return reset_link in dev when SMTP is not configured.
 */
export async function forgotPassword(email: string): Promise<{ detail: string; reset_link?: string }> {
  const res = await fetch(`${base()}/forgot-password`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() }),
  })
  const body = await res.json().catch(() => ({})) as Record<string, unknown>
  if (!res.ok) throw new Error(parseErrorResponse(res, body))
  return body as { detail: string; reset_link?: string }
}

/**
 * Set new password with reset token. Returns token response and sets cookie.
 */
export async function resetPassword(token: string, newPassword: string): Promise<TokenResponse> {
  const res = await fetch(`${base()}/reset-password`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password: newPassword }),
  })
  const body = await res.json().catch(() => ({})) as Record<string, unknown>
  if (!res.ok) throw new Error(parseErrorResponse(res, body))
  return body as TokenResponse
}

/**
 * Activate account with token from verification email. Backend sets auth cookie on success.
 */
export async function verifyEmail(token: string): Promise<TokenResponse> {
  const res = await fetch(`${base()}/verify-email`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  const body = await res.json().catch(() => ({})) as Record<string, unknown>
  if (!res.ok) throw new Error(parseErrorResponse(res, body))
  return body as TokenResponse
}

/**
 * Delete current account. Password required for email/password accounts.
 */
export async function deleteAccount(password: string): Promise<void> {
  const res = await fetch(`${base()}/delete-account`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  const body = await res.json().catch(() => ({})) as Record<string, unknown>
  if (!res.ok) throw new Error(parseErrorResponse(res, body))
}
