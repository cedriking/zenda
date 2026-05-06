import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useConversations } from '../../../hooks/use-conversations'
import { ArrowLeft, Bot, User, Send, AlertCircle, Info, Phone, Globe, CalendarDays } from 'lucide-react'

export const Route = createFileRoute('/dashboard/conversations/$id')({
  component: ConversationDetailPage,
})

function ConversationDetailPage() {
  const { id } = Route.useParams()
  const { conversations, messages, error, loadMessages, updateMode, sendMessage } = useConversations()
  const [input, setInput] = useState('')
  const [modeError, setModeError] = useState<string | null>(null)
  const [confirmTakeOver, setConfirmTakeOver] = useState(false)
  const [showCustomerInfo, setShowCustomerInfo] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const conv = conversations.find(c => c.id === id)

  useEffect(() => {
    loadMessages(id)
  }, [id, loadMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages[id]])

  const clearModeError = useCallback(() => setModeError(null), [])

  const handleSend = async () => {
    if (!input.trim()) return
    await sendMessage(id, input.trim())
    setInput('')
  }

  useEffect(() => {
    if (!confirmTakeOver) return
    const timer = setTimeout(() => setConfirmTakeOver(false), 3000)
    return () => clearTimeout(timer)
  }, [confirmTakeOver])

  const handleTakeOverClick = () => {
    if (confirmTakeOver) {
      handleTakeOver()
    } else {
      setConfirmTakeOver(true)
    }
  }

  const handleTakeOver = async () => {
    setConfirmTakeOver(false)
    setModeError(null)
    const previousMode = conv?.mode
    try {
      await updateMode(id, 'human_takeover')
    } catch (err) {
      setModeError(err instanceof Error ? err.message : 'Failed to take over conversation')
      if (previousMode) {
        updateMode(id, previousMode).catch(() => {})
      }
    }
  }

  const handleReturnToAuto = async () => {
    setModeError(null)
    const previousMode = conv?.mode
    try {
      await updateMode(id, 'auto')
    } catch (err) {
      setModeError(err instanceof Error ? err.message : 'Failed to return to auto mode')
      if (previousMode) {
        updateMode(id, previousMode).catch(() => {})
      }
    }
  }

  const convMessages = messages[id] ?? []

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/conversations" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" aria-label="Back to conversations">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{conv?.customerName ?? conv?.customerId ?? 'Customer'}</h3>
              <button
                onClick={() => setShowCustomerInfo(prev => !prev)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle customer information"
                aria-expanded={showCustomerInfo}
              >
                <Info size={16} />
              </button>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              conv?.mode === 'auto' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              conv?.mode === 'human_takeover' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
            }`}>
              {conv?.mode === 'auto' ? 'AI Handling' :
               conv?.mode === 'human_takeover' ? 'You are handling' :
               conv?.mode ?? 'Unknown'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {conv?.mode === 'auto' && (
            <button
              onClick={handleTakeOverClick}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                confirmTakeOver
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
              aria-label={confirmTakeOver ? 'Confirm take over' : 'Take over this conversation from AI'}
            >
              {confirmTakeOver ? 'Confirm Take Over?' : 'Take Over'}
            </button>
          )}
          {conv?.mode === 'human_takeover' && (
            <button
              onClick={handleReturnToAuto}
              className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
              aria-label="Return conversation to AI"
            >
              Return to Auto
            </button>
          )}
        </div>
      </div>

      {/* Collapsible customer info panel */}
      {showCustomerInfo && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="grid grid-cols-3 gap-4 max-w-lg">
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">Phone</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{conv?.customerId ?? 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">Language</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{conv?.language === 'es' ? 'Spanish' : conv?.language === 'en' ? 'English' : conv?.language ?? 'Unknown'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">Mode</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{conv?.mode === 'auto' ? 'Automated' : conv?.mode === 'human_takeover' ? 'Human' : conv?.mode ?? 'N/A'}</p>
              </div>
            </div>
          </div>
          <a
            href="/dashboard/appointments"
            className="inline-flex items-center gap-1 mt-3 text-xs text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
          >
            <CalendarDays size={12} />
            View all appointments
          </a>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400 flex items-center gap-2" role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Mode switch error */}
      {modeError && (
        <div
          className="p-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400 flex items-center justify-between"
          role="alert"
        >
          <span className="flex items-center gap-2">
            <AlertCircle size={16} aria-hidden="true" />
            {modeError}
          </span>
          <button onClick={clearModeError} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-3" role="log" aria-label="Conversation messages" aria-live="polite">
        {convMessages.length === 0 && !error && (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">No messages yet</div>
        )}
        {convMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderType === 'customer' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
              msg.senderType === 'customer'
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                : msg.senderType === 'ai'
                ? 'bg-blue-500 text-white'
                : 'bg-green-500 text-white'
            }`}>
              <div className="flex items-center gap-1 mb-1">
                {msg.senderType === 'ai' ? <Bot size={12} aria-label="AI" /> : <User size={12} aria-label="Human" />}
                <span className="text-xs opacity-75">{msg.senderType}</span>
              </div>
              <p className="text-sm">{msg.body}</p>
              <span className="text-xs opacity-50 mt-1 block">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {(conv?.mode === 'human_takeover' || conv?.mode === 'needs_attention') && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              aria-label="Type your message"
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
