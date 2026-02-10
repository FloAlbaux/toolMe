import { Link } from 'react-router-dom'
import { Translate } from '../components/Translate'
import { LandingHighlight } from '../components/LandingHighlight'
import { ProjectCard } from '../components/ProjectCard'
import { mockProjects } from '../data/mockProjects'

export function HomePage() {
  return (
    <>
      <LandingHighlight />

      <section className="mt-12" aria-labelledby="projects-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
          <Translate
            tid="projects.heading"
            as="h2"
            id="projects-heading"
            className="text-xl font-semibold text-stone-900"
          />
          <Link
            to="/publish"
            className="text-[var(--color-toolme-primary)] font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded"
          >
            <Translate tid="projects.publishCta" />
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
          {mockProjects.map((project) => (
            <li key={project.id}>
              <Link
                to={`/project/${project.id}`}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded-xl"
              >
                <ProjectCard project={project} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
