import { useParams, Link } from 'react-router-dom'
import { Translate } from '../components/Translate'
import { getProjectById } from '../data/mockProjects'

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
    </article>
  )
}
