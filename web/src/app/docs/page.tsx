import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documentation — Zenda',
  description: 'Getting started guides and documentation for Zenda AI receptionist.',
}

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

        {/* Getting Started */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Getting Started</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Step 1: Create Your Account</h3>
              <p className="text-gray-600 mb-3">Sign up at <Link href="/signup" className="text-[var(--primary)] underline">zenda.ai/signup</Link> with your name, email, and a password. No credit card required — you get a 14-day free trial.</p>
              <p className="text-gray-600">After signing up, you&apos;ll be guided to download the desktop app for macOS or Windows.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Step 2: Connect Your WhatsApp</h3>
              <p className="text-gray-600 mb-3">Open the Zenda desktop app and log in. You&apos;ll see a WhatsApp connection screen with a QR code.</p>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Open WhatsApp on your phone</li>
                <li>Go to <strong>Settings &gt; Linked Devices &gt; Link a Device</strong></li>
                <li>Scan the QR code shown in Zenda</li>
                <li>Wait for the &quot;Connected!&quot; confirmation</li>
              </ol>
              <p className="text-gray-600 mt-3">Your WhatsApp is now linked. Customers who message your number will interact with your AI receptionist.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Step 3: Set Up Your Business Profile</h3>
              <p className="text-gray-600 mb-3">The onboarding chat will walk you through configuring your business. You&apos;ll set up:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li><strong>Business name &amp; category</strong> — e.g., &quot;Maria&apos;s Beauty Studio&quot;, &quot;Health Clinic&quot;</li>
                <li><strong>Services</strong> — name, duration, and optional price for each service</li>
                <li><strong>Business hours</strong> — your availability per day of the week</li>
                <li><strong>Cancellation policy</strong> — e.g., &quot;Cancel at least 2 hours before&quot;</li>
                <li><strong>Receptionist personality</strong> — name, tone (professional, warm, friendly), and greeting</li>
              </ul>
              <p className="text-gray-600 mt-3">This takes about 5 minutes. You can always change these later from Settings.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Step 4: Go Live</h3>
              <p className="text-gray-600">Once setup is complete, your AI receptionist starts handling customer messages immediately. Try sending a test message to your own WhatsApp number to see it in action.</p>
            </div>
          </div>
        </section>

        {/* Managing Conversations */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Managing Conversations</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Auto Mode</h3>
              <p className="text-gray-600">By default, all conversations are in <strong>auto mode</strong>. Your AI receptionist handles the entire conversation: greeting, answering questions, checking availability, and booking appointments.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Human Takeover</h3>
              <p className="text-gray-600 mb-3">Click <strong>&quot;Take Over&quot;</strong> on any conversation to switch from AI to manual mode. You can type directly to the customer through the dashboard. When you&apos;re done, click <strong>&quot;Return to Auto&quot;</strong> to hand the conversation back to the AI.</p>
              <p className="text-gray-600">The AI will also automatically escalate to you when it encounters something it can&apos;t handle (complaints, refund requests, unusual questions).</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Needs Attention</h3>
              <p className="text-gray-600">When the AI escalates, the conversation shows an orange &quot;Needs Attention&quot; badge. You&apos;ll see a notification in the top bar. Click the conversation to review what happened and decide whether to take over or let the AI continue.</p>
            </div>
          </div>
        </section>

        {/* Customizing Your AI */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Customizing Your AI</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Receptionist Settings</h3>
              <p className="text-gray-600">Go to <strong>Settings &gt; Receptionist</strong> to change:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 mt-2">
                <li><strong>Name</strong> — what the AI calls itself (e.g., &quot;Noa&quot;, &quot;Sofia&quot;)</li>
                <li><strong>Tone</strong> — Professional, Warm, Friendly, Elegant, or Casual</li>
                <li><strong>Greeting template</strong> — the first message customers see</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Knowledge Base</h3>
              <p className="text-gray-600 mb-3">Go to <strong>Settings &gt; Knowledge Base</strong> to add frequently asked questions and answers. This teaches your AI about things specific to your business:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>&quot;Do you accept credit cards?&quot; &rarr; &quot;Yes, we accept all major credit cards and cash.&quot;</li>
                <li>&quot;Is there parking?&quot; &rarr; &quot;Free street parking is available on weekdays.&quot;</li>
                <li>&quot;Do you offer group discounts?&quot; &rarr; &quot;Groups of 5+ get 10% off.&quot;</li>
              </ul>
              <p className="text-gray-600 mt-3">The more you add, the smarter your AI becomes at handling customer questions.</p>
            </div>
          </div>
        </section>

        {/* Billing */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Billing &amp; Plans</h2>
          <div className="space-y-4">
            <p className="text-gray-600">All plans include a 14-day free trial. No credit card required to start.</p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border border-[var(--border)] rounded-lg p-4">
                <h4 className="font-semibold">Starter — $19/mo</h4>
                <p className="text-sm text-gray-500 mt-1">500 conversations, 100 appointments, 1 staff member</p>
              </div>
              <div className="border border-[var(--primary)] rounded-lg p-4">
                <h4 className="font-semibold">Pro — $49/mo</h4>
                <p className="text-sm text-gray-500 mt-1">2,000 conversations, 500 appointments, 5 staff members</p>
              </div>
              <div className="border border-[var(--border)] rounded-lg p-4">
                <h4 className="font-semibold">Business — $99/mo</h4>
                <p className="text-sm text-gray-500 mt-1">Unlimited, 20 staff, API access, dedicated support</p>
              </div>
            </div>
            <p className="text-gray-600">Cancel anytime from Settings. No contracts, no hidden fees. <Link href="/pricing" className="text-[var(--primary)] underline">See full pricing</Link>.</p>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Common Questions</h2>
          <div className="space-y-4">
            <div className="border border-[var(--border)] rounded-lg p-4">
              <h3 className="font-semibold mb-1">Do my customers need to install anything?</h3>
              <p className="text-sm text-gray-600">No. They message your WhatsApp number as usual. Zenda works behind the scenes.</p>
            </div>
            <div className="border border-[var(--border)] rounded-lg p-4">
              <h3 className="font-semibold mb-1">What languages does the AI support?</h3>
              <p className="text-sm text-gray-600">English and Spanish. The AI automatically detects which language the customer is using and responds in kind.</p>
            </div>
            <div className="border border-[var(--border)] rounded-lg p-4">
              <h3 className="font-semibold mb-1">Can I still use WhatsApp normally?</h3>
              <p className="text-sm text-gray-600">Yes. When you take over a conversation, you type directly through Zenda. Your phone&apos;s WhatsApp continues to work normally for personal chats.</p>
            </div>
            <div className="border border-[var(--border)] rounded-lg p-4">
              <h3 className="font-semibold mb-1">What happens if the AI makes a mistake?</h3>
              <p className="text-sm text-gray-600">You can take over any conversation at any time. The AI is designed to escalate to you when unsure. You can also cancel or reschedule any appointment from the Calendar.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
