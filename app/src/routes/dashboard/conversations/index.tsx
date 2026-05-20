import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import { useConversations } from '../../../hooks/use-conversations'
import { MessageSquare, AlertTriangle, User, Bot, Search, X } from 'lucide-react'

export const Route = createFileRoute('/dashboard/conversations/')({
  component: ConversationsPage,
})

function ConversationsPage() {
  const { conversations, isLoading, error, loadConversations, setActiveConversationId } = useConversations()
  const [searchQuery, setSearchQuery] = useState('')

  const avatarColors = useMemo(() => [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-orange-100 text-orange-700',
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Chats</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-9 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{conversations.length} conversations</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
          {error}
          <button onClick={() => loadConversations()} className="ml-2 underline">Retry</button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div>
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-16 bg-gray-100 dark:bg-gray-600 rounded mt-1" />
                </div>
              </div>
              <div className="h-5 w-14 bg-gray-100 dark:bg-gray-600 rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
          {searchQuery ? (
            <>
              <p>No conversations match "{searchQuery}"</p>
              <button onClick={() => setSearchQuery('')} className="text-blue-500 dark:text-blue-400 text-sm mt-2">Clear search</button>
            </>
          ) : (
            <>
              <p>No conversations yet</p>
              <p className="text-sm">Conversations will appear when customers message via WhatsApp.</p>
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
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                {(conv.mode === 'needs_attention' || conv.mode === 'human_takeover') && (
                  <AlertTriangle size={20} className="text-orange-500" />
                )}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${avatarColors[(conv.customerName ?? conv.customerId).charCodeAt(0) % avatarColors.length]}`}>
                  {(conv.customerName ?? '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className={`text-gray-900 dark:text-gray-100 ${(conv.unreadCount ?? 0) > 0 ? 'font-bold' : 'font-medium'}`}>
                      {conv.customerName ?? conv.customerId}
                    </p>
                    {(conv.unreadCount ?? 0) > 0 && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" aria-label="Unread messages" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{conv.lastMessagePreview ?? 'No messages yet'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{conv.language === 'es' ? 'Spanish' : 'English'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  conv.mode === 'auto' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  conv.mode === 'needs_attention' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                  conv.mode === 'human_takeover' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {conv.mode === 'auto' ? <><Bot size={12} /> Auto</> :
                   conv.mode === 'human_takeover' ? <><User size={12} /> You</> :
                   conv.mode}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
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
