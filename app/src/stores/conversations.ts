import { create } from 'zustand'
import type { Conversation, Message, ConversationMode } from '@zenda/shared'

const MAX_MESSAGES_PER_CONVERSATION = 200

function trimMessages(messages: Message[]): Message[] {
  if (messages.length <= MAX_MESSAGES_PER_CONVERSATION) return messages
  return messages.slice(messages.length - MAX_MESSAGES_PER_CONVERSATION)
}

interface ConversationsState {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: Record<string, Message[]>
  unreadCounts: Record<string, number>
  isLoading: boolean

  setConversations: (conversations: Conversation[]) => void
  addConversation: (conversation: Conversation) => void
  updateConversationMode: (id: string, mode: ConversationMode) => void
  setActiveConversation: (id: string | null) => void
  setMessages: (conversationId: string, messages: Message[]) => void
  addMessage: (conversationId: string, message: Message) => void
  incrementUnread: (conversationId: string) => void
  clearUnread: (conversationId: string) => void
  setLoading: (loading: boolean) => void
}

export const useConversationsStore = create<ConversationsState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  unreadCounts: {},
  isLoading: false,

  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) =>
    set((state) => ({ conversations: [conversation, ...state.conversations] })),
  updateConversationMode: (id, mode) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, mode } : c
      ),
    })),
  setActiveConversation: (activeConversationId) => set({ activeConversationId }),
  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: trimMessages(messages) },
    })),
  addMessage: (conversationId, message) =>
    set((state) => {
      const updated = [...(state.messages[conversationId] ?? []), message]
      return {
        messages: {
          ...state.messages,
          [conversationId]: trimMessages(updated),
        },
      }
    }),
  incrementUnread: (conversationId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: (state.unreadCounts[conversationId] ?? 0) + 1,
      },
    })),
  clearUnread: (conversationId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [conversationId]: 0 },
    })),
  setLoading: (isLoading) => set({ isLoading }),
}))
