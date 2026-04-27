import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Zenda',
  description: 'Simple pricing for AI receptionist. Starter, Pro, and Business plans.',
}

const PLANS = [
  {
    name: 'Starter',
    price: 19,
    originalPrice: 29,
    desc: 'For solo businesses just getting started',
    features: [
      '500 conversations/month',
      '100 appointments/month',
      'WhatsApp integration',
      'Automated reminders',
      'English & Spanish',
      '1 staff member',
    ],
    cta: 'Start Free Trial',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 49,
    originalPrice: 69,
    desc: 'For growing businesses with a team',
    features: [
      '2,000 conversations/month',
      '500 appointments/month',
      'Everything in Starter',
      'Up to 5 staff members',
      'Voice note transcription',
      'Priority support',
      'Knowledge base',
    ],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Business',
    price: 99,
    originalPrice: 149,
    desc: 'For established businesses with high volume',
    features: [
      'Unlimited conversations',
      'Unlimited appointments',
      'Everything in Pro',
      'Up to 20 staff members',
      'API access',
      'Custom AI training',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[var(--primary)]">Zenda</Link>
          <Link href="/signup" className="bg-[var(--primary)] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition">
            Get Started
          </Link>
        </div>
      </nav>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-block bg-amber-100 text-amber-800 px-4 py-2 rounded-lg text-sm font-semibold mb-4">
              Founding Member Pricing — Limited Time
            </div>
            <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
            <p className="text-[var(--text-muted)] text-lg">No per-message fees. No surprises. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`rounded-xl border p-8 ${
                  plan.highlight
                    ? 'border-[var(--primary)] shadow-lg relative'
                    : 'border-[var(--border)]'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-[var(--text-muted)] mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-[var(--text-muted)]">/month</span>
                  {plan.originalPrice && (
                    <span className="ml-2 text-lg text-gray-400 line-through">${plan.originalPrice}</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="text-[var(--accent-green)] mt-0.5">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block text-center py-3 rounded-lg font-medium transition ${
                    plan.highlight
                      ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]'
                      : 'border border-[var(--border)] text-[var(--text)] hover:bg-gray-50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
