import { Link } from 'react-router-dom'
import { Translate } from '../components/Translate'
import { LoginForm } from '../components/LoginForm'

/**
 * Log in page. Email/password. Forgot password link.
 */
export function LoginPage() {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-stone-200 bg-white p-8">
      <h2 className="text-xl font-semibold text-stone-900 mb-6">
        <Translate tid="auth.login" />
      </h2>

      <LoginForm />

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
