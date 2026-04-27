import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documentation — Zenda',
  description: 'Getting started guides and documentation for Zenda AI receptionist.',
}

const GUIDES = [
  { title: 'Getting Started', desc: 'Set up your AI receptionist in 5 minutes', slug: 'getting-started' },
  { title: 'Connecting WhatsApp', desc: 'Link your business WhatsApp to Zenda', slug: 'whatsapp' },
  { title: 'Configuring Services', desc: 'Add your services, pricing, and duration', slug: 'services' },
  { title: 'Setting Availability', desc: 'Business hours, staff schedules, buffers', slug: 'availability' },
  { title: 'Customizing Your AI', desc: 'Tone, greeting, and receptionist personality', slug: 'receptionist' },
  { title: 'Knowledge Base', desc: 'Teach your AI FAQs and business info', slug: 'knowledge-base' },
  { title: 'Human Takeover', desc: 'When and how to step into conversations', slug: 'takeover' },
  { title: 'Billing & Plans', desc: 'Manage your subscription and usage', slug: 'billing' },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[var(--primary)]">Zenda</Link>
          <Link href="/signup" className="bg-[var(--primary)] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition">
            Get Started
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-4">Documentation</h1>
        <p className="text-lg text-[var(--text-muted)] mb-12">Everything you need to get your AI receptionist up and running.</p>

        <div className="grid md:grid-cols-2 gap-4">
          {GUIDES.map(guide => (
            <div key={guide.slug} className="border border-[var(--border)] rounded-lg p-5 hover:shadow-md transition">
              <h3 className="font-semibold text-gray-900 mb-1">{guide.title}</h3>
              <p className="text-sm text-gray-500">{guide.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
