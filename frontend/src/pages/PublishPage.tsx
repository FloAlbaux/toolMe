import { Link } from 'react-router-dom'
import { Translate } from '../components/Translate'

/**
 * Placeholder for project creation / publish flow (Epic 3).
 */
export function PublishPage() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
      <h2 className="text-xl font-semibold text-stone-900">
        <Translate tid="publishPage.comingSoonTitle" />
      </h2>
      <p className="mt-3 text-stone-600">
        <Translate tid="publishPage.comingSoonBody" />
      </p>
      <Link
        to="/"
        className="mt-6 inline-block text-[var(--color-toolme-primary)] font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded"
      >
        <Translate tid="projectDetail.backToProjects" />
      </Link>
    </div>
  )
}
