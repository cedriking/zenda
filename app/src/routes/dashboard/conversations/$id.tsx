import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'
import { useConversations } from '../../../hooks/use-conversations'
import { ArrowLeft, Bot, User, Send, AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/dashboard/conversations/$id')({
  component: ConversationDetailPage,
})

function ConversationDetailPage() {
  const { id } = Route.useParams()
  const { conversations, messages, error, loadMessages, updateMode, sendMessage } = useConversations()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const conv = conversations.find(c => c.id === id)

  useEffect(() => {
    loadMessages(id)
  }, [id, loadMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages[id]])

  const handleSend = async () => {
    if (!input.trim()) return
    await sendMessage(id, input.trim())
    setInput('')
  }

  const handleTakeOver = async () => {
    await updateMode(id, 'human_takeover')
  }

  const handleReturnToAuto = async () => {
    await updateMode(id, 'auto')
  }

  const convMessages = messages[id] ?? []

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <a href="/dashboard/conversations" className="text-gray-500 hover:text-gray-700" aria-label="Back to conversations">
            <ArrowLeft size={20} />
          </a>
          <div>
            <h3 className="font-medium text-gray-900">{conv?.customerName ?? conv?.customerId ?? 'Customer'}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              conv?.mode === 'auto' ? 'bg-green-100 text-green-700' :
              conv?.mode === 'human_takeover' ? 'bg-red-100 text-red-700' :
              'bg-orange-100 text-orange-700'
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
              onClick={handleTakeOver}
              className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              aria-label="Take over this conversation from AI"
            >
              Take Over
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

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border-b border-red-200 text-sm text-red-700 flex items-center gap-2" role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-3" role="log" aria-label="Conversation messages">
        {convMessages.length === 0 && !error && (
          <div className="text-center py-8 text-gray-400 text-sm">No messages yet</div>
        )}
        {convMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderType === 'customer' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
              msg.senderType === 'customer'
                ? 'bg-gray-100 text-gray-900'
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
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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
