import { useEffect, useState, useTransition } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Translate } from '../components/Translate'
import { useAuth } from '../context/useAuth'
import { fetchProjectById, updateProject } from '../api/projects'
import type { Project } from '../types/project'

/**
 * Edit a project (PUT /projects/:id). Requires auth; only owner can edit.
 */
export function ProjectEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { userId } = useAuth()
  const [project, setProject] = useState<Project | null | undefined>(undefined)
  const [title, setTitle] = useState('')
  const [domain, setDomain] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [fullDescription, setFullDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [deliveryInstructions, setDeliveryInstructions] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    if (!id) {
      startTransition(() => setProject(null))
      return
    }
    let cancelled = false
    startTransition(() => setError(null))
    fetchProjectById(id)
      .then((data) => {
        if (!cancelled) {
          setProject(data)
          if (data) {
            setTitle(data.title)
            setDomain(data.domain)
            setShortDescription(data.shortDescription)
            setFullDescription(data.fullDescription)
            setDeadline(data.deadline.slice(0, 10))
            setDeliveryInstructions(data.deliveryInstructions ?? '')
          }
        }
      })
      .catch(() => {
        if (!cancelled) setProject(null)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const isOwner = !!userId && !!project && project.ownerId === userId

  useEffect(() => {
    if (project === null || (project && !isOwner)) {
      navigate(project ? `/project/${project.id}` : '/', { replace: true })
    }
  }, [project, isOwner, navigate])

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    if (!id || !project) return
    setError(null)
    setLoading(true)
    try {
      await updateProject(id, {
        title: title.trim(),
        domain: domain.trim(),
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        deadline: deadline.trim(),
        deliveryInstructions: deliveryInstructions.trim() || undefined,
      })
      navigate(`/project/${id}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-[var(--color-toolme-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-toolme-primary)]'
  const labelClass = 'block text-sm font-medium text-stone-700'

  if (project === undefined || (project && !isOwner)) {
    return (
      <output className="text-stone-500" aria-live="polite">
        Loading…
      </output>
    )
  }

  if (project == null) {
    return null
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-8">
      <p className="mb-6">
        <Link
          to={`/project/${id}`}
          className="text-[var(--color-toolme-primary)] font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded"
        >
          ← <Translate tid="projectDetail.backToProjects" />
        </Link>
      </p>

      <h2 className="text-xl font-semibold text-stone-900 mb-6">
        <Translate tid="projectDetail.editProject" />
      </h2>

      {error && (
        <div
          className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="edit-title" className={labelClass}>
            <Translate tid="publishPage.titleLabel" />
          </label>
          <input
            id="edit-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="edit-domain" className={labelClass}>
            <Translate tid="publishPage.domainLabel" />
          </label>
          <input
            id="edit-domain"
            type="text"
            required
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className={inputClass}
            placeholder="e.g. Web, Data, Design"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="edit-short" className={labelClass}>
            <Translate tid="publishPage.shortDescriptionLabel" />
          </label>
          <input
            id="edit-short"
            type="text"
            required
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className={inputClass}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="edit-full" className={labelClass}>
            <Translate tid="publishPage.fullDescriptionLabel" />
          </label>
          <textarea
            id="edit-full"
            required
            rows={4}
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            className={inputClass}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="edit-deadline" className={labelClass}>
            <Translate tid="publishPage.deadlineLabel" />
          </label>
          <input
            id="edit-deadline"
            type="date"
            required
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={inputClass}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="edit-delivery" className={labelClass}>
            <Translate tid="publishPage.deliveryInstructionsLabel" />
          </label>
          <textarea
            id="edit-delivery"
            rows={2}
            value={deliveryInstructions}
            onChange={(e) => setDeliveryInstructions(e.target.value)}
            className={inputClass}
            disabled={loading}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-[var(--color-toolme-primary)] px-4 py-2 text-white font-medium hover:bg-[var(--color-toolme-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? '…' : <Translate tid="projectDetail.edit" />}
          </button>
          <Link
            to={`/project/${id}`}
            className="rounded-md border border-stone-300 bg-white px-4 py-2 text-stone-700 font-medium hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2"
          >
            <Translate tid="projectDetail.backToProjects" />
          </Link>
        </div>
      </form>
    </div>
  )
}
