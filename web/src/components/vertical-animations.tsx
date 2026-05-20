'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FadeUp, StaggerContainer, StaggerChild } from '@/components/motion'

interface VerticalAnimationsProps {
  variant: 'hero' | 'features'
  headline?: string
  description?: string
  title?: string
  features?: { title: string; desc: string }[]
}

export function VerticalAnimations({ variant, headline, description, title, features }: VerticalAnimationsProps) {
  if (variant === 'hero') {
    return (
      <>
        <FadeUp>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{headline}</h1>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">{description}</p>
        </FadeUp>
        <FadeUp delay={0.2}>
          <Button asChild size="lg" className="text-base px-8 h-12 shadow-lg shadow-primary/20">
            <Link href="/signup">Start Free Trial</Link>
          </Button>
        </FadeUp>
      </>
    )
  }

  if (variant === 'features' && title && features) {
    return (
      <>
        <FadeUp>
          <h2 className="text-2xl font-bold text-center mb-10">{title}</h2>
        </FadeUp>
        <StaggerContainer className="grid md:grid-cols-3 gap-6" stagger={0.1}>
          {features.map(f => (
            <StaggerChild key={f.title}>
              <div className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </StaggerChild>
          ))}
        </StaggerContainer>
      </>
    )
  }

  return null
}
