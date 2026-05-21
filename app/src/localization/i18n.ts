import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { en, es, ar, fr, de, ru, zh, ja, ko } from '@zenda/shared/i18n'
import { LOCAL_STORAGE_KEYS } from '@/constants'

i18n.use(LanguageDetector).use(initReactI18next).init({
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    es: { translation: es },
    ar: { translation: ar },
    fr: { translation: fr },
    de: { translation: de },
    ru: { translation: ru },
    zh: { translation: zh },
    ja: { translation: ja },
    ko: { translation: ko },
  },
  detection: {
    order: ['localStorage', 'navigator'],
    lookupLocalStorage: LOCAL_STORAGE_KEYS.LANGUAGE,
    caches: ['localStorage'],
  },
})
