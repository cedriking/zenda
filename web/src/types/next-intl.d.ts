import type {
  NextIntlClientProvider as _NextIntlClientProvider,
  useFormatter as _useFormatter,
  useLocale as _useLocale,
  useMessages as _useMessages,
  useNow as _useNow,
  useTimeZone as _useTimeZone,
  useTranslations as _useTranslations,
} from "next-intl/react-client";

declare module "next-intl" {
  export const NextIntlClientProvider: typeof _NextIntlClientProvider;
  export const useTranslations: typeof _useTranslations;
  export const useFormatter: typeof _useFormatter;
  export const useLocale: typeof _useLocale;
  export const useNow: typeof _useNow;
  export const useTimeZone: typeof _useTimeZone;
  export const useMessages: typeof _useMessages;
}
