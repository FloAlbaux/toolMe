import { useEffect, useState, useTransition } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Translate } from '../components/Translate'
import { useAuth } from '../context/useAuth'
import { fetchProjectById } from '../api/projects'
import { createSubmission, fetchMySubmissionForProject } from '../api/submissions'
import type { Project } from '../types/project'
import type { Submission } from '../types/submission'

const MESSAGE_MIN = 1
const MESSAGE_MAX = 10_000
const LINK_MAX = 2048

/**
 * Submit a solution to a project (Epic 4). Auth required (wrapped in RequireAuth).
 * Mandatory message; optional link. Redirects to login if not authenticated.
 */
export function ProjectApplyPage() {
  const { id } = useParams<{ id: string }>()
  const { userId } = useAuth()
  const [project, setProject] = useState<Project | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [existingSubmission, setExistingSubmission] = useState<Submission | null | undefined>(
    undefined
  )
  const [, startTransition] = useTransition()

  const messageValid = message.trim().length >= MESSAGE_MIN && message.length <= MESSAGE_MAX
  const linkTrimmed = link.trim()
  const linkValid =
    !linkTrimmed ||
    (linkTrimmed.length <= LINK_MAX &&
      (linkTrimmed.startsWith('http://') || linkTrimmed.startsWith('https://')))
  const canSubmit = !!userId && !!project && messageValid && linkValid && !submitting

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
        if (!cancelled) setProject(data ?? null)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load project')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  // If user is logged in and project loaded, check if they already have a submission (1 per project max)
  useEffect(() => {
    if (!id || !userId || !project) {
      if (!id || !userId) setExistingSubmission(undefined)
      return
    }
    let cancelled = false
    fetchMySubmissionForProject(id)
      .then((s) => {
        if (!cancelled) setExistingSubmission(s ?? null)
      })
      .catch(() => {
        if (!cancelled) setExistingSubmission(null)
      })
    return () => {
      cancelled = true
    }
  }, [id, userId, project])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!id || !project || !canSubmit) return
    setError(null)
    setSubmitting(true)
    try {
      await createSubmission(id, {
        message: message.trim(),
        link: linkTrimmed || null,
      })
      setSubmitted(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submit failed'
      setError(msg)
      // If 409 (already submitted), refresh existing submission so we show the "already submitted" view
      if (typeof msg === 'string' && msg.includes('already have a submission')) {
        fetchMySubmissionForProject(id!).then((s) => setExistingSubmission(s ?? null))
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && project === undefined) {
    return (
      <output className="text-stone-500" aria-live="polite">
        Loading…
      </output>
    )
  }

  if (error && !project) {
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

  if (existingSubmission) {
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
          <Translate tid="applyPage.alreadySubmittedTitle" />
        </h2>
        <p className="mt-2 text-stone-600">
          <Translate tid="applyPage.alreadySubmittedBody" />
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={`/submission/${existingSubmission.id}`}
            className="inline-flex rounded-md bg-[var(--color-toolme-primary)] px-4 py-2 text-white font-medium hover:bg-[var(--color-toolme-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2"
          >
            <Translate tid="applyPage.viewThread" />
          </Link>
          <Link
            to="/my-submissions"
            className="inline-flex rounded-md border border-stone-300 bg-white px-4 py-2 text-stone-700 font-medium hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2"
          >
            <Translate tid="applyPage.mySubmissions" />
          </Link>
        </div>
      </div>
    )
  }

  if (submitted) {
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
        <h2 className="text-xl font-semibold text-stone-900 text-green-700">
          <Translate tid="applyPage.successTitle" />
        </h2>
        <p className="mt-2 text-stone-600">
          <Translate tid="applyPage.successBody" />
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/my-submissions"
            className="inline-flex rounded-md bg-[var(--color-toolme-primary)] px-4 py-2 text-white font-medium hover:bg-[var(--color-toolme-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2"
          >
            <Translate tid="applyPage.mySubmissions" />
          </Link>
          <Link
            to={`/project/${project.id}`}
            className="inline-flex rounded-md border border-stone-300 bg-white px-4 py-2 text-stone-700 font-medium hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2"
          >
            <Translate tid="applyPage.backToProject" />
          </Link>
        </div>
      </div>
    )
  }

  const inputClass =
    'mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-[var(--color-toolme-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-toolme-primary)]'
  const labelClass = 'block text-sm font-medium text-stone-700'

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
        <Translate tid="applyPage.formTitle" />: {project.title}
      </h2>
      <p className="mt-1 text-sm text-stone-500">
        <Translate tid="applyPage.formHint" />
      </p>

      {error && (
        <div
          className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-red-800"
          role="alert"
        >
          {error.startsWith('applyPage.') ? <Translate tid={error} /> : error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="apply-message" className={labelClass}>
            <Translate tid="applyPage.messageLabel" /> <span className="text-red-600">*</span>
          </label>
          <textarea
            id="apply-message"
            required
            minLength={MESSAGE_MIN}
            maxLength={MESSAGE_MAX}
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={inputClass}
            disabled={submitting}
            placeholder="Describe your solution or ask a question."
          />
          <p className="mt-1 text-sm text-stone-500">
            {message.trim().length} / {MESSAGE_MAX}
          </p>
        </div>

        <div>
          <label htmlFor="apply-link" className={labelClass}>
            <Translate tid="applyPage.linkLabel" />
          </label>
          <input
            id="apply-link"
            type="url"
            maxLength={LINK_MAX}
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className={inputClass}
            disabled={submitting}
            placeholder="https://..."
          />
          {linkTrimmed && !linkValid && (
            <p className="mt-1 text-sm text-amber-600">
              <Translate tid="applyPage.linkInvalid" />
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-md bg-[var(--color-toolme-primary)] px-5 py-2.5 text-white font-medium hover:bg-[var(--color-toolme-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none"
          >
            {submitting ? '…' : <Translate tid="applyPage.submit" />}
          </button>
          <Link
            to={`/project/${project.id}`}
            className="inline-flex items-center rounded-md border border-stone-300 bg-white px-4 py-2 text-stone-700 font-medium hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2"
          >
            <Translate tid="applyPage.backToProject" />
          </Link>
        </div>
      </form>
    </div>
  )
}
