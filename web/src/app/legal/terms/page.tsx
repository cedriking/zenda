import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Terms of Service — Zenda',
  description: 'Zenda terms of service.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Nav variant="simple" />
      <article className="flex-1 max-w-3xl mx-auto px-6 py-12 prose prose-slate">
        <h1>Terms of Service</h1>
        <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>

        <h2>1. Acceptance of Terms</h2>
        <p>By using Zenda, you agree to these Terms of Service. If you do not agree, do not use the service.</p>

        <h2>2. Description of Service</h2>
        <p>Zenda provides an AI-powered receptionist service that handles customer conversations and appointment scheduling via WhatsApp integration.</p>

        <h2>3. Account Responsibilities</h2>
        <p>You are responsible for maintaining the security of your account credentials and for all activities under your account.</p>

        <h2>4. Acceptable Use</h2>
        <p>You agree not to use Zenda for any unlawful purpose, to spam customers, or to misrepresent your business.</p>

        <h2>5. Billing</h2>
        <p>Subscriptions are billed monthly or annually. You may cancel at any time. Refunds are handled on a case-by-case basis.</p>

        <h2>6. Limitation of Liability</h2>
        <p>Zenda is provided as-is. We are not liable for any missed appointments, lost conversations, or business losses resulting from service interruptions.</p>

        <h2>7. Modifications</h2>
        <p>We may update these terms with 30 days notice. Continued use after changes constitutes acceptance.</p>

        <h2>8. Contact</h2>
        <p>For questions about these terms, contact us at legal@zenda.ai.</p>
      </article>
      <Footer />
    </div>
  )
}
