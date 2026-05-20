import Link from 'next/link'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { HomeAnimations } from '@/components/home-animations'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Nav variant="home" />

      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-24 px-6 overflow-hidden">
          {/* Background gradient orbs */}
          <div className="gradient-orb w-[500px] h-[500px] -top-40 -right-40 bg-primary/30" />
          <div className="gradient-orb w-[400px] h-[400px] top-20 -left-40 bg-chart-2/20" />

          <div className="relative max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              AI Receptionist for Appointment-Based Businesses
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              Your AI receptionist<br />
              <span className="gradient-text">that never misses a message</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Zenda handles customer conversations, books appointments, and sends reminders — all through WhatsApp. Built for businesses in Latin America.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 h-12 shadow-lg shadow-primary/20">
                <Link href="/signup">Start Free Trial</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8 h-12">
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="relative py-24 px-6">
          <div className="gradient-orb w-[300px] h-[300px] top-0 left-1/2 bg-chart-3/15" />
          <div className="relative max-w-6xl mx-auto">
            <HomeAnimations variant="section-header">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Everything you need to stop missing appointments</h2>
              <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto text-lg">
                From first message to confirmed appointment, Zenda handles it all.
              </p>
            </HomeAnimations>

            <HomeAnimations variant="features" />
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="relative py-24 px-6">
          <div className="gradient-orb w-[400px] h-[400px] -bottom-20 right-0 bg-primary/10" />
          <div className="relative max-w-4xl mx-auto">
            <HomeAnimations variant="section-header">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Up and running in 3 steps</h2>
            </HomeAnimations>

            <HomeAnimations variant="steps" />
          </div>
        </section>

        {/* CTA / Pricing Teaser */}
        <section className="relative py-24 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5" />
          <div className="gradient-orb w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary/20" />
          <div className="relative max-w-3xl mx-auto text-center">
            <HomeAnimations variant="section-header">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple pricing, powerful features</h2>
              <p className="text-muted-foreground mb-8 text-lg">Starting at $19/month for solo businesses. No per-message fees.</p>
              <Button asChild size="lg" className="text-base px-8 h-12 shadow-lg shadow-primary/20">
                <Link href="/pricing">View Plans</Link>
              </Button>
            </HomeAnimations>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <HomeAnimations variant="section-header">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>
            </HomeAnimations>
            <HomeAnimations variant="faq" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
