export { en } from './en.js'
export { es } from './es.js'
export type { TranslationStrings } from './en.js'

export const languages = {
  en: { name: 'English', nativeName: 'English' },
  es: { name: 'Spanish', nativeName: 'Español' },
} as const

export type LanguageCode = keyof typeof languages
