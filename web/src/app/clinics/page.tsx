import type { Metadata } from 'next'
import { VerticalPage, type VerticalPageConfig } from '@/components/vertical-page'

export const metadata: Metadata = {
  title: 'AI Receptionist for Clinics — Zenda',
  description: 'Automate appointment scheduling for your dental, medical, or health clinic with an AI receptionist via WhatsApp.',
}

const config: VerticalPageConfig = {
  slug: 'clinics',
  title: 'Health Clinics',
  headline: 'AI Receptionist for Health Clinics',
  description: 'Dental, medical, and health clinics trust Zenda to handle scheduling, patient reminders, and intake questions — all via WhatsApp.',
  metadata,
  featuresSectionTitle: 'Built for health clinics',
  features: [
    { title: 'Patient Scheduling', desc: 'AI handles new bookings, follow-ups, and cancellations 24/7. No more missed calls during consultations.' },
    { title: 'Appointment Reminders', desc: 'Automatic 24h and 2h WhatsApp reminders. Reduce no-shows by up to 40% without lifting a finger.' },
    { title: 'Intake Questions', desc: 'AI answers common questions about services, hours, insurance, and preparation instructions.' },
    { title: 'Staff Assignment', desc: 'Route patients to the right practitioner based on specialty and availability.' },
    { title: 'Bilingual Support', desc: 'English and Spanish. Serve diverse patient populations without additional staff.' },
    { title: 'Secure Communication', desc: 'All conversations are encrypted. Workspace-isolated data with full audit trails.' },
  ],
}

export default function ClinicsPage() {
  return <VerticalPage config={config} />
}
