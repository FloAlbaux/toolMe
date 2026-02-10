import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Translate } from './components/Translate'
import { LanguageSelector } from './components/LanguageSelector'
import { LandingHighlight } from './components/LandingHighlight'
import { ProjectCard } from './components/ProjectCard'
import { mockProjects } from './data/mockProjects'

function useDocumentLang() {
  const { i18n } = useTranslation()
  useEffect(() => {
    document.documentElement.lang = i18n.language
    const handler = () => {
      document.documentElement.lang = i18n.language
    }
    i18n.on('languageChanged', handler)
    return () => i18n.off('languageChanged', handler)
  }, [i18n])
}

export default function App() {
  useDocumentLang()

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-toolme-primary)] focus:text-white focus:rounded-md"
      >
        <Translate tid="common.skipToMainContent" />
      </a>

      <div className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <header
          className="border-b border-stone-200 bg-white"
          role="banner"
        >
          <div className="mx-auto flex max-w-4xl items-start justify-between gap-4 px-4 py-6 sm:px-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                <span className="text-[var(--color-toolme-primary)]">
                  <Translate tid="brand.name" />
                </span>
              </h1>
              <Translate
                tid="brand.tagline"
                as="p"
                className="mt-1 text-stone-600 text-lg"
              />
            </div>
            <LanguageSelector />
          </div>
        </header>

        <main
          id="main"
          className="mx-auto max-w-4xl px-4 py-12 sm:px-6"
          role="main"
          tabIndex={-1}
        >
          <LandingHighlight />

          <section className="mt-12" aria-labelledby="projects-heading">
            <Translate
              tid="projects.heading"
              as="h2"
              id="projects-heading"
              className="text-xl font-semibold text-stone-900 mb-6"
            />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
              {mockProjects.map((project) => (
                <li key={project.id}>
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          </section>
        </main>

        <footer
          className="mt-auto border-t border-stone-200 bg-white py-6"
          role="contentinfo"
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <Translate
              tid="footer.tagline"
              as="p"
              className="text-sm text-stone-500"
            />
          </div>
        </footer>
      </div>
    </>
  )
}
