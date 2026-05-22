import { ar, de, en, es, fr, ja, ko, ru, zh } from "@zenda/shared/i18n";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { LOCAL_STORAGE_KEYS } from "@/constants";

function detectLanguage(): string {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.LANGUAGE);
  if (stored) {
    return stored;
  }
  const navLangs = navigator.languages ?? [navigator.language];
  for (const lang of navLangs) {
    const code = lang.split("-")[0];
    if (["en", "es", "ar", "fr", "de", "ru", "zh", "ja", "ko"].includes(code)) {
      return code;
    }
  }
  return "en";
}

const detected = detectLanguage();
localStorage.setItem(LOCAL_STORAGE_KEYS.LANGUAGE, detected);

i18n.use(initReactI18next).init({
  lng: detected,
  fallbackLng: "en",
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
});
