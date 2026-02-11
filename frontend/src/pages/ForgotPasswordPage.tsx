import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Translate } from '../components/Translate'
import { forgotPassword } from '../api/auth'

/**
 * Request a password reset email. Token valid 1h.
 */
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [resetLink, setResetLink] = useState<string | null>(null)

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    setError(null)
    setSent(false)
    setResetLink(null)
    setLoading(true)
    forgotPassword(email.trim())
      .then((data) => {
        setSent(true)
        if (data.reset_link) setResetLink(data.reset_link)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'auth.forgotPassword.error'))
      .finally(() => setLoading(false))
  }

  const inputClass =
    'mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-[var(--color-toolme-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-toolme-primary)]'
  const labelClass = 'block text-sm font-medium text-stone-700'

  return (
    <div className="mx-auto max-w-md rounded-xl border border-stone-200 bg-white p-8">
      <h2 className="text-xl font-semibold text-stone-900 mb-6">
        <Translate tid="auth.forgotPassword.title" />
      </h2>

      {sent ? (
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-800 mb-6 space-y-2" role="status">
          <p><Translate tid="auth.forgotPassword.sent" /></p>
          {resetLink && (
            <p className="text-sm mt-2">
              <Translate tid="auth.forgotPassword.devNoMail" />
              <a
                href={resetLink}
                className="block mt-1 break-all text-[var(--color-toolme-primary)] font-medium hover:underline"
              >
                {resetLink}
              </a>
            </p>
          )}
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
              {error.startsWith('auth.') ? <Translate tid={error} /> : error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="forgot-email" className={labelClass}>
                <Translate tid="auth.email" />
              </label>
              <input
                id="forgot-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                disabled={loading}
              />
            </div>
            <p className="text-sm text-stone-600">
              <Translate tid="auth.forgotPassword.hint" />
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[var(--color-toolme-primary)] px-4 py-2 text-white font-medium hover:bg-[var(--color-toolme-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none"
              >
                {loading ? '…' : <Translate tid="auth.forgotPassword.submit" />}
              </button>
            </div>
          </form>
        </>
      )}

      <p className="mt-6 text-center">
        <Link
          to="/login"
          className="text-sm text-[var(--color-toolme-primary)] font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded"
        >
          ← <Translate tid="auth.backToLogin" />
        </Link>
      </p>
    </div>
  )
}
