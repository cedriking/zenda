import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Receptionist for Clinics — Zenda',
  description: 'Automate appointment scheduling for your dental, medical, or health clinic with an AI receptionist via WhatsApp.',
}

const FEATURES = [
  { title: 'Patient Scheduling', desc: 'AI handles new bookings, follow-ups, and cancellations 24/7. No more missed calls during consultations.' },
  { title: 'Appointment Reminders', desc: 'Automatic 24h and 2h WhatsApp reminders. Reduce no-shows by up to 40% without lifting a finger.' },
  { title: 'Intake Questions', desc: 'AI answers common questions about services, hours, insurance, and preparation instructions.' },
  { title: 'Staff Assignment', desc: 'Route patients to the right practitioner based on specialty and availability.' },
  { title: 'Bilingual Support', desc: 'English and Spanish. Serve diverse patient populations without additional staff.' },
  { title: 'Secure Communication', desc: 'All conversations are encrypted. Workspace-isolated data with full audit trails.' },
]

export default function ClinicsPage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[var(--primary)]">Zenda</Link>
          <Link href="/signup" className="bg-[var(--primary)] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition">
            Start Free Trial
          </Link>
        </div>
      </nav>

      <main>
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">AI Receptionist for Health Clinics</h1>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-8">
              Dental, medical, and health clinics trust Zenda to handle scheduling, patient reminders, and intake questions — all via WhatsApp.
            </p>
            <Link href="/signup" className="inline-block bg-[var(--primary)] text-white px-8 py-3.5 rounded-lg font-medium text-lg hover:bg-[var(--primary-dark)] transition">
              Start Free Trial
            </Link>
          </div>
        </section>

        <section className="py-16 px-6 bg-[var(--bg-muted)]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10">Built for health clinics</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {FEATURES.map(f => (
                <div key={f.title} className="bg-white rounded-lg p-5 border border-[var(--border)]">
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
