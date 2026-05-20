import Link from 'next/link'
import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Check } from 'lucide-react'

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

      <main>
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-block bg-amber-100 text-amber-800 px-4 py-2 rounded-lg text-sm font-semibold mb-4">
              Founding Member Pricing — Limited Time
            </div>
            <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
            <p className="text-muted-foreground text-lg">No per-message fees. No surprises. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map(plan => (
              <Card key={plan.name} className={`relative ${plan.highlight ? 'ring-2 ring-primary shadow-lg' : ''}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                    {plan.originalPrice && (
                      <span className="ml-2 text-lg text-muted-foreground line-through">${plan.originalPrice}</span>
                    )}
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="size-4 text-primary mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild variant={plan.highlight ? 'default' : 'outline'} className="w-full">
                    <Link href="/signup">{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  )
}
