import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Translate } from '../components/Translate'
import { fetchProjectById } from '../api/projects'
import type { Project } from '../types/project'

function formatDeadline(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return iso
  }
}

export function ProjectDetailPage() {
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
    <article className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="mb-4">
        <Link
          to="/"
          className="text-[var(--color-toolme-primary)] font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded"
        >
          ← <Translate tid="projectDetail.backToProjects" />
        </Link>
      </p>

      <header className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl font-semibold text-stone-900 sm:text-3xl">
          {project.title}
        </h1>
        <p className="mt-2 text-stone-500">
          <Translate tid="projectDetail.domainLabel" />: {project.domain}
        </p>
        <p className="mt-1 text-sm text-stone-500">
          <Translate tid="projects.deadlineLabel" />: {formatDeadline(project.deadline)}
        </p>
      </header>

      <div className="mt-6 prose prose-stone max-w-none">
        <h2 className="text-lg font-medium text-stone-900 sr-only">Description</h2>
        <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
          {project.fullDescription}
        </p>
      </div>

      {project.deliveryInstructions && (
        <div className="mt-8 pt-6 border-t border-stone-200">
          <h2 className="text-lg font-medium text-stone-900">
            <Translate tid="projectDetail.deliveryInstructionsLabel" />
          </h2>
          <p className="mt-2 text-stone-700 leading-relaxed whitespace-pre-wrap">
            {project.deliveryInstructions}
          </p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-stone-200">
        <Link
          to={`/project/${project.id}/apply`}
          className="inline-flex items-center justify-center rounded-md bg-[var(--color-toolme-primary)] px-5 py-2.5 text-white font-medium hover:bg-[var(--color-toolme-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2"
        >
          <Translate tid="projectDetail.applyCta" />
        </Link>
      </div>
    </article>
  )
}
