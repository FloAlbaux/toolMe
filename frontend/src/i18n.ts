import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import fr from './locales/fr.json'

export const defaultNS = 'translation' as const
export const supportedLngs = ['en', 'fr'] as const
export type SupportedLng = (typeof supportedLngs)[number]

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: [...supportedLngs],
  defaultNS,
  resources: {
    en: { [defaultNS]: en },
    fr: { [defaultNS]: fr },
  },
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: true,
  },
})

export default i18n
