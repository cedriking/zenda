import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../../services/api-client'
import { useAuthStore } from '../../stores/auth'
import { openExternalLink } from '../../actions/shell'
import { Check, Circle, MessageSquare, Zap, Users, Building2 } from 'lucide-react'

export const Route = createFileRoute('/onboarding/')({
  component: OnboardingPage,
})

const STEPS = [
  { id: 'whatsapp_connected', label: 'Connect WhatsApp' },
  { id: 'business_info', label: 'Business Info' },
  { id: 'services', label: 'Services' },
  { id: 'availability', label: 'Availability' },
  { id: 'policies', label: 'Policies' },
  { id: 'receptionist_config', label: 'Receptionist Setup' },
  { id: 'plan_selection', label: 'Choose Plan' },
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
}

function OnboardingPage() {
  const { workspace, user } = useAuthStore()
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadStatus()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

      // Get first question
      const q = await apiFetch<{ question: string; step: string }>('/onboarding/question')
      if (q) {
        setMessages([{ role: 'assistant', content: q.question }])
        setCurrentStep(q.step)
      }
    } catch {
      setMessages([{ role: 'assistant', content: "Hi! Let's set up your AI receptionist. I'll ask a few quick questions." }])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const result = await apiFetch<{ acknowledged: string; nextStep: string; selectedTier?: string }>('/onboarding/respond', {
        method: 'POST',
        body: JSON.stringify({ step: currentStep, response: userMsg }),
      })

      setMessages(prev => [...prev, { role: 'assistant', content: result.acknowledged }])
      setCurrentStep(result.nextStep)

      // Refresh status
      const status = await apiFetch<{ currentStep: string; progress: number }>('/onboarding/status')
      setProgress(status.progress)

      if (result.nextStep === 'ready') {
        setTimeout(() => navigate({ to: '/dashboard' }), 2000)
        return
      }

      // Get next question
      const q = await apiFetch<{ question: string; step: string }>('/onboarding/question')
      if (q) {
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'assistant', content: q.question }])
        }, 1000)
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I didn't catch that. Could you try again?" }])
    } finally {
      setLoading(false)
    }
  }

  async function handlePlanSelect(tier: string) {
    setCheckoutLoading(tier)
    try {
      const result = await apiFetch<{ acknowledged: string; nextStep: string }>('/onboarding/respond', {
        method: 'POST',
        body: JSON.stringify({ step: currentStep, response: tier }),
      })

      setMessages(prev => [...prev, { role: 'user', content: `Selected ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan` }])
      setMessages(prev => [...prev, { role: 'assistant', content: result.acknowledged }])
      setCurrentStep(result.nextStep)

      // For paid plans (pro/business), open Stripe checkout
      if (tier === 'pro' || tier === 'business') {
        const email = user?.email ?? ''
        const checkout = await apiFetch<{ url: string }>('/billing/checkout', {
          method: 'POST',
          body: JSON.stringify({ tier, period: 'monthly', email }),
        })
        if (checkout.url) {
          openExternalLink(checkout.url)
        }
      }

      // Refresh status
      const status = await apiFetch<{ currentStep: string; progress: number }>('/onboarding/status')
      setProgress(status.progress)

      if (result.nextStep === 'ready') {
        setTimeout(() => navigate({ to: '/dashboard' }), 2000)
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. You can skip for now and choose a plan later from your dashboard.' }])
    } finally {
      setCheckoutLoading(null)
    }
  }

  async function handleSkipPlan() {
    setCheckoutLoading('skip')
    try {
      const result = await apiFetch<{ acknowledged: string; nextStep: string }>('/onboarding/respond', {
        method: 'POST',
        body: JSON.stringify({ step: currentStep, response: 'skip' }),
      })

      setMessages(prev => [...prev, { role: 'user', content: 'Skip for now' }])
      setMessages(prev => [...prev, { role: 'assistant', content: result.acknowledged }])
      setCurrentStep(result.nextStep)

      const status = await apiFetch<{ currentStep: string; progress: number }>('/onboarding/status')
      setProgress(status.progress)

      if (result.nextStep === 'ready') {
        setTimeout(() => navigate({ to: '/dashboard' }), 2000)
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "No problem! You're all set. Let's get you to your dashboard." }])
      setTimeout(() => navigate({ to: '/dashboard' }), 2000)
    } finally {
      setCheckoutLoading(null)
    }
  }

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep)
  const isPlanSelection = currentStep === 'plan_selection'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Progress sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Setup Progress</h2>
        <div className="space-y-3">
          {STEPS.map((step, idx) => {
            const isComplete = idx < currentStepIndex
            const isCurrent = step.id === currentStep
            return (
              <div key={step.id} className={`flex items-center gap-3 text-sm ${isComplete ? 'text-green-600' : isCurrent ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                {isComplete ? (
                  <Check size={18} className="text-green-500" />
                ) : isCurrent ? (
                  <Circle size={18} className="text-blue-500 fill-blue-500" />
                ) : (
                  <Circle size={18} />
                )}
                {step.label}
              </div>
            )
          })}
        </div>
        <div className="mt-8">
          <div className="text-sm text-gray-500 mb-2">{progress}% complete</div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-500" />
            <h3 className="font-semibold text-gray-900">Setup Assistant</h3>
          </div>
          <p className="text-sm text-gray-500 mt-1">Answer a few questions to configure your AI receptionist</p>
        </div>

        {isPlanSelection ? (
          /* Plan selection UI */
          <div className="flex-1 overflow-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {/* Founding pricing badge */}
            <div className="flex justify-center">
              <span className="inline-block bg-amber-100 text-amber-800 px-4 py-2 rounded-lg text-sm font-semibold">
                Founding Member Pricing — Limited Time
              </span>
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
              {PLAN_TIERS.map(plan => {
                const Icon = plan.icon
                const isCheckingOut = checkoutLoading === plan.id
                return (
                  <div
                    key={plan.id}
                    className={`rounded-xl border p-6 bg-white transition-shadow hover:shadow-md ${
                      plan.highlight
                        ? 'border-blue-500 shadow-lg relative'
                        : 'border-gray-200'
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={20} className={plan.highlight ? 'text-blue-500' : 'text-gray-400'} />
                      <h4 className="text-lg font-bold text-gray-900">{plan.name}</h4>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{plan.desc}</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-400 text-sm">/month</span>
                      {plan.originalPrice && (
                        <span className="ml-2 text-sm text-gray-400 line-through">${plan.originalPrice}</span>
                      )}
                    </div>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                          <span className="text-green-500 mt-0.5 flex-shrink-0">&#10003;</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handlePlanSelect(plan.id)}
                      disabled={checkoutLoading !== null}
                      className={`w-full py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
                        plan.highlight
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {isCheckingOut ? 'Processing...' : 'Select Plan'}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Skip option */}
            <div className="flex justify-center pt-2 pb-4">
              <button
                onClick={handleSkipPlan}
                disabled={checkoutLoading !== null}
                className="text-sm text-gray-400 hover:text-gray-600 underline transition disabled:opacity-50"
              >
                {checkoutLoading === 'skip' ? 'Setting up free trial...' : 'Skip for now — start with free trial'}
              </button>
            </div>

            <div ref={chatEndRef} />
          </div>
        ) : (
          /* Regular chat UI */
          <>
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md px-4 py-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type your answer..."
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
