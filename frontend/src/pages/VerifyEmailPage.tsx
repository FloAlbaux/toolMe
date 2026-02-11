import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Translate } from '../components/Translate'
import { verifyEmail } from '../api/auth'
import { useAuth } from '../context/useAuth'

/**
 * Activate account via link in email. Token in query; on success user is logged in.
 */
export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const { refreshUser } = useAuth()
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage('auth.verifyEmail.missingToken')
      return
    }
    if (ran.current) return
    ran.current = true
    verifyEmail(token)
      .then(() => refreshUser())
      .then(() => setStatus('ok'))
      .catch((err) => {
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : 'auth.verifyEmail.error')
      })
  }, [token, refreshUser])

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-stone-200 bg-white p-8">
        <h2 className="text-xl font-semibold text-stone-900 mb-6">
          <Translate tid="auth.verifyEmail.title" />
        </h2>
        <p className="text-stone-600"><Translate tid="auth.verifyEmail.activating" /></p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-stone-200 bg-white p-8">
        <h2 className="text-xl font-semibold text-stone-900 mb-6">
          <Translate tid="auth.verifyEmail.title" />
        </h2>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800 mb-6" role="alert">
          {errorMessage?.startsWith('auth.') ? <Translate tid={errorMessage} /> : errorMessage}
        </div>
        <p className="text-center">
          <Link to="/signup" className="text-[var(--color-toolme-primary)] font-medium hover:underline">
            <Translate tid="auth.signUp.createAccount" />
          </Link>
          {' · '}
          <Link to="/login" className="text-[var(--color-toolme-primary)] font-medium hover:underline">
            <Translate tid="auth.login" />
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-stone-200 bg-white p-8">
      <h2 className="text-xl font-semibold text-stone-900 mb-6">
        <Translate tid="auth.verifyEmail.title" />
      </h2>
      <div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-800 mb-6" role="status">
        <Translate tid="auth.verifyEmail.success" />
      </div>
      <p className="text-center">
        <Link to="/" className="text-[var(--color-toolme-primary)] font-medium hover:underline">
          → <Translate tid="auth.backToHome" />
        </Link>
      </p>
    </div>
  )
}
