import { useEffect, useState, useTransition } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Translate } from '../components/Translate'
import { fetchMySubmissions } from '../api/submissions'
import type { Submission } from '../types/submission'

export function MySubmissionsPage() {
  const { t } = useTranslation()
  const [list, setList] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    let cancelled = false
    startTransition(() => setLoading(true))
    fetchMySubmissions()
      .then((data) => {
        if (!cancelled) setList(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <output className="text-stone-500" aria-live="polite">
        Loading…
      </output>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
        <p>{error}</p>
        <Link
          to="/"
          className="mt-4 inline-block text-[var(--color-toolme-primary)] font-medium hover:underline"
        >
          <Translate tid="projectDetail.backToProjects" />
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-8">
      <h1 className="text-2xl font-semibold text-stone-900">
        <Translate tid="mySubmissions.title" />
      </h1>
      <p className="mt-1 text-stone-600">
        <Translate tid="mySubmissions.lead" />
      </p>

      {list.length === 0 ? (
        <p className="mt-8 text-stone-500">
          <Translate tid="mySubmissions.empty" />
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {list.map((s) => (
            <li
              key={s.id}
              className="rounded-lg border border-stone-200 bg-stone-50/50 p-4 transition hover:bg-stone-50"
            >
              <Link
                to={`/submission/${s.id}`}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="font-medium text-stone-900">
                    <Translate tid="mySubmissions.projectSubmission" /> — {s.messageCount}{' '}
                    <Translate tid="mySubmissions.messages" />
                  </span>
                  {s.unreadCount > 0 && (
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-red-500"
                      title={t('mySubmissions.unreadCount', { count: s.unreadCount })}
                      aria-label={t('mySubmissions.unreadCount', { count: s.unreadCount })}
                    />
                  )}
                </span>
                <span className="ml-2 text-sm text-stone-500">
                  {new Date(s.createdAt).toLocaleDateString(undefined, {
                    dateStyle: 'medium',
                  })}
                </span>
                {s.coherent === true && (
                  <span className="ml-2 text-sm text-green-600">
                    (<Translate tid="mySubmissions.coherent" />)
                  </span>
                )}
                {s.coherent === false && (
                  <span className="ml-2 text-sm text-amber-600">
                    (<Translate tid="mySubmissions.notCoherent" />)
                  </span>
                )}
              </Link>
              <Link
                to={`/project/${s.projectId}`}
                className="mt-2 inline-block text-sm text-[var(--color-toolme-primary)] hover:underline"
              >
                <Translate tid="applyPage.backToProject" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8">
        <Link
          to="/"
          className="text-[var(--color-toolme-primary)] font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded"
        >
          ← <Translate tid="projectDetail.backToProjects" />
        </Link>
      </p>
    </div>
  )
}
