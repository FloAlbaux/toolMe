import { useEffect, useState, useTransition } from 'react'
import { Link } from 'react-router-dom'
import { Translate } from '../components/Translate'
import { LandingHighlight } from '../components/LandingHighlight'
import { ProjectCard } from '../components/ProjectCard'
import { fetchProjects } from '../api/projects'
import type { Project } from '../types/project'

export function HomePage() {
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

    fetchProjects().then((projects) => {
        if (!cancelled) {
          const byNewest = [...projects].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          setProjects(byNewest)
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
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  to={`/project/${project.id}`}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded-xl"
                >
                  <ProjectCard project={project} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
