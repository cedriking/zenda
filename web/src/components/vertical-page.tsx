import Link from 'next/link'
import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { VerticalAnimations } from '@/components/vertical-animations'

export interface VerticalPageConfig {
  slug: string
  title: string
  headline: string
  description: string
  metadata: Metadata
  featuresSectionTitle: string
  features: { title: string; desc: string }[]
}

export function VerticalPage({ config }: { config: VerticalPageConfig }) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-200 pt-16">
      <Nav variant="simple" />

      <main className="flex-1 relative overflow-hidden">
        <div className="bg-white rounded-b-[2rem] shadow-2xl">
          <section className="relative py-20 px-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="max-w-4xl mx-auto text-center">
              <VerticalAnimations variant="hero" headline={config.headline} description={config.description} />
            </div>
          </section>

          <section className="relative py-16 px-6">
            <div className="max-w-4xl mx-auto">
              <VerticalAnimations variant="features" title={config.featuresSectionTitle} features={config.features} />
            </div>
          </section>
        </div>

        {/* CTA section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-950 rounded-[2rem] p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
                Ready to automate {config.title.toLowerCase()}?
              </h2>
              <p className="text-slate-400 mb-6">
                Start your 14-day free trial today. No credit card required.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-emerald-600 transition-colors shadow-xl shadow-emerald-500/25"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
