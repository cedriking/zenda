import Link from 'next/link'
import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
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
    <div className="min-h-screen">
      <Nav variant="simple" />

      <main className="relative overflow-hidden">
        <div className="gradient-orb w-[400px] h-[400px] -top-20 right-0 bg-primary/15" />
        <div className="gradient-orb w-[300px] h-[300px] bottom-0 -left-20 bg-chart-2/10" />

        <section className="relative py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <PricingAnimations plans={PLANS} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
