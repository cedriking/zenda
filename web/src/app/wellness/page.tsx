import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Receptionist for Wellness Studios — Zenda',
  description: 'Automate booking for your wellness or spa business with an AI receptionist via WhatsApp.',
}

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
    </div>
  )
}
