import Link from 'next/link'
import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

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

      <main className="flex-1">
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">{config.headline}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {config.description}
            </p>
            <Button asChild size="lg" className="text-base px-8 h-12">
              <Link href="/signup">Start Free Trial</Link>
            </Button>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10">{config.featuresSectionTitle}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {config.features.map(f => (
                <Card key={f.title}>
                  <CardContent>
                    <h3 className="font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
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
