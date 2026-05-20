import Link from 'next/link'
import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
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
    <div className="min-h-screen flex flex-col">
      <Nav variant="simple" />

      <main className="flex-1 relative overflow-hidden">
        <div className="gradient-orb w-[400px] h-[400px] -top-20 right-0 bg-primary/15" />
        <div className="gradient-orb w-[300px] h-[300px] bottom-0 -left-20 bg-chart-2/10" />

        <section className="relative py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <VerticalAnimations variant="hero" headline={config.headline} description={config.description} />
          </div>
        </section>

        <section className="relative py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <VerticalAnimations variant="features" title={config.featuresSectionTitle} features={config.features} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
