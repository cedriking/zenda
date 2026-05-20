import Link from 'next/link'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Bot, CalendarClock, Smartphone, Bell, Brain, UserCheck } from 'lucide-react'

const FEATURES = [
  { icon: Bot, title: 'AI Receptionist', desc: 'Handles customer conversations naturally in English and Spanish, 24/7.' },
  { icon: CalendarClock, title: 'Smart Scheduling', desc: 'Books, confirms, reschedules, and cancels appointments automatically.' },
  { icon: Smartphone, title: 'WhatsApp Native', desc: 'Your customers chat via WhatsApp — no app to install, no friction.' },
  { icon: Bell, title: 'Automated Reminders', desc: '24h and 2h reminders reduce no-shows by up to 40%.' },
  { icon: Brain, title: 'Learns Your Business', desc: 'Trains on your services, hours, and policies. Gets smarter over time.' },
  { icon: UserCheck, title: 'Human Takeover', desc: 'You or your staff can step in anytime. Seamless handoff back to AI.' },
]

const HOW_IT_WORKS = [
  { step: '1', title: 'Connect WhatsApp', desc: 'Link your business WhatsApp in seconds via the desktop app.' },
  { step: '2', title: 'Set Up Your Profile', desc: 'Tell Zenda about your services, hours, and staff. Takes 5 minutes.' },
  { step: '3', title: 'Go Live', desc: 'Zenda starts handling customer messages and booking appointments.' },
]

const FAQS = [
  { q: 'Do my customers need to install anything?', a: 'No. They just message your WhatsApp number as usual. Zenda works behind the scenes.' },
  { q: 'Can I take over a conversation manually?', a: 'Yes. One click to take over, one click to hand back to AI. Full control, always.' },
  { q: 'What languages does Zenda support?', a: 'English and Spanish, with natural, conversational responses in both languages.' },
  { q: 'Is my data secure?', a: 'All conversations are encrypted. Your data stays in your workspace. We never share it.' },
  { q: 'Can I cancel anytime?', a: 'Yes, no contracts. Cancel from the dashboard or billing portal at any time.' },
]

export default function Home() {
  return (
    <div className="min-h-screen">
      <Nav variant="home" />

      {/* Hero */}
      <main>
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            AI Receptionist for Appointment-Based Businesses
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Your AI receptionist<br />that never misses a message
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Zenda handles customer conversations, books appointments, and sends reminders — all through WhatsApp. Built for businesses in Latin America.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="text-base px-8 h-12">
              <Link href="/signup">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base px-8 h-12">
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Everything you need to stop missing appointments</h2>
          <p className="text-muted-foreground text-center mb-14 max-w-2xl mx-auto">
            From first message to confirmed appointment, Zenda handles it all.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map(f => {
              const Icon = f.icon
              return (
                <Card key={f.title} className="bg-card hover:shadow-lg transition">
                  <CardContent>
                    <Icon className="size-8 text-primary mb-4" strokeWidth={1.5} />
                    <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-14">Up and running in 3 steps</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(h => (
              <div key={h.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {h.step}
                </div>
                <h3 className="font-semibold mb-2">{h.title}</h3>
                <p className="text-muted-foreground text-sm">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 px-6 bg-muted">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple pricing, powerful features</h2>
          <p className="text-muted-foreground mb-8">Starting at $19/month for solo businesses. No per-message fees.</p>
          <Button asChild size="lg" className="text-base px-8 h-12">
            <Link href="/pricing">View Plans</Link>
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-14">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {FAQS.map(f => (
              <Card key={f.q}>
                <CardContent>
                  <h3 className="font-semibold mb-2">{f.q}</h3>
                  <p className="text-muted-foreground text-sm">{f.a}</p>
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
