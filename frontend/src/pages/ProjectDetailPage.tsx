import { useEffect, useState, useTransition } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ProjectOwnerActions } from '../components/ProjectOwnerActions'
import { Translate } from '../components/Translate'
import { useAuth } from '../context/useAuth'
import { fetchProjectById, deleteProject } from '../api/projects'
import { fetchProjectSubmissions, setSubmissionCoherent } from '../api/submissions'
import type { Project } from '../types/project'
import type { Submission } from '../types/submission'

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
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { userId } = useAuth()
  const [project, setProject] = useState<Project | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [coherentUpdating, setCoherentUpdating] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const isOwner = !!userId && !!project && project.ownerId === userId

  async function handleDelete() {
    if (!id || !project || !globalThis.confirm(t('projectDetail.deleteConfirm'))) return
    setDeleting(true)
    try {
      const ok = await deleteProject(id)
      if (ok) {
        navigate('/', { replace: true })
      }
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    if (!id) {
      startTransition(() => {
        setProject(null)
        setLoading(false)
      })
      return
    }
    let cancelled = false
    startTransition(() => {
      setLoading(true)
      setError(null)
    })
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

  useEffect(() => {
    if (!isOwner || !id) return
    let cancelled = false
    fetchProjectSubmissions(id)
      .then((data) => {
        if (!cancelled) setSubmissions(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [isOwner, id])

  async function handleSetCoherent(submissionId: string, coherent: boolean) {
    setCoherentUpdating(submissionId)
    try {
      await setSubmissionCoherent(submissionId, coherent)
      const data = await fetchProjectSubmissions(id!)
      setSubmissions(data)
    } finally {
      setCoherentUpdating(null)
    }
  }

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

      {isOwner && submissions.length > 0 && (
        <div className="mt-8 pt-6 border-t border-stone-200">
          <h2 className="text-lg font-medium text-stone-900">
            <Translate tid="projectDetail.submissionsHeading" /> ({submissions.length})
          </h2>
          <ul className="mt-3 space-y-2">
            {submissions.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2"
              >
                <Link
                  to={`/submission/${s.id}`}
                  className="inline-flex items-center gap-1.5 text-[var(--color-toolme-primary)] font-medium hover:underline"
                >
                  <Translate tid="projectDetail.submissionLink" /> · {s.messageCount}{' '}
                  <Translate tid="mySubmissions.messages" />
                  {s.unreadCount > 0 && (
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-red-500"
                      title={t('mySubmissions.unreadCount', { count: s.unreadCount })}
                      aria-label={t('mySubmissions.unreadCount', { count: s.unreadCount })}
                    />
                  )}
                </Link>
                {s.coherent === null && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSetCoherent(s.id, true)}
                      disabled={coherentUpdating === s.id}
                      className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-60"
                    >
                      <Translate tid="submissionDetail.markCoherent" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetCoherent(s.id, false)}
                      disabled={coherentUpdating === s.id}
                      className="rounded bg-amber-600 px-2 py-1 text-xs text-white hover:bg-amber-700 disabled:opacity-60"
                    >
                      <Translate tid="submissionDetail.markNotCoherent" />
                    </button>
                  </>
                )}
                {s.coherent === true && (
                  <span className="text-sm text-green-600">
                    <Translate tid="mySubmissions.coherent" />
                  </span>
                )}
                {s.coherent === false && (
                  <span className="text-sm text-amber-600">
                    <Translate tid="mySubmissions.notCoherent" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-stone-200 flex flex-wrap items-center gap-3">
        <Link
          to={`/project/${project.id}/apply`}
          className="inline-flex items-center justify-center rounded-md bg-[var(--color-toolme-primary)] px-5 py-2.5 text-white font-medium hover:bg-[var(--color-toolme-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2"
        >
          <Translate tid="projectDetail.applyCta" />
        </Link>
        {isOwner && (
          <ProjectOwnerActions
            projectId={project.id}
            onDelete={handleDelete}
            deleting={deleting}
          />
        )}
      </div>
    </article>
  )
}
