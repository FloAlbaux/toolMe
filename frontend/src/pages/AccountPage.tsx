import { useEffect, useState, useTransition } from 'react'
import { Link } from 'react-router-dom'
import { Translate } from '../components/Translate'
import { ProjectCard } from '../components/ProjectCard'
import { useAuth } from '../context/useAuth'
import { fetchMyProjects } from '../api/projects'
import type { Project } from '../types/project'

export function AccountPage() {
  const { userId } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    let cancelled = false
    startTransition(() => {
      setLoading(true)
      setError(null)
    })
    fetchMyProjects()
      .then((data) => {
        if (!cancelled) {
          setProjects(
            [...data].sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
          )
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load projects')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-6 sm:p-8" aria-labelledby="account-heading">
      <h2 id="account-heading" className="text-xl font-semibold text-stone-900">
        <Translate tid="account.title" />
      </h2>

      {loading && (
        <p className="mt-4 text-stone-500" aria-live="polite">
          Loading…
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
          <p>{error}</p>
          <Link
            to="/"
            className="mt-2 inline-block text-[var(--color-toolme-primary)] font-medium hover:underline"
          >
            <Translate tid="account.backToHome" />
          </Link>
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <p className="mt-4 text-stone-600">
          <Translate tid="account.empty" />
        </p>
      )}

      {!loading && !error && projects.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                to={`/project/${project.id}`}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded-xl"
              >
                <ProjectCard project={project} isOwner={!!userId && project.ownerId === userId} />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6">
        <Link
          to="/"
          className="text-[var(--color-toolme-primary)] font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded"
        >
          ← <Translate tid="account.backToHome" />
        </Link>
      </p>
    </section>
  )
}
