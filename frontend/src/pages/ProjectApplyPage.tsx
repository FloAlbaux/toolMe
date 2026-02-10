import { useParams, Link } from 'react-router-dom'
import { Translate } from '../components/Translate'
import { getProjectById } from '../data/mockProjects'

/**
 * Placeholder for project application / submit solution flow (Epic 4).
 */
export function ProjectApplyPage() {
  const { id } = useParams<{ id: string }>()
  const project = id ? getProjectById(id) : undefined

  if (!project) {
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
