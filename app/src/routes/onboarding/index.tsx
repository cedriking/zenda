import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../../services/api-client'
import { useAuthStore } from '../../stores/auth'
import { openExternalLink } from '../../actions/shell'
import {
  Check, MessageSquare, Zap, Users, Building2,
  Sparkles, Send, ArrowRight,
} from 'lucide-react'

export const Route = createFileRoute('/onboarding/')({
  component: OnboardingPage,
})

const STEP_IDS = [
  'whatsapp_connected',
  'business_info',
  'services',
  'availability',
  'policies',
  'receptionist_config',
  'plan_selection',
] as const

const STEP_ICONS = ['📱', '🏢', '✂️', '🕐', '📋', '🤖', '🚀']

const PLAN_TIERS = [
  {
    id: 'local_solo' as const,
    price: 29,
    contacts: 50,
    icon: Zap,
    highlight: false,
  },
  {
    id: 'local_starter' as const,
    price: 49,
    contacts: 150,
    icon: MessageSquare,
    highlight: false,
  },
  {
    id: 'local_pro' as const,
    price: 89,
    contacts: 500,
    icon: Users,
    highlight: true,
  },
  {
    id: 'local_business' as const,
    price: 149,
    contacts: 1500,
    icon: Building2,
    highlight: false,
  },
]

const STEP_KEYS: Record<string, string> = {
  whatsapp_connected: 'onboarding.steps.connectWhatsapp',
  business_info: 'onboarding.steps.businessInfo',
  services: 'onboarding.steps.services',
  availability: 'onboarding.steps.availability',
  policies: 'onboarding.steps.policies',
  receptionist_config: 'onboarding.steps.receptionistSetup',
  plan_selection: 'onboarding.steps.choosePlan',
}

interface ChatMessage {
  role: 'assistant' | 'user'
  content: string
  id: number
}

let msgId = 0

function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [typingText, setTypingText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadedRef = useRef(false)

  const steps = STEP_IDS.map((id, idx) => ({
    id,
    label: t(STEP_KEYS[id] ?? id),
    icon: STEP_ICONS[idx],
  }))

  useEffect(() => {
    const t = setTimeout(() => setSidebarVisible(true), 200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true
      loadStatus()
    }
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingText])

  const typeMessage = useCallback((text: string, onComplete?: () => void) => {
    setIsTyping(true)
    setTypingText('')
    let i = 0
    const tick = () => {
      if (i < text.length) {
        setTypingText(text.slice(0, i + 1))
        i++
        typingRef.current = setTimeout(tick, 18 + Math.random() * 22)
      } else {
        setTypingText('')
        setIsTyping(false)
        setMessages(prev => [...prev, { role: 'assistant', content: text, id: ++msgId }])
        onComplete?.()
      }
    }
    typingRef.current = setTimeout(tick, 400)
    return () => { if (typingRef.current) clearTimeout(typingRef.current) }
  }, [])

  useEffect(() => {
    return () => { if (typingRef.current) clearTimeout(typingRef.current) }
  }, [])

  async function loadStatus() {
    try {
      const status = await apiFetch<{
        currentStep: string
        progress: number
        nextStep: string | null
        steps: string[]
      }>('/onboarding/status')

      setProgress(status.progress)
      setCurrentStep(status.currentStep)

      if (status.currentStep === 'ready') {
        navigate({ to: '/dashboard' })
        return
      }

      const q = await apiFetch<{ question: string; step: string }>('/onboarding/question')
      if (q) {
        setCurrentStep(q.step)
        setTimeout(() => typeMessage(q.question), 600)
      }
    } catch {
      setTimeout(() => typeMessage(t('onboarding.setupAssistantDesc')), 600)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg, id: ++msgId }])
    setLoading(true)

    try {
      const result = await apiFetch<{ acknowledged: string; nextStep: string; selectedTier?: string }>('/onboarding/respond', {
        method: 'POST',
        body: { step: currentStep, response: userMsg },
      })

      setCurrentStep(result.nextStep)

      const status = await apiFetch<{ currentStep: string; progress: number }>('/onboarding/status')
      setProgress(status.progress)

      if (result.nextStep === 'ready') {
        typeMessage(result.acknowledged, () => {
          setTimeout(() => navigate({ to: '/dashboard' }), 1500)
        })
        return
      }

      typeMessage(result.acknowledged, () => {
        setLoading(false)
        apiFetch<{ question: string; step: string }>('/onboarding/question').then(q => {
          if (q) {
            setTimeout(() => typeMessage(q.question), 500)
          }
        }).catch(() => {})
      })
      return
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: t('common.error'), id: ++msgId }])
    } finally {
      setLoading(false)
    }
  }

  async function handlePlanSelect(tier: string) {
    setCheckoutLoading(tier)
    try {
      const result = await apiFetch<{ acknowledged: string; nextStep: string }>('/onboarding/respond', {
        method: 'POST',
        body: { step: currentStep, response: tier },
      })

      setMessages(prev => [
        ...prev,
        { role: 'user', content: t('onboarding.selectPlan') + ': ' + tier.charAt(0).toUpperCase() + tier.slice(1), id: ++msgId },
      ])

      setCurrentStep(result.nextStep)

      if (tier === 'local_pro' || tier === 'local_business') {
        const email = user?.email ?? ''
        const checkout = await apiFetch<{ url: string }>('/billing/checkout', {
          method: 'POST',
          body: { tier, email },
        })
        if (checkout.url) {
          openExternalLink(checkout.url)
        }
      }

      const status = await apiFetch<{ currentStep: string; progress: number }>('/onboarding/status')
      setProgress(status.progress)

      typeMessage(result.acknowledged, () => {
        if (result.nextStep === 'ready') {
          setTimeout(() => navigate({ to: '/dashboard' }), 1500)
        }
      })
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: t('common.error'), id: ++msgId }])
    } finally {
      setCheckoutLoading(null)
    }
  }

  async function handleSkipPlan() {
    setCheckoutLoading('skip')
    try {
      const result = await apiFetch<{ acknowledged: string; nextStep: string }>('/onboarding/respond', {
        method: 'POST',
        body: { step: currentStep, response: 'skip' },
      })

      setMessages(prev => [...prev, { role: 'user', content: t('common.skip'), id: ++msgId }])
      setCurrentStep(result.nextStep)

      const status = await apiFetch<{ currentStep: string; progress: number }>('/onboarding/status')
      setProgress(status.progress)

      typeMessage(result.acknowledged, () => {
        if (result.nextStep === 'ready') {
          setTimeout(() => navigate({ to: '/dashboard' }), 1500)
        }
      })
    } catch {
      setTimeout(() => navigate({ to: '/dashboard' }), 2000)
    } finally {
      setCheckoutLoading(null)
    }
  }

  const currentStepIndex = STEP_IDS.indexOf(currentStep as any)
  const isPlanSelection = currentStep === 'plan_selection'
  const allMessages = [
    ...messages,
    ...(typingText ? [{ role: 'assistant' as const, content: typingText, id: -1 }] : []),
  ]

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex">
      {/* Progress sidebar */}
      <aside
        className={`w-80 bg-white/80 backdrop-blur-sm border-r border-border p-8 flex flex-col transition-all duration-700 ease-out ${
          sidebarVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
        }`}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{t('onboarding.setupTitle')}</h2>
            <p className="text-xs text-muted-foreground">{t('onboarding.setupSubtitle')}</p>
          </div>
        </div>

        <div className="space-y-1 flex-1">
          {steps.map((step, idx) => {
            const isComplete = idx < currentStepIndex
            const isCurrent = step.id === currentStep
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-500 ${
                  isComplete
                    ? 'text-emerald-600 bg-emerald-50/50'
                    : isCurrent
                      ? 'text-primary bg-primary/10 font-medium shadow-sm'
                      : 'text-muted-foreground'
                }`}
                style={{
                  transitionDelay: `${idx * 80}ms`,
                  transform: sidebarVisible ? 'translateX(0)' : 'translateX(-12px)',
                  opacity: sidebarVisible ? 1 : 0,
                }}
              >
                <span className={`text-base transition-transform duration-300 ${isCurrent ? 'scale-125' : isComplete ? 'scale-100' : 'scale-100 grayscale opacity-50'}`}>
                  {step.icon}
                </span>
                <span className="flex-1">{step.label}</span>
                {isComplete && (
                  <Check size={16} className="text-emerald-500" />
                )}
                {isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">{t('onboarding.progress')}</span>
            <span className="text-xs font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-white/60 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <MessageSquare size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">{t('onboarding.setupAssistant')}</h3>
              <p className="text-xs text-muted-foreground">{t('onboarding.setupAssistantDesc')}</p>
            </div>
          </div>
        </div>

        {isPlanSelection ? (
          <PlanSelectionView
            messages={allMessages}
            checkoutLoading={checkoutLoading}
            onSelect={handlePlanSelect}
            onSkip={handleSkipPlan}
            chatEndRef={chatEndRef}
          />
        ) : (
          <ChatView
            messages={allMessages}
            input={input}
            setInput={setInput}
            loading={loading}
            isTyping={isTyping}
            onSubmit={handleSubmit}
            chatEndRef={chatEndRef}
          />
        )}
      </div>
    </div>
  )
}

/* ── Chat View ──────────────────────────────────────────────── */

function ChatView({
  messages, input, setInput, loading, isTyping, onSubmit, chatEndRef,
}: {
  messages: ChatMessage[]
  input: string
  setInput: (v: string) => void
  loading: boolean
  isTyping: boolean
  onSubmit: (e: React.FormEvent) => void
  chatEndRef: React.RefObject<HTMLDivElement | null>
}) {
  const { t } = useTranslation()

  return (
    <>
      <div className="flex-1 overflow-auto px-6 py-6 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {loading && !messages.some(m => m.id === -1) && (
          <div className="flex justify-start">
            <div className="bg-card border border-border px-5 py-3.5 rounded-2xl rounded-bl-md shadow-sm">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 160}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={onSubmit} className="px-6 py-4 border-t border-border bg-white/80 backdrop-blur-sm">
        <div className="flex gap-3 items-center max-w-2xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('onboarding.typeAnswer')}
            disabled={loading || isTyping}
            className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary text-sm placeholder:text-muted-foreground transition-all duration-200"
          />
          <button
            type="submit"
            disabled={loading || isTyping || !input.trim()}
            className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </>
  )
}

/* ── Message Bubble ─────────────────────────────────────────── */

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in`}
      style={{
        animation: 'fadeSlideIn 0.4s ease-out',
      }}
    >
      <div
        className={`max-w-lg px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-br-md shadow-lg shadow-emerald-500/15'
            : 'bg-card border border-border text-foreground rounded-bl-md shadow-sm'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
      </div>
    </div>
  )
}

/* ── Plan Selection View ────────────────────────────────────── */

function PlanSelectionView({
  messages, checkoutLoading, onSelect, onSkip, chatEndRef,
}: {
  messages: ChatMessage[]
  checkoutLoading: string | null
  onSelect: (tier: string) => void
  onSkip: () => void
  chatEndRef: React.RefObject<HTMLDivElement | null>
}) {
  const { t } = useTranslation()

  const planFeatures: Record<string, string[]> = {
    local_solo: [
      t('onboarding.plans.local_solo.features.contacts', { count: 50 }),
      t('onboarding.plans.local_solo.features.whatsapp'),
      t('onboarding.plans.local_solo.features.reminders'),
      t('onboarding.plans.local_solo.features.languages'),
    ],
    local_starter: [
      t('onboarding.plans.local_starter.features.contacts', { count: 150 }),
      t('onboarding.plans.local_starter.features.whatsapp'),
      t('onboarding.plans.local_starter.features.reminders'),
      t('onboarding.plans.local_starter.features.staff'),
      t('onboarding.plans.local_starter.features.languages'),
    ],
    local_pro: [
      t('onboarding.plans.local_pro.features.contacts', { count: 500 }),
      t('onboarding.plans.local_pro.features.everythingStarter'),
      t('onboarding.plans.local_pro.features.staff'),
      t('onboarding.plans.local_pro.features.voice'),
      t('onboarding.plans.local_pro.features.support'),
    ],
    local_business: [
      t('onboarding.plans.local_business.features.contacts', { count: 1500 }),
      t('onboarding.plans.local_business.features.everythingPro'),
      t('onboarding.plans.local_business.features.staff'),
      t('onboarding.plans.local_business.features.api'),
      t('onboarding.plans.local_business.features.training'),
      t('onboarding.plans.local_business.features.support'),
    ],
  }

  return (
    <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
      {messages.map(msg => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}

      {/* Founding pricing badge */}
      <div className="flex justify-center" style={{ animation: 'fadeSlideIn 0.5s ease-out 0.2s both' }}>
        <span className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 px-5 py-2.5 rounded-full text-sm font-semibold border border-amber-200/60 shadow-sm">
          <Sparkles size={14} className="text-amber-500" />
          {t('onboarding.foundingPricing')}
        </span>
      </div>

      {/* Plan cards */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-5xl mx-auto"
        style={{ animation: 'fadeSlideIn 0.6s ease-out 0.3s both' }}
      >
        {PLAN_TIERS.map((plan, idx) => {
          const Icon = plan.icon
          const isCheckingOut = checkoutLoading === plan.id
          const planKey = plan.id
          const name = t(`onboarding.plans.${planKey}.name`)
          const desc = t(`onboarding.plans.${planKey}.desc`)
          const features = planFeatures[planKey] ?? []

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border p-6 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                plan.highlight
                  ? 'border-primary shadow-lg shadow-primary/10 relative ring-1 ring-primary/20'
                  : 'border-border hover:border-border'
              }`}
              style={{ animationDelay: `${0.4 + idx * 0.1}s` }}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg shadow-emerald-500/30">
                  {t('onboarding.mostPopular')}
                </div>
              )}
              <div className="flex items-center gap-2.5 mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${plan.highlight ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Icon size={18} />
                </div>
                <h4 className="text-lg font-bold text-foreground">{name}</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{desc}</p>
              <div className="mb-5">
                <span className="text-3xl font-extrabold text-foreground">${plan.price}</span>
                <span className="text-muted-foreground text-sm">{t('plan.perMonth')}</span>
                <p className="text-xs text-muted-foreground mt-1">{t('plan.upToContacts', { count: plan.contacts })}</p>
              </div>
              <ul className="space-y-2 mb-6">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onSelect(plan.id)}
                disabled={checkoutLoading !== null}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/20'
                    : 'border-border text-muted-foreground hover:bg-muted hover:border-border'
                }`}
              >
                {isCheckingOut ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {t('onboarding.processing')}
                  </span>
                ) : (
                  <>
                    {t('onboarding.selectPlan')}
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Skip option */}
      <div
        className="flex justify-center pb-4"
        style={{ animation: 'fadeSlideIn 0.6s ease-out 0.7s both' }}
      >
        <button
          onClick={onSkip}
          disabled={checkoutLoading !== null}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 disabled:opacity-40 flex items-center gap-1.5"
        >
          {checkoutLoading === 'skip' ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              {t('onboarding.settingUp')}
            </span>
          ) : (
            t('onboarding.skipForNow')
          )}
        </button>
      </div>

      <div ref={chatEndRef} />
    </div>
  )
}
