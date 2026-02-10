import { Translate } from './Translate'
import { LanguageSelector } from './LanguageSelector'

export function Header() {
  return (
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
  )
}
