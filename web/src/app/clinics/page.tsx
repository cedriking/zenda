import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Receptionist for Clinics — Zenda',
  description: 'Automate appointment scheduling for your dental, medical, or health clinic with an AI receptionist.',
}

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
    </div>
  )
}
