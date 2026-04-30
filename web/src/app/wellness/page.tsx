import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Receptionist for Wellness Studios — Zenda',
  description: 'Automate booking for your wellness or spa business with an AI receptionist via WhatsApp.',
}

const FEATURES = [
  { title: 'Online Booking via WhatsApp', desc: 'Clients book massages, yoga classes, and treatments by texting your business number. No app needed.' },
  { title: 'Automated Reminders', desc: '24h and 2h WhatsApp reminders reduce no-shows by up to 40%. Keep your schedule full.' },
  { title: 'Service Catalog', desc: 'List all your services with prices and durations. AI knows exactly what to offer each client.' },
  { title: 'Bilingual Support', desc: 'English and Spanish. Serve a diverse clientele without extra reception staff.' },
  { title: 'Rescheduling Made Easy', desc: 'Clients reschedule with a simple message. AI handles the calendar changes automatically.' },
  { title: 'Human Takeover', desc: 'Step in anytime with one click. Seamlessly hand back to AI when you are done.' },
]

export default function WellnessPage() {
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
            <h1 className="text-4xl font-bold mb-4">AI Receptionist for Wellness & Spa</h1>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-8">
              Massage, yoga, acupuncture — Zenda manages your bookings and client communication while you focus on what matters.
            </p>
            <Link href="/signup" className="inline-block bg-[var(--primary)] text-white px-8 py-3.5 rounded-lg font-medium text-lg hover:bg-[var(--primary-dark)] transition">
              Start Free Trial
            </Link>
          </div>
        </section>

        <section className="py-16 px-6 bg-[var(--bg-muted)]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10">Built for wellness businesses</h2>
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
