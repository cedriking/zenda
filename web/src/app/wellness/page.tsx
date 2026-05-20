import type { Metadata } from 'next'
import { VerticalPage, type VerticalPageConfig } from '@/components/vertical-page'

export const metadata: Metadata = {
  title: 'AI Receptionist for Wellness Studios — Zenda',
  description: 'Automate booking for your wellness or spa business with an AI receptionist via WhatsApp.',
}

const config: VerticalPageConfig = {
  slug: 'wellness',
  title: 'Wellness & Spa',
  headline: 'AI Receptionist for Wellness & Spa',
  description: 'Massage, yoga, acupuncture — Zenda manages your bookings and client communication while you focus on what matters.',
  metadata,
  featuresSectionTitle: 'Built for wellness businesses',
  features: [
    { title: 'Online Booking via WhatsApp', desc: 'Clients book massages, yoga classes, and treatments by texting your business number. No app needed.' },
    { title: 'Automated Reminders', desc: '24h and 2h WhatsApp reminders reduce no-shows by up to 40%. Keep your schedule full.' },
    { title: 'Service Catalog', desc: 'List all your services with prices and durations. AI knows exactly what to offer each client.' },
    { title: 'Bilingual Support', desc: 'English and Spanish. Serve a diverse clientele without extra reception staff.' },
    { title: 'Rescheduling Made Easy', desc: 'Clients reschedule with a simple message. AI handles the calendar changes automatically.' },
    { title: 'Human Takeover', desc: 'Step in anytime with one click. Seamlessly hand back to AI when you are done.' },
  ],
}

export default function WellnessPage() {
  return <VerticalPage config={config} />
}
