'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { FadeUp, StaggerContainer, StaggerChild } from '@/components/motion'

const GETTING_STARTED = [
  {
    title: 'Step 1: Create Your Account',
    content: (
      <>
        <p className="text-muted-foreground mb-3">Sign up at <Link href="/signup" className="text-primary underline">zenda.ai/signup</Link> with your name, email, and a password. No credit card required — you get a 14-day free trial.</p>
        <p className="text-muted-foreground">After signing up, you&apos;ll be guided to download the desktop app for macOS or Windows.</p>
      </>
    ),
  },
  {
    title: 'Step 2: Connect Your WhatsApp',
    content: (
      <>
        <p className="text-muted-foreground mb-3">Open the Zenda desktop app and log in. You&apos;ll see a WhatsApp connection screen with a QR code.</p>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>Open WhatsApp on your phone</li>
          <li>Go to <strong>Settings &gt; Linked Devices &gt; Link a Device</strong></li>
          <li>Scan the QR code shown in Zenda</li>
          <li>Wait for the &quot;Connected!&quot; confirmation</li>
        </ol>
        <p className="text-muted-foreground mt-3">Your WhatsApp is now linked. Customers who message your number will interact with your AI receptionist.</p>
      </>
    ),
  },
  {
    title: 'Step 3: Set Up Your Business Profile',
    content: (
      <>
        <p className="text-muted-foreground mb-3">The onboarding chat will walk you through configuring your business. You&apos;ll set up:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li><strong>Business name &amp; category</strong> — e.g., &quot;Maria&apos;s Beauty Studio&quot;, &quot;Health Clinic&quot;</li>
          <li><strong>Services</strong> — name, duration, and optional price for each service</li>
          <li><strong>Business hours</strong> — your availability per day of the week</li>
          <li><strong>Cancellation policy</strong> — e.g., &quot;Cancel at least 2 hours before&quot;</li>
          <li><strong>Receptionist personality</strong> — name, tone (professional, warm, friendly), and greeting</li>
        </ul>
        <p className="text-muted-foreground mt-3">This takes about 5 minutes. You can always change these later from Settings.</p>
      </>
    ),
  },
  {
    title: 'Step 4: Go Live',
    content: (
      <p className="text-muted-foreground">Once setup is complete, your AI receptionist starts handling customer messages immediately. Try sending a test message to your own WhatsApp number to see it in action.</p>
    ),
  },
]

const CONVERSATIONS = [
  {
    title: 'Auto Mode',
    content: <p className="text-muted-foreground">By default, all conversations are in <strong>auto mode</strong>. Your AI receptionist handles the entire conversation: greeting, answering questions, checking availability, and booking appointments.</p>,
  },
  {
    title: 'Human Takeover',
    content: (
      <>
        <p className="text-muted-foreground mb-3">Click <strong>&quot;Take Over&quot;</strong> on any conversation to switch from AI to manual mode. You can type directly to the customer through the dashboard. When you&apos;re done, click <strong>&quot;Return to Auto&quot;</strong> to hand the conversation back to the AI.</p>
        <p className="text-muted-foreground">The AI will also automatically escalate to you when it encounters something it can&apos;t handle (complaints, refund requests, unusual questions).</p>
      </>
    ),
  },
  {
    title: 'Needs Attention',
    content: <p className="text-muted-foreground">When the AI escalates, the conversation shows an orange &quot;Needs Attention&quot; badge. You&apos;ll see a notification in the top bar. Click the conversation to review what happened and decide whether to take over or let the AI continue.</p>,
  },
]

const CUSTOMIZATION = [
  {
    title: 'Receptionist Settings',
    content: (
      <>
        <p className="text-muted-foreground">Go to <strong>Settings &gt; Receptionist</strong> to change:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
          <li><strong>Name</strong> — what the AI calls itself (e.g., &quot;Noa&quot;, &quot;Sofia&quot;)</li>
          <li><strong>Tone</strong> — Professional, Warm, Friendly, Elegant, or Casual</li>
          <li><strong>Greeting template</strong> — the first message customers see</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Knowledge Base',
    content: (
      <>
        <p className="text-muted-foreground mb-3">Go to <strong>Settings &gt; Knowledge Base</strong> to add frequently asked questions and answers. This teaches your AI about things specific to your business:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>&quot;Do you accept credit cards?&quot; &rarr; &quot;Yes, we accept all major credit cards and cash.&quot;</li>
          <li>&quot;Is there parking?&quot; &rarr; &quot;Free street parking is available on weekdays.&quot;</li>
          <li>&quot;Do you offer group discounts?&quot; &rarr; &quot;Groups of 5+ get 10% off.&quot;</li>
        </ul>
        <p className="text-muted-foreground mt-3">The more you add, the smarter your AI becomes at handling customer questions.</p>
      </>
    ),
  },
]

const FAQ_ITEMS = [
  { q: 'Do my customers need to install anything?', a: 'No. They message your WhatsApp number as usual. Zenda works behind the scenes.' },
  { q: 'What languages does the AI support?', a: 'English and Spanish. The AI automatically detects which language the customer is using and responds in kind.' },
  { q: 'Can I still use WhatsApp normally?', a: "Yes. When you take over a conversation, you type directly through Zenda. Your phone's WhatsApp continues to work normally for personal chats." },
  { q: 'What happens if the AI makes a mistake?', a: 'You can take over any conversation at any time. The AI is designed to escalate to you when unsure. You can also cancel or reschedule any appointment from the Calendar.' },
]

function Section({ title, items }: { title: string; items: { title: string; content: React.ReactNode }[] }) {
  return (
    <section className="mb-16">
      <FadeUp>
        <h2 className="text-2xl font-bold mb-8">{title}</h2>
      </FadeUp>
      <div className="space-y-8">
        {items.map(item => (
          <FadeUp key={item.title}>
            <div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              {item.content}
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  )
}

export function DocsAnimations() {
  return (
    <div className="relative">
      <FadeUp>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Documentation</h1>
        <p className="text-lg text-muted-foreground mb-12">Everything you need to get your AI receptionist up and running.</p>
      </FadeUp>

      <Section title="Getting Started" items={GETTING_STARTED} />
      <Section title="Managing Conversations" items={CONVERSATIONS} />
      <Section title="Customizing Your AI" items={CUSTOMIZATION} />

      {/* Billing */}
      <section className="mb-16">
        <FadeUp>
          <h2 className="text-2xl font-bold mb-8">Billing &amp; Plans</h2>
        </FadeUp>
        <FadeUp>
          <p className="text-muted-foreground mb-4">All plans include a 14-day free trial. No credit card required to start.</p>
        </FadeUp>
        <StaggerContainer className="grid md:grid-cols-3 gap-4 mb-4" stagger={0.1}>
          <StaggerChild>
            <Card>
              <CardContent>
                <h4 className="font-semibold">Starter — $19/mo</h4>
                <p className="text-sm text-muted-foreground mt-1">500 conversations, 100 appointments, 1 staff member</p>
              </CardContent>
            </Card>
          </StaggerChild>
          <StaggerChild>
            <Card className="ring-2 ring-primary">
              <CardContent>
                <h4 className="font-semibold">Pro — $49/mo</h4>
                <p className="text-sm text-muted-foreground mt-1">2,000 conversations, 500 appointments, 5 staff members</p>
              </CardContent>
            </Card>
          </StaggerChild>
          <StaggerChild>
            <Card>
              <CardContent>
                <h4 className="font-semibold">Business — $99/mo</h4>
                <p className="text-sm text-muted-foreground mt-1">Unlimited, 20 staff, API access, dedicated support</p>
              </CardContent>
            </Card>
          </StaggerChild>
        </StaggerContainer>
        <FadeUp>
          <p className="text-muted-foreground">Cancel anytime from Settings. No contracts, no hidden fees. <Link href="/pricing" className="text-primary underline">See full pricing</Link>.</p>
        </FadeUp>
      </section>

      {/* FAQ */}
      <section>
        <FadeUp>
          <h2 className="text-2xl font-bold mb-8">Common Questions</h2>
        </FadeUp>
        <StaggerContainer className="space-y-3" stagger={0.08}>
          {FAQ_ITEMS.map(item => (
            <StaggerChild key={item.q}>
              <div className="rounded-xl border border-border p-4 hover:shadow-sm transition">
                <h3 className="font-semibold mb-1">{item.q}</h3>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </div>
            </StaggerChild>
          ))}
        </StaggerContainer>
      </section>
    </div>
  )
}
