import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Translate } from '../components/Translate'
import { signUp } from '../api/auth'
import { useAuth } from '../context/useAuth'
import { isValidEmail } from '../utils'

const MIN_PASSWORD_LENGTH = 12

/**
 * Create account (sign up). Part 1 of auth flow.
 */
export function SignUpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const emailValid = isValidEmail(email)
  const passwordsMatch = password === confirmPassword
  const passwordLongEnough = password.length >= MIN_PASSWORD_LENGTH
  const ctaDisabled =
    loading ||
    !emailValid ||
    !passwordLongEnough ||
    !passwordsMatch

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    setError(null)

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError('auth.signUp.passwordTooShort')
      return
    }
    if (password !== confirmPassword) {
      setError('auth.signUp.passwordsDoNotMatch')
      return
    }
    if (!emailValid) {
      setError('auth.signUp.invalidEmail')
      return
    }

    setLoading(true)
    const trimmedEmail = email.trim()
    signUp({ email: trimmedEmail, password, password_confirm: confirmPassword })
      .then(() => login({ email: trimmedEmail, password }))
      .then(() => {
        navigate(from, { replace: true })
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'auth.signUp.error')
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
        <Translate tid="auth.signUp.title" />
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
          <label htmlFor="signup-email" className={labelClass}>
            <Translate tid="auth.email" />
          </label>
          <input
            id="signup-email"
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
          <label htmlFor="signup-password" className={labelClass}>
            <Translate tid="auth.password" />
          </label>
          <input
            id="signup-password"
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            disabled={loading}
          />
          <p className="mt-1 text-sm text-stone-500">
            <Translate tid="auth.signUp.passwordHint" />
          </p>
        </div>

        <div>
          <label htmlFor="signup-confirm" className={labelClass}>
            <Translate tid="auth.signUp.confirmPassword" />
          </label>
          <input
            id="signup-confirm"
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            disabled={loading}
          />
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            type="submit"
            disabled={ctaDisabled}
            className="w-full rounded-md bg-[var(--color-toolme-primary)] px-4 py-2 text-white font-medium hover:bg-[var(--color-toolme-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? '…' : <Translate tid="auth.signUp.submit" />}
          </button>
          <p className="text-center text-sm text-stone-600">
            <Translate tid="auth.signUp.hasAccount" />{' '}
            <Link
              to="/login"
              className="text-[var(--color-toolme-primary)] font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded"
            >
              <Translate tid="auth.login" />
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
