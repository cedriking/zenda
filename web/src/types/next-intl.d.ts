import type { NextIntlClientProvider as _NextIntlClientProvider } from 'next-intl/react-client'
import type { useTranslations as _useTranslations } from 'next-intl/react-client'
import type { useFormatter as _useFormatter } from 'next-intl/react-client'
import type { useLocale as _useLocale } from 'next-intl/react-client'
import type { useNow as _useNow } from 'next-intl/react-client'
import type { useTimeZone as _useTimeZone } from 'next-intl/react-client'
import type { useMessages as _useMessages } from 'next-intl/react-client'

declare module 'next-intl' {
  export const NextIntlClientProvider: typeof _NextIntlClientProvider
  export const useTranslations: typeof _useTranslations
  export const useFormatter: typeof _useFormatter
  export const useLocale: typeof _useLocale
  export const useNow: typeof _useNow
  export const useTimeZone: typeof _useTimeZone
  export const useMessages: typeof _useMessages
}
