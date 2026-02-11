import { useEffect, useState, useTransition } from 'react'
import { Link } from 'react-router-dom'
import { Translate } from '../components/Translate'
import { LandingHighlight } from '../components/LandingHighlight'
import { ProjectCard } from '../components/ProjectCard'
import { useAuth } from '../context/useAuth'
import { fetchProjects } from '../api/projects'
import type { Project } from '../types/project'

const PAGE_SIZE = 12

export function HomePage() {
  const { userId } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    let cancelled = false
    startTransition(() => {
      setLoading(true)
      setError(null)
    })
    fetchProjects({ skip: 0, limit: PAGE_SIZE })
      .then(({ projects: list, total: t }) => {
        if (!cancelled) {
          setProjects(list)
          setTotal(t)
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

  async function loadMore() {
    if (loadingMore || projects.length >= total) return
    setLoadingMore(true)
    try {
      const { projects: next, total: t } = await fetchProjects({
        skip: projects.length,
        limit: PAGE_SIZE,
      })
      setProjects((prev) => [...prev, ...next])
      setTotal(t)
    } finally {
      setLoadingMore(false)
    }
  }

  const hasMore = projects.length < total

  return (
    <>
      <LandingHighlight />

      <section className="mt-12" aria-labelledby="projects-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
          <Translate
            tid="projects.heading"
            as="h2"
            id="projects-heading"
            className="text-xl font-semibold text-stone-900"
          />
          <Link
            to="/publish"
            className="text-[var(--color-toolme-primary)] font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded"
          >
            <Translate tid="projects.publishCta" />
          </Link>
        </div>

        {loading && (
          <output className="text-stone-500" aria-live="polite">
            Loading projects…
          </output>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <p className="text-stone-600">No projects yet.</p>
        )}

        {!loading && !error && projects.length > 0 && (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link
                    to={`/project/${project.id}`}
                    className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded-xl"
                  >
                    <ProjectCard
                      project={project}
                      isOwner={!!userId && project.ownerId === userId}
                    />
                  </Link>
                </li>
              ))}
            </ul>
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded-md border border-stone-300 bg-white px-5 py-2.5 text-stone-700 font-medium hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {loadingMore ? (
                    <Translate tid="projects.loadingMore" />
                  ) : (
                    <Translate tid="projects.loadMore" />
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}
