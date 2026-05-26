import { defineRouting } from "next-intl/routing";

export const supportedLanguages = [
  { key: "es", nativeName: "Español", dir: "ltr" as const },
  { key: "en", nativeName: "English", dir: "ltr" as const },
  { key: "ar", nativeName: "العربية", dir: "rtl" as const },
  { key: "fr", nativeName: "Français", dir: "ltr" as const },
  { key: "de", nativeName: "Deutsch", dir: "ltr" as const },
  { key: "ru", nativeName: "Русский", dir: "ltr" as const },
  { key: "zh", nativeName: "中文", dir: "ltr" as const },
  { key: "ja", nativeName: "日本語", dir: "ltr" as const },
  { key: "ko", nativeName: "한국어", dir: "ltr" as const },
] as const;

export type Locale = (typeof supportedLanguages)[number]["key"];

export const locales = supportedLanguages.map((l) => l.key) as Locale[];
export const defaultLocale: Locale = "en";

export const routing = defineRouting({
  locales,
  defaultLocale,
});
