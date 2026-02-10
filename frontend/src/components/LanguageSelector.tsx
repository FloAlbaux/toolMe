import { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { selectorLocales, getFlagEmoji } from '../config/locales'

const LISTBOX_ID = 'language-selector-listbox'
const BUTTON_ID = 'language-selector-button'

function getLanguageDisplayName(langCode: string, displayInLang: string): string {
  try {
    return new Intl.DisplayNames([displayInLang], { type: 'language' }).of(langCode) ?? langCode
  } catch {
    return langCode
  }
}

export function LanguageSelector() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentLang = i18n.language
  const currentLocale = selectorLocales.find((l) => l.i18nCode === currentLang) ?? selectorLocales[0]
  const currentLabel = getLanguageDisplayName(currentLocale.i18nCode, currentLang)
  const currentFlag = getFlagEmoji(currentLocale.region)

  const close = () => {
    setOpen(false)
    setFocusedIndex(-1)
  }

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIndex((i) => (i < selectorLocales.length - 1 ? i + 1 : 0))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIndex((i) => (i > 0 ? i - 1 : selectorLocales.length - 1))
        return
      }
      if (e.key === 'Enter' && focusedIndex >= 0 && selectorLocales[focusedIndex]) {
        e.preventDefault()
        i18n.changeLanguage(selectorLocales[focusedIndex].i18nCode)
        close()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, focusedIndex, i18n])

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close()
      }
    }
    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <button
        id={BUTTON_ID}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={LISTBOX_ID}
        aria-label={currentLabel}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-sm text-stone-700 shadow-sm transition hover:bg-stone-50 focus-visible:outline-offset-2"
      >
        <span className="text-lg leading-none" aria-hidden>
          {currentFlag}
        </span>
        <span className="max-w-[4rem] truncate sm:max-w-none">{currentLabel}</span>
        <span
          className={`ml-0.5 inline-block size-0 border-x-4 border-b-0 border-t-4 border-x-transparent border-t-stone-500 transition ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          id={LISTBOX_ID}
          role="listbox"
          aria-labelledby={BUTTON_ID}
          className="absolute right-0 top-full z-50 mt-1 max-h-[min(20rem,50vh)] min-w-[10rem] overflow-auto rounded-md border border-stone-200 bg-white py-1 shadow-lg"
        >
          {selectorLocales.map((loc, index) => {
            const label = getLanguageDisplayName(loc.i18nCode, currentLang)
            const flag = getFlagEmoji(loc.region)
            const isSelected = loc.i18nCode === currentLang
            const isFocused = index === focusedIndex
            return (
              <li
                key={loc.i18nCode}
                role="option"
                aria-selected={isSelected}
                tabIndex={-1}
                data-focused={isFocused || undefined}
                className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 ${isSelected ? 'bg-stone-50 font-medium' : ''} ${isFocused ? 'bg-stone-100' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault()
                  i18n.changeLanguage(loc.i18nCode)
                  close()
                }}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                <span className="text-lg leading-none" aria-hidden>
                  {flag}
                </span>
                <span>{label}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
