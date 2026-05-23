import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { PricingAnimations } from '@/components/pricing-animations'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pricing')
  return {
    title: t('title'),
    description: t('desc'),
  }
}

export default async function PricingPage() {
  const t = await getTranslations('pricing')

  const PLANS = [
    {
      name: t('soloName'),
      price: 29,
      desc: t('soloDesc'),
      features: [
        t('soloFeature1'),
        t('soloFeature2'),
        t('soloFeature3'),
        t('soloFeature4'),
        t('soloFeature5'),
      ],
      cta: t('ctaTrial'),
      highlight: false,
    },
    {
      name: t('starterName'),
      price: 49,
      desc: t('starterDesc'),
      features: [
        t('starterFeature1'),
        t('starterFeature2'),
        t('starterFeature3'),
        t('starterFeature4'),
        t('starterFeature5'),
        t('starterFeature6'),
      ],
      cta: t('ctaTrial'),
      highlight: true,
    },
    {
      name: t('proName'),
      price: 89,
      desc: t('proDesc'),
      features: [
        t('proFeature1'),
        t('proFeature2'),
        t('proFeature3'),
        t('proFeature4'),
        t('proFeature5'),
        t('proFeature6'),
      ],
      cta: t('ctaTrial'),
      highlight: false,
    },
    {
      name: t('businessName'),
      price: 149,
      desc: t('businessDesc'),
      features: [
        t('businessFeature1'),
        t('businessFeature2'),
        t('businessFeature3'),
        t('businessFeature4'),
        t('businessFeature5'),
        t('businessFeature6'),
      ],
      cta: t('ctaSales'),
      highlight: false,
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-200 pt-16">
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
            <h2 className="text-2xl font-black text-slate-900 mb-4">{t('faqTitle')}</h2>
            <div className="space-y-4 mt-8">
              {[
                { q: t('faq1Q'), a: t('faq1A') },
                { q: t('faq2Q'), a: t('faq2A') },
                { q: t('faq3Q'), a: t('faq3A') },
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
