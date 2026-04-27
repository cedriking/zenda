import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Zenda',
  description: 'Zenda privacy policy.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="text-xl font-bold text-[var(--primary)]">Zenda</Link>
        </div>
      </nav>
      <article className="max-w-3xl mx-auto px-6 py-12 prose prose-slate">
        <h1>Privacy Policy</h1>
        <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>

        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly (account details, business profile) and information generated through use of the service (conversations, appointment data, usage metrics).</p>

        <h2>2. How We Use Information</h2>
        <p>We use your information to provide and improve the Zenda service, process billing, send notifications, and provide customer support.</p>

        <h2>3. Data Storage</h2>
        <p>Your data is stored securely with encryption at rest and in transit. Conversation data is associated with your workspace and is not shared with third parties.</p>

        <h2>4. Customer Messages</h2>
        <p>Messages sent by your customers via WhatsApp are processed by our AI to handle appointments and inquiries. These messages are stored in your workspace and can be deleted by you at any time.</p>

        <h2>5. Data Retention</h2>
        <p>We retain your data for as long as your account is active. Upon account deletion, data is removed within 30 days.</p>

        <h2>6. Your Rights</h2>
        <p>You can export or delete your data at any time from your dashboard settings. Contact us at privacy@zenda.ai for any data-related requests.</p>

        <h2>7. Contact</h2>
        <p>For privacy questions, contact us at privacy@zenda.ai.</p>
      </article>
    </div>
  )
}
