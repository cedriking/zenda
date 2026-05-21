import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useConversations } from '../../../hooks/use-conversations'
import { ArrowLeft, Bot, User, Send, AlertCircle, Info, Phone, Globe, CalendarDays } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/dashboard/conversations/$id')({
  component: ConversationDetailPage,
})

function ConversationDetailPage() {
  const { t } = useTranslation()
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
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/conversations" className="text-muted-foreground hover:text-foreground" aria-label={t('conversation.backToConversations')}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground">{conv?.customerName ?? conv?.customerId ?? t('conversation.defaultCustomer')}</h3>
              <button
                onClick={() => setShowCustomerInfo(prev => !prev)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Toggle customer information"
                aria-expanded={showCustomerInfo}
              >
                <Info size={16} />
              </button>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              conv?.mode === 'auto' ? 'bg-emerald-500/10 text-emerald-600' :
              conv?.mode === 'human_takeover' ? 'bg-destructive/10 text-destructive' :
              'bg-amber-500/10 text-amber-600'
            }`}>
              {conv?.mode === 'auto' ? t('conversation.modeAi') :
               conv?.mode === 'human_takeover' ? t('conversation.modeYou') :
               conv?.mode ?? t('conversation.modeUnknown')}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {conv?.mode === 'auto' && (
            <button
              onClick={handleTakeOverClick}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                confirmTakeOver
                  ? 'bg-destructive text-white hover:bg-destructive/90'
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}
              aria-label={confirmTakeOver ? t('conversation.takeOver') : t('conversation.takeOverAria')}
            >
              {confirmTakeOver ? `${t('conversation.takeOver')}?` : t('conversation.takeOver')}
            </button>
          )}
          {conv?.mode === 'human_takeover' && (
            <button
              onClick={handleReturnToAuto}
              className="px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
              aria-label={t('conversation.returnToAutoAria')}
            >
              {t('conversation.returnToAuto')}
            </button>
          )}
        </div>
      </div>

      {/* Collapsible customer info panel */}
      {showCustomerInfo && (
        <div className="border-b border-border bg-muted p-4">
          <div className="grid grid-cols-3 gap-4 max-w-lg">
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-muted-foreground" />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t('conversation.phone')}</p>
                <p className="text-sm text-foreground">{conv?.customerId ?? 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-muted-foreground" />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t('conversation.language')}</p>
                <p className="text-sm text-foreground">{conv?.language === 'es' ? t('conversations.langSpanish') : conv?.language === 'en' ? t('conversations.langEnglish') : conv?.language ?? 'Unknown'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-muted-foreground" />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t('conversation.mode')}</p>
                <p className="text-sm text-foreground">{conv?.mode === 'auto' ? t('conversation.modeAi') : conv?.mode === 'human_takeover' ? t('conversation.modeYou') : conv?.mode ?? t('conversation.modeUnknown')}</p>
              </div>
            </div>
          </div>
          <a
            href="/dashboard/appointments"
            className="inline-flex items-center gap-1 mt-3 text-xs text-primary hover:text-primary/80 hover:underline"
          >
            <CalendarDays size={12} />
            {t('conversation.viewAppointments')}
          </a>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-destructive/10 border-b border-border text-sm text-destructive flex items-center gap-2" role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Mode switch error */}
      {modeError && (
        <div
          className="p-3 bg-destructive/10 border-b border-border text-sm text-destructive flex items-center justify-between"
          role="alert"
        >
          <span className="flex items-center gap-2">
            <AlertCircle size={16} aria-hidden="true" />
            {modeError}
          </span>
          <button onClick={clearModeError} className="text-destructive hover:text-destructive/80 text-xs underline">{t('common.close')}</button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-3" role="log" aria-label={t('conversation.messagesAria')} aria-live="polite">
        {convMessages.length === 0 && !error && (
          <div className="text-center py-8 text-muted-foreground text-sm">{t('conversation.noMessages')}</div>
        )}
        {convMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderType === 'customer' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
              msg.senderType === 'customer'
                ? 'bg-muted text-foreground'
                : msg.senderType === 'ai'
                ? 'bg-primary text-white'
                : 'bg-emerald-500 text-white'
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
        <div className="p-4 border-t border-border bg-card">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('conversation.inputPlaceholder')}
              className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary bg-card text-foreground placeholder-muted-foreground"
              aria-label={t('conversation.inputAria')}
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              aria-label={t('conversation.sendAria')}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
