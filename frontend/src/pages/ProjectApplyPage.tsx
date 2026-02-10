import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Translate } from '../components/Translate'
import { fetchProjectById } from '../api/projects'
import type { Project } from '../types/project'

/**
 * Placeholder for project application / submit solution flow (Epic 4).
 */
export function ProjectApplyPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setProject(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchProjectById(id)
      .then((data) => {
        if (!cancelled) {
          setProject(data)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load project')
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
  }, [id])

  if (loading) {
    return (
      <p className="text-stone-500" role="status" aria-live="polite">
        Loading…
      </p>
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

  if (project == null) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
        <p className="text-stone-600">
          <Translate tid="projectDetail.notFound" />
        </p>
        <Link
          to="/"
          className="mt-4 inline-block text-[var(--color-toolme-primary)] font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded"
        >
          <Translate tid="projectDetail.backToProjects" />
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-8">
      <p className="mb-4">
        <Link
          to={`/project/${project.id}`}
          className="text-[var(--color-toolme-primary)] font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded"
        >
          ← <Translate tid="applyPage.backToProject" />
        </Link>
      </p>
      <h2 className="text-xl font-semibold text-stone-900">
        <Translate tid="applyPage.comingSoonTitle" />
      </h2>
      <p className="mt-2 text-stone-600">
        <Translate tid="applyPage.comingSoonBody" />
      </p>
      <Link
        to={`/project/${project.id}`}
        className="mt-6 inline-block rounded-md bg-[var(--color-toolme-primary)] px-4 py-2 text-white font-medium hover:bg-[var(--color-toolme-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2"
      >
        <Translate tid="applyPage.backToProject" />
      </Link>
    </div>
  )
}
