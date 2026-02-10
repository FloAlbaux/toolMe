import { useTranslation } from 'react-i18next'
import { Translate } from './Translate'

const VALUE_KEYS = ['value1', 'value2', 'value3', 'value4'] as const

/**
 * Landing highlight block (Epic 2, F-01).
 * First thing users see: values (real projects, useful work, free, everyone) and sandbox metaphor.
 */
export function LandingHighlight() {
  const { i18n } = useTranslation()

  return (
    <section
      className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
      aria-labelledby="landing-highlight-heading"
    >
      <Translate
        tid="landingHighlight.heading"
        as="h2"
        id="landing-highlight-heading"
        className="sr-only"
      />
      <h3
        className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl"
        lang={i18n.language}
      >
        <Translate tid="landingHighlight.title" />
      </h3>
      <p className="mt-3 text-lg text-stone-600" lang={i18n.language}>
        <Translate tid="landingHighlight.lead" />
      </p>
      <ul
        className="mt-6 flex flex-wrap gap-2"
        aria-label="Values"
      >
        {VALUE_KEYS.map((key) => (
          <li key={key}>
            <span
              className="inline-flex items-center rounded-full bg-[var(--color-toolme-primary)]/10 px-3 py-1 text-sm font-medium text-[var(--color-toolme-primary)]"
              lang={i18n.language}
            >
              <Translate tid={`landingHighlight.${key}`} />
            </span>
          </li>
        ))}
      </ul>
      <p
        className="mt-6 border-l-4 border-[var(--color-toolme-primary)] pl-4 italic text-stone-700"
        lang={i18n.language}
      >
        <Translate tid="landingHighlight.metaphor" />
      </p>
    </section>
  )
}
