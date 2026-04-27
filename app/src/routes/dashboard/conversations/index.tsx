import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useConversations } from '../../../hooks/use-conversations'
import { MessageSquare, AlertTriangle, User, Bot } from 'lucide-react'

export const Route = createFileRoute('/dashboard/conversations/')({
  component: ConversationsPage,
})

function ConversationsPage() {
  const { conversations, isLoading, loadConversations, setActiveConversationId } = useConversations()

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Chats</h2>
        <div className="flex gap-2">
          <span className="text-sm text-gray-500">{conversations.length} conversations</span>
        </div>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : conversations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
          <p>No conversations yet</p>
          <p className="text-sm">Conversations will appear when customers message via WhatsApp.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              to="/dashboard/conversations/$id"
              params={{ id: conv.id }}
              onClick={() => setActiveConversationId(conv.id)}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                {(conv.mode === 'needs_attention' || conv.mode === 'human_takeover') && (
                  <AlertTriangle size={20} className="text-orange-500" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{conv.customerId}</p>
                  <p className="text-sm text-gray-500">{conv.language === 'es' ? 'Spanish' : 'English'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  conv.mode === 'auto' ? 'bg-green-100 text-green-700' :
                  conv.mode === 'needs_attention' ? 'bg-orange-100 text-orange-700' :
                  conv.mode === 'human_takeover' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {conv.mode === 'auto' ? <><Bot size={12} /> Auto</> :
                   conv.mode === 'human_takeover' ? <><User size={12} /> You</> :
                   conv.mode}
                </span>
                <span className="text-xs text-gray-400">
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
