import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../services/api-client'

interface Conversation {
  id: string
  customerId: string
  mode: string
  language: string
  channel: string
  lastMessageAt: string
  needsAttentionReason: string | null
  createdAt: string
}

interface Message {
  id: string
  conversationId: string
  senderType: string
  contentType: string
  body: string
  status: string
  createdAt: string
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(false)

  const loadConversations = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await apiFetch<Conversation[]>('/conversations')
      setConversations(data)
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const data = await apiFetch<Message[]>(`/conversations/${conversationId}/messages`)
      setMessages(prev => ({ ...prev, [conversationId]: data.reverse() }))
    } catch {
      // silent
    }
  }, [])

  const updateMode = useCallback(async (conversationId: string, mode: string) => {
    await apiFetch(`/conversations/${conversationId}/mode`, {
      method: 'PATCH',
      body: JSON.stringify({ mode }),
    })
    setConversations(prev =>
      prev.map(c => c.id === conversationId ? { ...c, mode } : c),
    )
  }, [])

  const sendMessage = useCallback(async (conversationId: string, text: string) => {
    const msg = await apiFetch<Message>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    })
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] ?? []), msg],
    }))
    return msg
  }, [])

  // Listen for real-time updates from main process
  useEffect(() => {
    const unsubUpdate = window.electron?.on?.('conversation:update', (data: Partial<Conversation>) => {
      setConversations(prev =>
        prev.map(c => c.id === data.id ? { ...c, ...data } : c),
      )
    })
    return () => { unsubUpdate?.() }
  }, [])

  return {
    conversations,
    activeConversationId,
    messages,
    unreadCounts,
    isLoading,
    setActiveConversationId,
    loadConversations,
    loadMessages,
    updateMode,
    sendMessage,
  }
}
