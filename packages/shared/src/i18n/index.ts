export { ar } from "./ar.js";
export { de } from "./de.js";
export type { TranslationStrings } from "./en.js";
export { en } from "./en.js";
export { es } from "./es.js";
export { fr } from "./fr.js";
export { ja } from "./ja.js";
export { ko } from "./ko.js";
export { ru } from "./ru.js";
export { zh } from "./zh.js";

export const supportedLanguages = [
  {
    key: "en",
    nativeName: "English",
    englishName: "English",
    dir: "ltr" as const,
  },
  {
    key: "es",
    nativeName: "Español",
    englishName: "Spanish",
    dir: "ltr" as const,
  },
  {
    key: "ar",
    nativeName: "العربية",
    englishName: "Arabic",
    dir: "rtl" as const,
  },
  {
    key: "fr",
    nativeName: "Français",
    englishName: "French",
    dir: "ltr" as const,
  },
  {
    key: "de",
    nativeName: "Deutsch",
    englishName: "German",
    dir: "ltr" as const,
  },
  {
    key: "ru",
    nativeName: "Русский",
    englishName: "Russian",
    dir: "ltr" as const,
  },
  {
    key: "zh",
    nativeName: "中文",
    englishName: "Chinese",
    dir: "ltr" as const,
  },
  {
    key: "ja",
    nativeName: "日本語",
    englishName: "Japanese",
    dir: "ltr" as const,
  },
  {
    key: "ko",
    nativeName: "한국어",
    englishName: "Korean",
    dir: "ltr" as const,
  },
] as const;

export type UILanguage = (typeof supportedLanguages)[number]["key"];

export const languageMap = Object.fromEntries(
  supportedLanguages.map((l) => [l.key, l])
) as Record<string, (typeof supportedLanguages)[number]>;
