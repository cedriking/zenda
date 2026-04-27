import Link from 'next/link'

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#faq', label: 'FAQ' },
]

const FEATURES = [
  { icon: '🤖', title: 'AI Receptionist', desc: 'Handles customer conversations naturally in English and Spanish, 24/7.' },
  { icon: '📅', title: 'Smart Scheduling', desc: 'Books, confirms, reschedules, and cancels appointments automatically.' },
  { icon: '📱', title: 'WhatsApp Native', desc: 'Your customers chat via WhatsApp — no app to install, no friction.' },
  { icon: '🔔', title: 'Automated Reminders', desc: '24h and 2h reminders reduce no-shows by up to 40%.' },
  { icon: '🧠', title: 'Learns Your Business', desc: 'Trains on your services, hours, and policies. Gets smarter over time.' },
  { icon: '👩‍💼', title: 'Human Takeover', desc: 'You or your staff can step in anytime. Seamless handoff back to AI.' },
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
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-[var(--border)] z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[var(--primary)]">Zenda</Link>
          <div className="hidden md:flex gap-8 text-sm text-[var(--text-muted)]">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="hover:text-[var(--text)] transition">{l.label}</Link>
            ))}
          </div>
          <Link href="/signup" className="bg-[var(--primary)] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-indigo-50 text-[var(--primary)] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            AI Receptionist for Appointment-Based Businesses
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Your AI receptionist<br />that never misses a message
          </h1>
          <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10">
            Zenda handles customer conversations, books appointments, and sends reminders — all through WhatsApp. Built for businesses in Latin America.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="bg-[var(--primary)] text-white px-8 py-3.5 rounded-lg font-medium text-lg hover:bg-[var(--primary-dark)] transition">
              Start Free Trial
            </Link>
            <Link href="#how-it-works" className="border border-[var(--border)] text-[var(--text)] px-8 py-3.5 rounded-lg font-medium text-lg hover:bg-gray-50 transition">
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-[var(--bg-muted)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Everything you need to stop missing appointments</h2>
          <p className="text-[var(--text-muted)] text-center mb-14 max-w-2xl mx-auto">
            From first message to confirmed appointment, Zenda handles it all.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-[var(--border)] hover:shadow-lg transition">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
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
                <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {h.step}
                </div>
                <h3 className="font-semibold mb-2">{h.title}</h3>
                <p className="text-[var(--text-muted)] text-sm">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 px-6 bg-[var(--bg-muted)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple pricing, powerful features</h2>
          <p className="text-[var(--text-muted)] mb-8">Starting at $29/month for solo businesses. No per-message fees.</p>
          <Link href="/pricing" className="inline-block bg-[var(--primary)] text-white px-8 py-3.5 rounded-lg font-medium text-lg hover:bg-[var(--primary-dark)] transition">
            View Plans
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-14">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {FAQS.map(f => (
              <div key={f.q} className="border border-[var(--border)] rounded-lg p-6">
                <h3 className="font-semibold mb-2">{f.q}</h3>
                <p className="text-[var(--text-muted)] text-sm">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-lg font-bold text-[var(--primary)]">Zenda</div>
          <div className="flex gap-6 text-sm text-[var(--text-muted)]">
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/terms">Terms</Link>
            <Link href="/pricing">Pricing</Link>
          </div>
          <div className="text-sm text-[var(--text-muted)]">&copy; {new Date().getFullYear()} Zenda</div>
        </div>
      </footer>
    </div>
  )
}
