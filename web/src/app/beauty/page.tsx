import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Receptionist for Beauty Salons — Zenda',
  description: 'Automate appointment booking for your beauty salon with an AI receptionist via WhatsApp.',
}

export default function BeautyPage() {
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
          <h1 className="text-4xl font-bold mb-4">AI Receptionist for Beauty Salons</h1>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-8">
            Your clients book haircuts, manicures, and treatments via WhatsApp — Zenda handles the scheduling, reminders, and cancellations automatically.
          </p>
          <Link href="/signup" className="inline-block bg-[var(--primary)] text-white px-8 py-3.5 rounded-lg font-medium text-lg hover:bg-[var(--primary-dark)] transition">
            Start Free Trial
          </Link>
        </div>
      </section>

      <section className="py-16 px-6 bg-[var(--bg-muted)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Built for beauty businesses</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-5 border border-[var(--border)]">
              <h3 className="font-semibold mb-2">Service Catalog</h3>
              <p className="text-sm text-gray-500">List all your services with prices and durations. AI knows exactly what to offer.</p>
            </div>
            <div className="bg-white rounded-lg p-5 border border-[var(--border)]">
              <h3 className="font-semibold mb-2">Bilingual Support</h3>
              <p className="text-sm text-gray-500">English and Spanish. Serve a diverse client base without hiring extra staff.</p>
            </div>
            <div className="bg-white rounded-lg p-5 border border-[var(--border)]">
              <h3 className="font-semibold mb-2">No-Show Reduction</h3>
              <p className="text-sm text-gray-500">Automatic 24h and 2h reminders via WhatsApp. Reduce no-shows by up to 40%.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
