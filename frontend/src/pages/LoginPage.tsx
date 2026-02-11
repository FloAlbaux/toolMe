import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Translate } from '../components/Translate'
import { useAuth } from '../context/AuthContext'

/**
 * Log in page. Calls POST /auth/login and stores JWT.
 */
export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    login({ email: email.trim(), password })
      .then(() => {
        navigate(from, { replace: true })
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'auth.loginError')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const inputClass =
    'mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-[var(--color-toolme-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-toolme-primary)]'
  const labelClass = 'block text-sm font-medium text-stone-700'

  return (
    <div className="mx-auto max-w-md rounded-xl border border-stone-200 bg-white p-8">
      <h2 className="text-xl font-semibold text-stone-900 mb-6">
        <Translate tid="auth.login" />
      </h2>

      {error && (
        <div
          className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-800"
          role="alert"
        >
          {error.startsWith('auth.') ? <Translate tid={error} /> : error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="login-email" className={labelClass}>
            <Translate tid="auth.email" />
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="login-password" className={labelClass}>
            <Translate tid="auth.password" />
          </label>
          <input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            disabled={loading}
          />
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[var(--color-toolme-primary)] px-4 py-2 text-white font-medium hover:bg-[var(--color-toolme-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? '…' : <Translate tid="auth.login" />}
          </button>
          <p className="text-center text-sm text-stone-600">
            <Translate tid="auth.noAccount" />{' '}
            <Link
              to="/signup"
              className="text-[var(--color-toolme-primary)] font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded"
            >
              <Translate tid="auth.signUp.createAccount" />
            </Link>
          </p>
        </div>
      </form>

      <p className="mt-6 text-center">
        <Link
          to="/"
          className="text-sm text-[var(--color-toolme-primary)] font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded"
        >
          ← <Translate tid="auth.backToHome" />
        </Link>
      </p>
    </div>
  )
}
