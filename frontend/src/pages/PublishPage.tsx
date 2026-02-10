import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Translate } from '../components/Translate'
import { createProject } from '../api/projects'

/**
 * Publish a new project (POST /projects).
 */
export function PublishPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [domain, setDomain] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [fullDescription, setFullDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [deliveryInstructions, setDeliveryInstructions] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const project = await createProject({
        title: title.trim(),
        domain: domain.trim(),
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        deadline: deadline.trim(),
        deliveryInstructions: deliveryInstructions.trim() || undefined,
      })
      navigate(`/project/${project.id}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish project')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-[var(--color-toolme-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-toolme-primary)]'
  const labelClass = 'block text-sm font-medium text-stone-700'

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-8">
      <p className="mb-6">
        <Link
          to="/"
          className="text-[var(--color-toolme-primary)] font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded"
        >
          ← <Translate tid="publishPage.backToProjects" />
        </Link>
      </p>

      <h2 className="text-xl font-semibold text-stone-900 mb-6">
        <Translate tid="publishPage.title" />
      </h2>

      {error && (
        <div
          className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-800"
          role="alert"
        >
          <Translate tid="publishPage.error" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="publish-title" className={labelClass}>
            <Translate tid="publishPage.titleLabel" />
          </label>
          <input
            id="publish-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="publish-domain" className={labelClass}>
            <Translate tid="publishPage.domainLabel" />
          </label>
          <input
            id="publish-domain"
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
          <label htmlFor="publish-short" className={labelClass}>
            <Translate tid="publishPage.shortDescriptionLabel" />
          </label>
          <input
            id="publish-short"
            type="text"
            required
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className={inputClass}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="publish-full" className={labelClass}>
            <Translate tid="publishPage.fullDescriptionLabel" />
          </label>
          <textarea
            id="publish-full"
            required
            rows={4}
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            className={inputClass}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="publish-deadline" className={labelClass}>
            <Translate tid="publishPage.deadlineLabel" />
          </label>
          <input
            id="publish-deadline"
            type="date"
            required
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={inputClass}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="publish-delivery" className={labelClass}>
            <Translate tid="publishPage.deliveryInstructionsLabel" />
          </label>
          <textarea
            id="publish-delivery"
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
            {loading ? '…' : <Translate tid="publishPage.submit" />}
          </button>
          <Link
            to="/"
            className="rounded-md border border-stone-300 bg-white px-4 py-2 text-stone-700 font-medium hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2"
          >
            <Translate tid="publishPage.backToProjects" />
          </Link>
        </div>
      </form>
    </div>
  )
}
