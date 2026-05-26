import { languageMap, type UILanguage } from "@zenda/shared/i18n";
import type { i18n } from "i18next";
import { LOCAL_STORAGE_KEYS } from "@/constants";

export function setAppLanguage(lang: string, i18n: i18n) {
  localStorage.setItem(LOCAL_STORAGE_KEYS.LANGUAGE, lang);
  i18n.changeLanguage(lang);
  document.documentElement.lang = lang;

  const entry = languageMap[lang];
  document.documentElement.dir = entry?.dir === "rtl" ? "rtl" : "ltr";
}

export function updateAppLanguage(i18n: i18n) {
  const localLang = localStorage.getItem(LOCAL_STORAGE_KEYS.LANGUAGE);
  if (!localLang) {
    return;
  }

  i18n.changeLanguage(localLang);
  document.documentElement.lang = localLang;

  const entry = languageMap[localLang];
  document.documentElement.dir = entry?.dir === "rtl" ? "rtl" : "ltr";
}

export function detectSystemLanguage(): UILanguage {
  const supported = [
    "en",
    "es",
    "ar",
    "fr",
    "de",
    "ru",
    "zh",
    "ja",
    "ko",
  ] as const;
  const browserLangs = navigator.languages || [navigator.language];

  for (const bl of browserLangs) {
    const code = bl.split("-")[0].toLowerCase();
    if (supported.includes(code as UILanguage)) {
      return code as UILanguage;
    }
  }
  return "en";
}
