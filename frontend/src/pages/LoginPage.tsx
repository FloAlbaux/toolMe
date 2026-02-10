import { Link } from 'react-router-dom'
import { Translate } from '../components/Translate'

/**
 * Log in page. Backend auth not implemented yet — placeholder.
 */
export function LoginPage() {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-stone-200 bg-white p-8 text-center">
      <h2 className="text-xl font-semibold text-stone-900 mb-4">
        <Translate tid="auth.login" />
      </h2>
      <p className="text-stone-600 mb-6">
        <Translate tid="auth.loginComingSoon" />
      </p>
      <Link
        to="/signup"
        className="inline-block text-[var(--color-toolme-primary)] font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded"
      >
        <Translate tid="auth.signUp.createAccount" />
      </Link>
      <p className="mt-6">
        <Link
          to="/"
          className="text-sm text-[var(--color-toolme-primary)] font-medium hover:underline"
        >
          ← <Translate tid="auth.backToHome" />
        </Link>
      </p>
    </div>
  )
}
