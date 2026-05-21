'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import {
  FadeUp,
  StaggerContainer,
  StaggerChild,
  AccordionItem,
} from '@/components/motion'
import {
  Bot,
  CalendarClock,
  Smartphone,
  Bell,
  Brain,
  UserCheck,
  Shield,
  MessageSquare,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Globe,
  Zap,
  Heart,
  Stethoscope,
  Scissors,
  Star,
} from 'lucide-react'

/* ── Section label ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-100">
      {children}
    </span>
  )
}

/* ── Check line ── */
function CheckLine({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
      <span className="text-slate-600 text-sm leading-relaxed">{children}</span>
    </li>
  )
}

/* ── Main component ── */
export function HomeAnimations({
  variant,
  children,
}: {
  variant: 'hero' | 'audiences' | 'capabilities' | 'features' | 'safety' | 'how-it-works' | 'dashboard' | 'industries' | 'pricing-teaser' | 'faq' | 'cta'
  children?: React.ReactNode
}) {
  const t = useTranslations('home')

  /* ── Hero stats ── */
  const HERO_STATS = [
    { value: '10k+', label: t('statAppointments') },
    { value: '98%', label: t('statSatisfaction') },
    { value: '40%', label: t('statNoShows') },
  ]

  /* ── Audiences ── */
  const AUDIENCES = [
    { icon: Scissors, title: t('audienceBeautyTitle'), desc: t('audienceBeautyDesc') },
    { icon: Heart, title: t('audienceWellnessTitle'), desc: t('audienceWellnessDesc') },
    { icon: Stethoscope, title: t('audienceHealthTitle'), desc: t('audienceHealthDesc') },
    { icon: Star, title: t('audienceOtherTitle'), desc: t('audienceOtherDesc') },
  ]

  /* ── Capabilities ── */
  const CAPABILITIES = [
    { icon: Bot, title: t('capAiTitle'), desc: t('capAiDesc') },
    { icon: CalendarClock, title: t('capSchedulingTitle'), desc: t('capSchedulingDesc') },
    { icon: Bell, title: t('capRemindersTitle'), desc: t('capRemindersDesc') },
    { icon: Brain, title: t('capLearningTitle'), desc: t('capLearningDesc') },
    { icon: UserCheck, title: t('capTakeoverTitle'), desc: t('capTakeoverDesc') },
    { icon: Smartphone, title: t('capWhatsappTitle'), desc: t('capWhatsappDesc') },
  ]

  /* ── Feature sections with visuals ── */
  const FEATURE_SECTIONS = [
    {
      title: t('featureChatTitle'),
      desc: t('featureChatDesc'),
      visual: 'chat' as const,
    },
    {
      title: t('featureCalendarTitle'),
      desc: t('featureCalendarDesc'),
      visual: 'calendar' as const,
    },
    {
      title: t('featureSettingsTitle'),
      desc: t('featureSettingsDesc'),
      visual: 'settings' as const,
    },
    {
      title: t('featureSafetyTitle'),
      desc: t('featureSafetyDesc'),
      visual: 'safety' as const,
    },
  ]

  /* ── Safety pillars ── */
  const SAFETY_PILLARS = [
    { title: t('safetyConsentTitle'), desc: t('safetyConsentDesc') },
    { title: t('safetyLimitsTitle'), desc: t('safetyLimitsDesc') },
    { title: t('safetyAuditTitle'), desc: t('safetyAuditDesc') },
    { title: t('safetyGuardrailsTitle'), desc: t('safetyGuardrailsDesc') },
  ]

  /* ── Dashboard cards ── */
  const DASHBOARD_CARDS = [
    { title: t('dashAppointmentsTitle'), value: '8', change: t('dashAppointmentsChange') },
    { title: t('dashConversationsTitle'), value: '23', change: t('dashConversationsChange') },
    { title: t('dashBookingsTitle'), value: '34', change: t('dashBookingsChange') },
  ]

  /* ── Industries ── */
  const INDUSTRIES = [
    t('indBeauty'), t('indDental'), t('indHealth'), t('indBarber'),
    t('indGym'), t('indPet'), t('indConsulting'), t('indPhoto'),
    t('indMassage'), t('indNail'),
  ]

  /* ── How It Works ── */
  const HOW_IT_WORKS = [
    { step: '01', title: t('step1Title'), desc: t('step1Desc') },
    { step: '02', title: t('step2Title'), desc: t('step2Desc') },
    { step: '03', title: t('step3Title'), desc: t('step3Desc') },
  ]

  /* ── FAQs ── */
  const FAQS = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
    { q: t('faq4Q'), a: t('faq4A') },
    { q: t('faq5Q'), a: t('faq5A') },
    { q: t('faq6Q'), a: t('faq6A') },
  ]

  /* ── Visual Card sub-component ── */
  function VisualCard({ type }: { type: 'chat' | 'calendar' | 'settings' | 'safety' }) {
    if (type === 'chat') {
      return (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Bot className="size-4 text-emerald-600" />
            </div>
            <span className="text-sm font-semibold text-slate-900">Zenda AI</span>
            <span className="ml-auto text-xs text-slate-400">Online</span>
          </div>
          <div className="bg-emerald-50 rounded-xl rounded-tl-sm p-3 text-sm text-slate-700 max-w-[85%]">
            Hi! I&apos;d love to help you book an appointment. What service are you looking for?
          </div>
          <div className="bg-slate-100 rounded-xl rounded-tr-sm p-3 text-sm text-slate-700 max-w-[85%] ml-auto">
            I need a haircut and maybe a beard trim
          </div>
          <div className="bg-emerald-50 rounded-xl rounded-tl-sm p-3 text-sm text-slate-700 max-w-[85%]">
            Great choice! I have openings tomorrow at 10am and 2pm. Which works better for you?
          </div>
        </div>
      )
    }

    if (type === 'calendar') {
      return (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-900">Today</span>
            <span className="text-xs text-emerald-600 font-medium">3 bookings</span>
          </div>
          <div className="space-y-2">
            {[
              { time: '10:00', name: 'Maria García', service: 'Haircut + Beard', status: 'Confirmed' },
              { time: '14:00', name: 'Carlos López', service: 'Hair Treatment', status: 'Pending' },
              { time: '16:30', name: 'Ana Torres', service: 'Manicure', status: 'Confirmed' },
            ].map(apt => (
              <div key={apt.time} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 transition">
                <span className="text-xs font-mono text-slate-500 w-12">{apt.time}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{apt.name}</p>
                  <p className="text-xs text-slate-500">{apt.service}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  apt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>{apt.status}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (type === 'settings') {
      return (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4">
          <h4 className="text-sm font-semibold text-slate-900">Knowledge Base</h4>
          {[
            { q: 'Do you accept credit cards?', a: 'Yes, all major cards and cash.' },
            { q: 'Is there parking?', a: 'Free street parking on weekdays.' },
            { q: 'Do you offer group discounts?', a: 'Groups of 5+ get 10% off.' },
          ].map(item => (
            <div key={item.q} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm font-medium text-slate-700">{item.q}</p>
              <p className="text-xs text-slate-500 mt-1">{item.a}</p>
            </div>
          ))}
        </div>
      )
    }

    // safety
    return (
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="size-5 text-emerald-500" />
          <span className="text-sm font-semibold text-slate-900">Safety Dashboard</span>
        </div>
        {[
          { label: 'Opt-in Rate', value: '98%', good: true },
          { label: 'Messages Sent Today', value: '47 / 150', good: true },
          { label: 'Policy Compliance', value: '100%', good: true },
          { label: 'Escalations', value: '2 resolved', good: true },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
            <span className="text-xs text-slate-600">{item.label}</span>
            <span className={`text-xs font-semibold ${item.good ? 'text-emerald-600' : 'text-amber-600'}`}>{item.value}</span>
          </div>
        ))}
      </div>
    )
  }

  /* ── FAQ Item ── */
  function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [open, setOpen] = useState(false)
    return <AccordionItem question={question} answer={answer} isOpen={open} onToggle={() => setOpen(!open)} />
  }

  /* ── Hero ── */
  if (variant === 'hero') {
    return (
      <>
        <FadeUp>
          <SectionLabel>
            <Sparkles className="size-3" />
            {t('heroBadge')}
          </SectionLabel>
        </FadeUp>
        <FadeUp delay={0.1}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.05]">
            {t('heroTitle1')}<br />
            <span className="text-emerald-500">{t('heroTitle2')}</span>
          </h1>
        </FadeUp>
        <FadeUp delay={0.2}>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('heroDesc')}
          </p>
        </FadeUp>
        <FadeUp delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-emerald-600 transition-colors shadow-xl shadow-emerald-500/25"
            >
              {t('startFreeTrial')}
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3.5 text-base font-semibold text-white hover:bg-slate-800 transition-colors shadow-xl"
            >
              {t('seeHowItWorks')}
            </Link>
          </div>
        </FadeUp>
        <FadeUp delay={0.4}>
          <div className="flex flex-wrap justify-center gap-8 pt-4">
            {HERO_STATS.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl md:text-3xl font-black text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </FadeUp>
      </>
    )
  }

  /* ── Audiences ── */
  if (variant === 'audiences') {
    return (
      <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" stagger={0.1}>
        {AUDIENCES.map(a => {
          const Icon = a.icon
          return (
            <StaggerChild key={a.title}>
              <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                  <Icon className="size-6 text-emerald-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{a.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{a.desc}</p>
              </div>
            </StaggerChild>
          )
        })}
      </StaggerContainer>
    )
  }

  /* ── Capabilities ── */
  if (variant === 'capabilities') {
    return (
      <StaggerContainer className="grid md:grid-cols-3 gap-6" stagger={0.08}>
        {CAPABILITIES.map(c => {
          const Icon = c.icon
          return (
            <StaggerChild key={c.title}>
              <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                  <Icon className="size-6 text-emerald-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{c.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{c.desc}</p>
              </div>
            </StaggerChild>
          )
        })}
      </StaggerContainer>
    )
  }

  /* ── Feature sections with visuals ── */
  if (variant === 'features') {
    return (
      <div className="space-y-24">
        {FEATURE_SECTIONS.map((f, i) => (
          <FadeUp key={f.title}>
            <div className={`grid md:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'md:direction-rtl' : ''}`}>
              <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg mb-6">{f.desc}</p>
                <Link
                  href="/signup"
                  className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 transition-colors text-sm"
                >
                  {t('learnMore')} <ArrowRight className="ml-1 size-4" />
                </Link>
              </div>
              <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                <VisualCard type={f.visual} />
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    )
  }

  /* ── Safety (dark section) ── */
  if (variant === 'safety') {
    return (
      <StaggerContainer className="grid sm:grid-cols-2 gap-6" stagger={0.1}>
        {SAFETY_PILLARS.map(p => (
          <StaggerChild key={p.title}>
            <div className="p-6 rounded-2xl border border-slate-700 bg-slate-800/50">
              <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
            </div>
          </StaggerChild>
        ))}
      </StaggerContainer>
    )
  }

  /* ── How It Works ── */
  if (variant === 'how-it-works') {
    return (
      <div className="relative">
        <div className="hidden md:block absolute top-8 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-emerald-300 via-emerald-200 to-emerald-300" />
        <StaggerContainer className="grid md:grid-cols-3 gap-8" stagger={0.2}>
          {HOW_IT_WORKS.map(s => (
            <StaggerChild key={s.step}>
              <div className="text-center relative">
                <div className="relative mx-auto mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-lg font-black mx-auto shadow-lg shadow-emerald-500/30">
                    {s.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            </StaggerChild>
          ))}
        </StaggerContainer>
      </div>
    )
  }

  /* ── Dashboard mockup ── */
  if (variant === 'dashboard') {
    return (
      <FadeUp>
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="ml-4 text-xs text-slate-400">Zenda Dashboard</span>
          </div>
          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {DASHBOARD_CARDS.map(c => (
                <div key={c.title} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">{c.title}</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">{c.value}</p>
                  <p className="text-xs text-emerald-600 mt-1">{c.change}</p>
                </div>
              ))}
            </div>
            {/* Conversation preview */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-700">{t('dashActiveTitle')}</span>
                  <span className="text-xs text-emerald-600 font-medium">{t('dashActiveCount')}</span>
                </div>
                {[t('dashMsg1'), t('dashMsg2'), t('dashMsg3')].map(msg => (
                  <div key={msg} className="flex items-center gap-3 py-2 border-t border-slate-200 first:border-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <MessageSquare className="size-4 text-emerald-600" />
                    </div>
                    <span className="text-xs text-slate-600 truncate">{msg}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-700">{t('dashUpcomingTitle')}</span>
                  <span className="text-xs text-emerald-600 font-medium">{t('dashUpcomingCount')}</span>
                </div>
                {[
                  { time: '10:00', name: 'Maria García', service: 'Haircut + Beard' },
                  { time: '14:00', name: 'Carlos López', service: 'Hair Treatment' },
                  { time: '16:30', name: 'Ana Torres', service: 'Manicure' },
                ].map(apt => (
                  <div key={apt.time} className="flex items-center gap-3 py-2 border-t border-slate-200 first:border-0">
                    <span className="text-xs font-mono text-slate-400 w-12">{apt.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{apt.name}</p>
                      <p className="text-xs text-slate-400">{apt.service}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </FadeUp>
    )
  }

  /* ── Industries ── */
  if (variant === 'industries') {
    return (
      <div className="flex flex-wrap justify-center gap-3">
        {INDUSTRIES.map(ind => (
          <span key={ind} className="px-4 py-2 rounded-full bg-white border border-slate-200 text-sm text-slate-600 font-medium hover:border-emerald-300 hover:text-emerald-600 transition-colors cursor-default">
            {ind}
          </span>
        ))}
      </div>
    )
  }

  /* ── Pricing teaser ── */
  if (variant === 'pricing-teaser') {
    return (
      <div className="text-center">
        <p className="text-lg text-slate-600 mb-6">{t('pricingTeaser', { price: '$19' })}</p>
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-emerald-600 transition-colors shadow-xl shadow-emerald-500/25"
        >
          {t('viewPlans')}
          <ArrowRight className="ml-2 size-4" />
        </Link>
      </div>
    )
  }

  /* ── CTA ── */
  if (variant === 'cta') {
    return (
      <FadeUp>
        <div className="bg-slate-950 rounded-[2rem] p-8 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            {t('ctaTitle')}
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            {t('ctaDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-emerald-600 transition-colors shadow-xl shadow-emerald-500/25"
            >
              {t('startFreeTrial')}
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center justify-center rounded-full bg-white/10 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/20 transition-colors"
            >
              {t('ctaSecondary')}
            </Link>
          </div>
        </div>
      </FadeUp>
    )
  }

  /* ── FAQ ── */
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
