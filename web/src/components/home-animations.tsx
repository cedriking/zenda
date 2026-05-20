'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  FadeUp,
  StaggerContainer,
  StaggerChild,
  FloatingElement,
  AccordionItem,
} from '@/components/motion'
import { useState } from 'react'
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

export function HomeAnimations({
  variant,
  children,
}: {
  variant: 'section-header' | 'features' | 'steps' | 'faq'
  children?: React.ReactNode
}) {
  if (variant === 'section-header') {
    return <FadeUp>{children}</FadeUp>
  }

  if (variant === 'features') {
    return (
      <StaggerContainer className="grid md:grid-cols-3 gap-6" stagger={0.12}>
        {FEATURES.map(f => {
          const Icon = f.icon
          return (
            <StaggerChild key={f.title}>
              <div className="group relative rounded-2xl border border-border bg-card p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="size-6 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            </StaggerChild>
          )
        })}
      </StaggerContainer>
    )
  }

  if (variant === 'steps') {
    return (
      <div className="relative">
        <div className="hidden md:block absolute top-6 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40" />

        <StaggerContainer className="grid md:grid-cols-3 gap-8" stagger={0.2}>
          {HOW_IT_WORKS.map(s => (
            <StaggerChild key={s.step}>
              <div className="text-center relative">
                <div className="relative mx-auto mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto relative z-10 shadow-lg shadow-primary/20">
                    {s.step}
                  </div>
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            </StaggerChild>
          ))}
        </StaggerContainer>
      </div>
    )
  }

  if (variant === 'faq') {
    return (
      <StaggerContainer className="space-y-3" stagger={0.08}>
        {FAQS.map(f => (
          <StaggerChild key={f.q}>
            <FAQItem question={f.q} answer={f.a} />
          </StaggerChild>
        ))}
      </StaggerContainer>
    )
  }

  return null
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return <AccordionItem question={question} answer={answer} isOpen={open} onToggle={() => setOpen(!open)} />
}
