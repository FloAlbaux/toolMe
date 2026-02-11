import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Translate } from '../components/Translate'
import { resetPassword } from '../api/auth'
import { useAuth } from '../context/useAuth'

const MIN_PASSWORD_LENGTH = 12

/**
 * Set new password with token from email. Logs user in on success.
 */
export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const { refreshUser } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const passwordLongEnough = password.length >= MIN_PASSWORD_LENGTH
  const passwordsMatch = password === confirmPassword

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    setError(null)
    if (!token) {
      setError('auth.resetPassword.missingToken')
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError('auth.signUp.passwordTooShort')
      return
    }
    if (password !== confirmPassword) {
      setError('auth.signUp.passwordsDoNotMatch')
      return
    }
    setLoading(true)
    resetPassword(token, password)
      .then(() => refreshUser())
      .then(() => navigate('/', { replace: true }))
      .catch((err) => setError(err instanceof Error ? err.message : 'auth.resetPassword.error'))
      .finally(() => setLoading(false))
  }

  const inputClass =
    'mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-[var(--color-toolme-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-toolme-primary)]'
  const labelClass = 'block text-sm font-medium text-stone-700'

  if (!token) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-stone-200 bg-white p-8">
        <h2 className="text-xl font-semibold text-stone-900 mb-6">
          <Translate tid="auth.resetPassword.title" />
        </h2>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800 mb-6" role="alert">
          <Translate tid="auth.resetPassword.missingToken" />
        </div>
        <p className="text-center">
          <Link to="/forgot-password" className="text-[var(--color-toolme-primary)] font-medium hover:underline">
            <Translate tid="auth.forgotPassword.requestNew" />
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-stone-200 bg-white p-8">
      <h2 className="text-xl font-semibold text-stone-900 mb-6">
        <Translate tid="auth.resetPassword.title" />
      </h2>

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
          {error.startsWith('auth.') ? <Translate tid={error} /> : error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="reset-password" className={labelClass}>
            <Translate tid="auth.resetPassword.newPassword" />
          </label>
          <input
            id="reset-password"
            type="password"
            required
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
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
          <label htmlFor="reset-confirm" className={labelClass}>
            <Translate tid="auth.signUp.confirmPassword" />
          </label>
          <input
            id="reset-confirm"
            type="password"
            required
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            disabled={loading}
          />
        </div>
        <div className="flex flex-col gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !passwordLongEnough || !passwordsMatch}
            className="w-full rounded-md bg-[var(--color-toolme-primary)] px-4 py-2 text-white font-medium hover:bg-[var(--color-toolme-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? '…' : <Translate tid="auth.resetPassword.submit" />}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center">
        <Link
          to="/login"
          className="text-sm text-[var(--color-toolme-primary)] font-medium hover:underline"
        >
          ← <Translate tid="auth.backToLogin" />
        </Link>
      </p>
    </div>
  )
}
