import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Zenda — AI Receptionist for Your Business',
    template: '%s — Zenda',
  },
  description: 'Multilingual AI receptionist that handles appointments, reminders, and customer conversations via WhatsApp. Built for businesses in Latin America.',
  keywords: ['AI receptionist', 'WhatsApp scheduling', 'appointment booking', 'Latin America', 'automated reminders', 'bilingual AI', 'beauty salon software', 'clinic scheduling'],
  authors: [{ name: 'Zenda' }],
  openGraph: {
    title: 'Zenda — AI Receptionist for Your Business',
    description: 'Your AI receptionist that never misses a message. Handles customer conversations, appointments, and reminders via WhatsApp.',
    url: 'https://zenda.ai',
    siteName: 'Zenda',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zenda — AI Receptionist',
    description: 'AI receptionist that handles appointments and customer conversations via WhatsApp.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Zenda',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'macOS, Windows',
    description: 'AI receptionist for appointment-based businesses. Handles customer conversations, scheduling, and reminders via WhatsApp.',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '19',
      highPrice: '99',
      priceCurrency: 'USD',
      offerCount: '3',
    },
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
