import type { Metadata } from 'next'
import { VerticalPage, type VerticalPageConfig } from '@/components/vertical-page'

export const metadata: Metadata = {
  title: 'AI Receptionist for Beauty Salons — Zenda',
  description: 'Automate appointment booking for your beauty salon with an AI receptionist via WhatsApp.',
}

const config: VerticalPageConfig = {
  slug: 'beauty',
  title: 'Beauty Salons',
  headline: 'AI Receptionist for Beauty Salons',
  description: 'Your clients book haircuts, manicures, and treatments via WhatsApp — Zenda handles the scheduling, reminders, and cancellations automatically.',
  metadata,
  featuresSectionTitle: 'Built for beauty businesses',
  features: [
    { title: 'Service Catalog', desc: 'List all your services with prices and durations. AI knows exactly what to offer.' },
    { title: 'Automated Reminders', desc: '24h and 2h WhatsApp reminders. Reduce no-shows by up to 40%.' },
    { title: 'Bilingual Support', desc: 'English and Spanish. Serve a diverse clientele without extra reception staff.' },
    { title: 'Easy Rescheduling', desc: 'Clients reschedule with a simple message. AI updates the calendar automatically.' },
    { title: 'Staff Assignment', desc: 'Route appointments to the right stylist or technician based on availability.' },
    { title: 'Human Takeover', desc: 'Step in anytime. Seamless handoff back to AI when you are done.' },
  ],
}

export default function BeautyPage() {
  return <VerticalPage config={config} />
}
