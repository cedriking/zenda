'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { FadeUp, StaggerContainer, StaggerChild } from '@/components/motion'
import { ArrowRight } from 'lucide-react'

interface VerticalAnimationsProps {
  variant: 'hero' | 'features'
  headline?: string
  description?: string
  title?: string
  features?: { title: string; desc: string }[]
}

export function VerticalAnimations({ variant, headline, description, title, features }: VerticalAnimationsProps) {
  const t = useTranslations('verticals')

  if (variant === 'hero') {
    return (
      <>
        <FadeUp>
          <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-100">
            {t('badge')}
          </span>
        </FadeUp>
        <FadeUp delay={0.1}>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">{headline}</h1>
        </FadeUp>
        <FadeUp delay={0.2}>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">{description}</p>
        </FadeUp>
        <FadeUp delay={0.3}>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-emerald-600 transition-colors shadow-xl shadow-emerald-500/25"
          >
            {t('ctaButton')}
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </FadeUp>
      </>
    )
  }

  if (variant === 'features' && title && features) {
    return (
      <>
        <FadeUp>
          <h2 className="text-2xl font-black text-center mb-10 text-slate-900">{title}</h2>
        </FadeUp>
        <StaggerContainer className="grid md:grid-cols-3 gap-6" stagger={0.1}>
          {features.map(f => (
            <StaggerChild key={f.title}>
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            </StaggerChild>
          ))}
        </StaggerContainer>
      </>
    )
  }

  return null
}
