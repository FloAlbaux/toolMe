import { Translate } from './Translate'
import type { Project } from '../data/mockProjects'

type ProjectCardProps = {
  project: Project
}

function formatDeadline(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

/**
 * Displays a project as a card (title, domain, short description, deadline).
 * Not clickable for now — detail page will come in Ticket 3.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article
      className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      aria-labelledby={`project-title-${project.id}`}
    >
      <div className="flex flex-wrap items-baseline gap-2">
        <h3
          id={`project-title-${project.id}`}
          className="text-lg font-semibold text-stone-900"
        >
          {project.title}
        </h3>
        <span className="text-sm text-stone-500">{project.domain}</span>
      </div>
      <p className="mt-2 text-stone-600 leading-relaxed">
        {project.shortDescription}
      </p>
      <p className="mt-3 text-sm text-stone-500">
        <Translate tid="projects.deadlineLabel" />: {formatDeadline(project.deadline)}
      </p>
    </article>
  )
}
