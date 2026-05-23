import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing, supportedLanguages, type Locale } from '@/i18n/routing'
import { LocaleProvider } from '@/components/locale-provider'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    title: {
      default: t('title.default'),
      template: t('title.template'),
    },
    description: t('description'),
    keywords: t.raw('keywords'),
    authors: [{ name: 'Zenda' }],
    openGraph: {
      title: t('openGraph.title'),
      description: t('openGraph.description'),
      url: 'https://zenda.ai',
      siteName: 'Zenda',
      locale,
      type: 'website',
      images: [{ url: 'https://zenda.ai/og-image.png', width: 1200, height: 630, alt: 'Zenda AI Receptionist' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('twitter.title'),
      description: t('twitter.description'),
      images: ['https://zenda.ai/og-image.png'],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://zenda.ai/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `https://zenda.ai/${l}`])
      ),
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = await getMessages()
  const lang = supportedLanguages.find((l) => l.key === locale)
  const dir = lang?.dir ?? 'ltr'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Zenda',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'macOS, Windows',
    description:
      'AI receptionist for appointment-based businesses. Handles customer conversations, scheduling, and reminders via WhatsApp.',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '29',
      highPrice: '149',
      priceCurrency: 'USD',
      offerCount: '4',
    },
  }

  return (
    <html lang={locale} dir={dir}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <LocaleProvider locale={locale} messages={messages}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  )
}
