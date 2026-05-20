'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FadeUp, StaggerContainer, StaggerChild } from '@/components/motion'
import { Check } from 'lucide-react'

interface Plan {
  name: string
  price: number
  originalPrice: number
  desc: string
  features: string[]
  cta: string
  highlight: boolean
}

export function PricingAnimations({ plans }: { plans: Plan[] }) {
  return (
    <>
      <FadeUp>
        <div className="text-center mb-14">
          <div className="inline-block bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Founding Member Pricing — Limited Time
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h1>
          <p className="text-muted-foreground text-lg">No per-message fees. No surprises. Cancel anytime.</p>
        </div>
      </FadeUp>

      <StaggerContainer className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto" stagger={0.15}>
        {plans.map(plan => (
          <StaggerChild key={plan.name}>
            <div className={`relative rounded-2xl border bg-card p-6 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
              plan.highlight ? 'border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/30' : 'border-border hover:shadow-primary/5'
            }`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </div>
              )}

              <div className="mb-1">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
              </div>

              <div className="my-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
                {plan.originalPrice && (
                  <span className="ml-2 text-lg text-muted-foreground line-through">${plan.originalPrice}</span>
                )}
              </div>

              <ul className="space-y-3 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="size-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <Button asChild variant={plan.highlight ? 'default' : 'outline'} className="w-full">
                  <Link href="/signup">{plan.cta}</Link>
                </Button>
              </div>
            </div>
          </StaggerChild>
        ))}
      </StaggerContainer>
    </>
  )
}
