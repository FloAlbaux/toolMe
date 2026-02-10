import { getApiBaseUrl } from './config'

const base = () => getApiBaseUrl() + '/auth'

export type SignUpInput = {
  email: string
  password: string
}

/**
 * Create a new account. Backend must implement POST /auth/signup.
 */
export async function signUp(input: SignUpInput): Promise<{ id: string; email: string }> {
  const res = await fetch(`${base()}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: input.email.trim(), password: input.password }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const detail = body.detail
    let message: string
    if (typeof detail === 'string') {
      message = detail
    } else if (Array.isArray(detail)) {
      message = detail.map((d: { msg?: string }) => d.msg ?? JSON.stringify(d)).join(', ')
    } else {
      message = `Sign up failed: ${res.status}`
    }
    throw new Error(message)
  }
  return res.json()
}
