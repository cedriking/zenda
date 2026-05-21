import Link from 'next/link'
import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { PricingAnimations } from '@/components/pricing-animations'

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
    <div className="min-h-screen bg-neutral-200">
      <Nav variant="simple" />

      <main className="relative overflow-hidden">
        <div className="bg-white rounded-b-[2rem] shadow-2xl">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <PricingAnimations plans={PLANS} />
          </div>
        </div>

        {/* Bottom section */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-black text-slate-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4 mt-8">
              {[
                { q: 'Can I switch plans anytime?', a: 'Yes. Upgrade or downgrade from the dashboard. Changes take effect immediately.' },
                { q: 'Is there a free trial?', a: 'Yes — 14 days free, no credit card required. Cancel anytime during the trial.' },
                { q: 'What happens if I exceed my limits?', a: 'We\'ll notify you before you hit limits. You can upgrade or wait until the next cycle.' },
              ].map(item => (
                <div key={item.q} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-lg text-left">
                  <h3 className="font-bold text-slate-900 mb-1">{item.q}</h3>
                  <p className="text-sm text-slate-500">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
