import { Link } from 'react-router-dom'
import { Translate } from './Translate'
import { LanguageSelector } from './LanguageSelector'
import { useAuth } from '../context/useAuth'

export function Header() {
  const { isAuthenticated, email, logout } = useAuth()

  return (
    <header
      className="border-b border-stone-200 bg-white"
      role="banner"
    >
      <div className="mx-auto flex max-w-4xl items-start justify-between gap-4 px-4 py-6 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            <Link
              to="/"
              className="text-[var(--color-toolme-primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded"
            >
              <Translate tid="brand.name" />
            </Link>
          </h1>
          <Translate
            tid="brand.tagline"
            as="p"
            className="mt-1 text-stone-600 text-lg"
          />
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-stone-600 text-sm truncate max-w-[180px]" title={email ?? undefined}>
                {email}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="text-[var(--color-toolme-primary)] font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded"
              >
                <Translate tid="auth.logout" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[var(--color-toolme-primary)] font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded"
              >
                <Translate tid="auth.login" />
              </Link>
              <Link
                to="/signup"
                className="text-[var(--color-toolme-primary)] font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded"
              >
                <Translate tid="auth.signUp.createAccount" />
              </Link>
            </>
          )}
          <LanguageSelector />
        </div>
      </div>
    </header>
  )
}
