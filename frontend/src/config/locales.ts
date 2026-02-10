/**
 * Locales shown in the language selector.
 * Add a locale here and in src/locales/{lng}.json when you add a new language.
 */
export const selectorLocales = [
  { i18nCode: 'en' as const, region: 'GB' },
  { i18nCode: 'fr' as const, region: 'FR' },
] as const

/** Unicode flag emoji from ISO 3166-1 alpha-2 region (e.g. GB -> 🇬🇧). No network. */
export function getFlagEmoji(region: string): string {
  if (!/^[A-Z]{2}$/i.test(region)) return ''
  const base = 0x1f1e6 - 65 // Regional Indicator Symbol Letter A
  const chars = region.toUpperCase().split('')
  return String.fromCodePoint(...chars.map((ch) => base + ch.charCodeAt(0)))
}
