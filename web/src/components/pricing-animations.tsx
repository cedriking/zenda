'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { FadeUp, StaggerContainer, StaggerChild } from '@/components/motion'
import { Check, ArrowRight } from 'lucide-react'

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
  const t = useTranslations('pricing')

  return (
    <>
      <FadeUp>
        <div className="text-center mb-14">
          <div className="inline-block bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            {t('badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">{t('title')}</h1>
          <p className="text-slate-500 text-lg">{t('desc')}</p>
        </div>
      </FadeUp>

      <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto" stagger={0.15}>
        {plans.map(plan => (
          <StaggerChild key={plan.name}>
            <div className={`relative rounded-[1.5rem] p-6 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 ${
              plan.highlight
                ? 'bg-slate-950 text-white shadow-2xl ring-2 ring-emerald-500/30'
                : 'bg-white border border-slate-100 shadow-lg hover:shadow-xl'
            }`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                  {t('mostPopular')}
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-black ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <p className={`text-sm mt-1 ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>
              </div>

              <div className="mb-6">
                {plan.originalPrice > plan.price && (
                  <span className={`text-sm line-through mr-2 ${plan.highlight ? 'text-slate-600' : 'text-slate-300'}`}>
                    ${plan.originalPrice}
                  </span>
                )}
                <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                  ${plan.price}
                </span>
                <span className={`text-sm ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{t('perMonth')}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className={`size-4 shrink-0 mt-0.5 ${plan.highlight ? 'text-emerald-400' : 'text-emerald-500'}`} />
                    <span className={`text-sm ${plan.highlight ? 'text-slate-300' : 'text-slate-600'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`inline-flex items-center justify-center rounded-full py-3 text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {plan.cta}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </div>
          </StaggerChild>
        ))}
      </StaggerContainer>
    </>
  )
}
