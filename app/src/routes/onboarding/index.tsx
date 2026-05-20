import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from 'react'
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

const STEPS = [
  { id: 'whatsapp_connected', label: 'Connect WhatsApp', icon: '📱' },
  { id: 'business_info', label: 'Business Info', icon: '🏢' },
  { id: 'services', label: 'Services', icon: '✂️' },
  { id: 'availability', label: 'Availability', icon: '🕐' },
  { id: 'policies', label: 'Policies', icon: '📋' },
  { id: 'receptionist_config', label: 'Receptionist Setup', icon: '🤖' },
  { id: 'plan_selection', label: 'Choose Plan', icon: '🚀' },
]

const PLAN_TIERS = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: 19,
    originalPrice: 29,
    desc: 'For solo businesses just getting started',
    icon: Zap,
    features: [
      '500 conversations/month',
      '100 appointments/month',
      'WhatsApp integration',
      'Automated reminders',
      'English & Spanish',
      '1 staff member',
    ],
    highlight: false,
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 49,
    originalPrice: 69,
    desc: 'For growing businesses with a team',
    icon: Users,
    features: [
      '2,000 conversations/month',
      '500 appointments/month',
      'Everything in Starter',
      'Up to 5 staff members',
      'Voice note transcription',
      'Priority support',
      'Knowledge base',
    ],
    highlight: true,
  },
  {
    id: 'business' as const,
    name: 'Business',
    price: 99,
    originalPrice: 149,
    desc: 'For established businesses with high volume',
    icon: Building2,
    features: [
      'Unlimited conversations',
      'Unlimited appointments',
      'Everything in Pro',
      'Up to 20 staff members',
      'API access',
      'Custom AI training',
      'Dedicated support',
    ],
    highlight: false,
  },
]

interface ChatMessage {
  role: 'assistant' | 'user'
  content: string
  id: number
}

let msgId = 0

function OnboardingPage() {
  const navigate = useNavigate()
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

  useEffect(() => {
    // Stagger sidebar entrance
    const t = setTimeout(() => setSidebarVisible(true), 200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    loadStatus()
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
    // Brief pause before typing starts
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
        // Delay typing start for sidebar entrance animation
        setTimeout(() => typeMessage(q.question), 600)
      }
    } catch {
      setTimeout(() => typeMessage("Hi! Let's set up your AI receptionist. I'll ask a few quick questions."), 600)
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

      // Type acknowledgment, then type next question
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
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I didn't catch that. Could you try again?", id: ++msgId }])
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
        { role: 'user', content: `Selected ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan`, id: ++msgId },
      ])

      setCurrentStep(result.nextStep)

      if (tier === 'pro' || tier === 'business') {
        const email = '' // user?.email ?? ''
        const checkout = await apiFetch<{ url: string }>('/billing/checkout', {
          method: 'POST',
          body: { tier, period: 'monthly', email },
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
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. You can choose a plan later from your dashboard.', id: ++msgId }])
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

      setMessages(prev => [...prev, { role: 'user', content: 'Skip for now', id: ++msgId }])
      setCurrentStep(result.nextStep)

      const status = await apiFetch<{ currentStep: string; progress: number }>('/onboarding/status')
      setProgress(status.progress)

      typeMessage(result.acknowledged, () => {
        if (result.nextStep === 'ready') {
          setTimeout(() => navigate({ to: '/dashboard' }), 1500)
        }
      })
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "You're all set! Let's get you to your dashboard.", id: ++msgId }])
      setTimeout(() => navigate({ to: '/dashboard' }), 2000)
    } finally {
      setCheckoutLoading(null)
    }
  }

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep)
  const isPlanSelection = currentStep === 'plan_selection'
  const allMessages = [
    ...messages,
    ...(typingText ? [{ role: 'assistant' as const, content: typingText, id: -1 }] : []),
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex">
      {/* Progress sidebar */}
      <aside
        className={`w-80 bg-white/80 backdrop-blur-sm border-r border-border p-8 flex flex-col transition-all duration-700 ease-out ${
          sidebarVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
        }`}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Setup</h2>
            <p className="text-xs text-muted-foreground">Your AI receptionist</p>
          </div>
        </div>

        <div className="space-y-1 flex-1">
          {STEPS.map((step, idx) => {
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
            <span className="text-xs font-medium text-muted-foreground">Progress</span>
            <span className="text-xs font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <MessageSquare size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Setup Assistant</h3>
              <p className="text-xs text-muted-foreground">Answer a few questions to configure your AI receptionist</p>
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
            placeholder="Type your answer..."
            disabled={loading || isTyping}
            className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary text-sm placeholder:text-muted-foreground transition-all duration-200"
          />
          <button
            type="submit"
            disabled={loading || isTyping || !input.trim()}
            className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-95"
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
            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-md shadow-lg shadow-blue-500/15'
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
  return (
    <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
      {/* Chat messages */}
      {messages.map(msg => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}

      {/* Founding pricing badge */}
      <div className="flex justify-center" style={{ animation: 'fadeSlideIn 0.5s ease-out 0.2s both' }}>
        <span className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 px-5 py-2.5 rounded-full text-sm font-semibold border border-amber-200/60 shadow-sm">
          <Sparkles size={14} className="text-amber-500" />
          Founding Member Pricing — Limited Time
        </span>
      </div>

      {/* Plan cards */}
      <div
        className="grid grid-cols-3 gap-5 max-w-4xl mx-auto"
        style={{ animation: 'fadeSlideIn 0.6s ease-out 0.3s both' }}
      >
        {PLAN_TIERS.map((plan, idx) => {
          const Icon = plan.icon
          const isCheckingOut = checkoutLoading === plan.id
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
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg shadow-blue-500/30">
                  Most Popular
                </div>
              )}
              <div className="flex items-center gap-2.5 mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${plan.highlight ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Icon size={18} />
                </div>
                <h4 className="text-lg font-bold text-foreground">{plan.name}</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{plan.desc}</p>
              <div className="mb-5">
                <span className="text-3xl font-extrabold text-foreground">${plan.price}</span>
                <span className="text-muted-foreground text-sm">/month</span>
                {plan.originalPrice && (
                  <span className="ml-2 text-sm text-muted-foreground line-through">${plan.originalPrice}</span>
                )}
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
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
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/20'
                    : 'border-border text-muted-foreground hover:bg-muted hover:border-border'
                }`}
              >
                {isCheckingOut ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    Select Plan
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
              Setting up free trial...
            </span>
          ) : (
            'Skip for now — start with free trial'
          )}
        </button>
      </div>

      <div ref={chatEndRef} />
    </div>
  )
}
