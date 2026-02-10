import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Translate } from './components/Translate'
import { LanguageSelector } from './components/LanguageSelector'

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
          <section aria-labelledby="intro-heading">
            <Translate
              tid="intro.heading"
              as="h2"
              id="intro-heading"
              className="sr-only"
            />
            <Translate
              tid="intro.body"
              as="p"
              className="text-stone-700 leading-relaxed"
            />
          </section>

          <section className="mt-12" aria-labelledby="coming-soon-heading">
            <Translate
              tid="comingSoon.heading"
              as="h2"
              id="coming-soon-heading"
              className="text-lg font-medium text-stone-600"
            />
            <Translate
              tid="comingSoon.body"
              as="p"
              className="mt-2 text-stone-500"
            />
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
