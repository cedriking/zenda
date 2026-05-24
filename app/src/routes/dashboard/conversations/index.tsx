import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import { useConversations } from '../../../hooks/use-conversations'
import { MessageSquare, AlertTriangle, User, Bot, Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/dashboard/conversations/')({
  component: ConversationsPage,
})

function ConversationsPage() {
  const { t } = useTranslation()
  const { conversations, isLoading, error, loadConversations, setActiveConversationId } = useConversations()
  const [searchQuery, setSearchQuery] = useState('')

  const avatarColors = useMemo(() => [
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-purple-100 text-purple-700',
    'bg-amber-100 text-amber-700',
    'bg-pink-100 text-pink-700',
  ], [])

  useEffect(() => {
    loadConversations()
    const interval = setInterval(() => loadConversations(), 15_000)
    return () => clearInterval(interval)
  }, [loadConversations])

  useEffect(() => {
    const handleConversationUpdate = () => loadConversations()
    const cleanup = window.electron?.on('conversation:update', handleConversationUpdate)
    return () => cleanup?.()
  }, [loadConversations])

  const filtered = searchQuery.trim()
    ? conversations.filter(c =>
        (c.customerName ?? c.customerId).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.lastMessagePreview ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">{t('conversations.heading')}</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('conversations.searchPlaceholder')}
              className="pl-9 pr-8 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring w-64 bg-card text-foreground placeholder-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <span className="text-sm text-muted-foreground">{t('conversations.count', { count: conversations.length })}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 border border-border p-3 text-sm text-destructive">
          {error}
          <button onClick={() => loadConversations()} className="ml-2 underline">{t('common.retry')}</button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div>
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded mt-1" />
                </div>
              </div>
              <div className="h-5 w-14 bg-muted rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
          {searchQuery ? (
            <>
              <p>{t('conversations.noMatch', { query: searchQuery })}</p>
              <button onClick={() => setSearchQuery('')} className="text-primary text-sm mt-2">{t('conversations.clearSearch')}</button>
            </>
          ) : (
            <>
              <p>{t('conversations.empty')}</p>
              <p className="text-sm">{t('conversations.emptyHint')}</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((conv) => (
            <Link
              key={conv.id}
              to="/dashboard/conversations/$id"
              params={{ id: conv.id }}
              onClick={() => setActiveConversationId(conv.id)}
              className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-border transition-colors"
            >
              <div className="flex items-center gap-3">
                {(conv.mode === 'needs_attention' || conv.mode === 'human_takeover') && (
                  <AlertTriangle size={20} className="text-amber-500" />
                )}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${avatarColors[(conv.customerName ?? conv.customerPhone ?? conv.customerId).charCodeAt(0) % avatarColors.length]}`}>
                  {(conv.customerName ?? conv.customerPhone ?? '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className={`text-foreground ${(conv.unreadCount ?? 0) > 0 ? 'font-bold' : 'font-medium'}`}>
                      {conv.customerName ?? conv.customerPhone ?? conv.customerId}
                    </p>
                    {(conv.unreadCount ?? 0) > 0 && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" aria-label="Unread messages" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">{conv.lastMessagePreview ?? t('conversation.noMessages')}</p>
                  <p className="text-sm text-muted-foreground">{(conv.customerLanguage ?? conv.language) === 'es' ? t('conversations.langSpanish') : t('conversations.langEnglish')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  conv.mode === 'auto' ? 'bg-emerald-500/10 text-emerald-600' :
                  conv.mode === 'needs_attention' ? 'bg-amber-500/10 text-amber-600' :
                  conv.mode === 'human_takeover' ? 'bg-destructive/10 text-destructive' :
                  'bg-muted text-foreground'
                }`}>
                  {conv.mode === 'auto' ? <><Bot size={12} /> {t('conversations.modeAuto')}</> :
                   conv.mode === 'human_takeover' ? <><User size={12} /> {t('conversations.modeYou')}</> :
                   conv.mode === 'needs_attention' ? <><AlertTriangle size={12} /> {t('conversations.modeAttention')}</> :
                   conv.mode}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(conv.lastMessageAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
