import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../../services/api-client'
import { useAuthStore } from '../../stores/auth'
import { Check, Circle, MessageSquare } from 'lucide-react'

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
]

interface ChatMessage {
  role: 'assistant' | 'user'
  content: string
}

function OnboardingPage() {
  const { workspace } = useAuthStore()
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
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
      const result = await apiFetch<{ acknowledged: string; nextStep: string }>('/onboarding/respond', {
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

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep)

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

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-500" />
            <h3 className="font-semibold text-gray-900">Setup Assistant</h3>
          </div>
          <p className="text-sm text-gray-500 mt-1">Answer a few questions to configure your AI receptionist</p>
        </div>

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
      </div>
    </div>
  )
}
