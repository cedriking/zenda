import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../services/api-client";

interface Conversation {
  channel: string;
  createdAt: string;
  customerId: string;
  customerLanguage: string | null;
  customerName: string | null;
  customerPhone: string | null;
  id: string;
  language: string;
  lastMessageAt: string;
  lastMessagePreview: string | null;
  mode: string;
  needsAttentionReason: string | null;
  unreadCount: number;
}

export interface Message {
  body: string;
  contentType: string;
  conversationId: string;
  createdAt: string;
  id: string;
  senderType: string;
  status: string;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  // Track lastMessageAt per conversation to avoid redundant reloads
  const lastMessageAtRef = useRef<Record<string, string>>({});
  // Track message counts per conversation to avoid object-reference deps in effects
  const messageCountRef = useRef<Record<string, number>>({});

  const loadConversations = useCallback(async (page = 0) => {
    if (page === 0) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await apiFetch<Conversation[]>(
        `/conversations?include=customer&limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`
      );
      const result = data as Conversation[];
      if (page === 0) {
        setConversations(result);
      } else {
        setConversations((prev) => [...prev, ...result]);
      }
      setHasMore(result.length === PAGE_SIZE);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load conversations"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      const data = await apiFetch<Conversation>(
        `/conversations/${conversationId}`
      );
      const conv = data as Conversation;
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === conversationId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = conv;
          return next;
        }
        return [conv, ...prev];
      });
    } catch (err) {
      console.error("Failed to load conversation:", err);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const data = await apiFetch<Message[]>(
        `/conversations/${conversationId}/messages`
      );
      const reversed = [...data].reverse();
      setMessages((prev) => ({ ...prev, [conversationId]: reversed }));
      messageCountRef.current[conversationId] = reversed.length;
      if (reversed.length > 0 && reversed.at(-1)!) {
        lastMessageAtRef.current[conversationId] = reversed.at(-1)!.createdAt;
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, []);

  const updateMode = useCallback(
    async (conversationId: string, mode: string) => {
      const prevMode = conversations.find((c) => c.id === conversationId)?.mode;
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, mode } : c))
      );
      try {
        await apiFetch(`/conversations/${conversationId}/mode`, {
          method: "PATCH",
          body: { mode },
        });
      } catch {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, mode: prevMode! } : c
          )
        );
      }
    },
    [conversations]
  );

  const sendMessage = useCallback(
    async (conversationId: string, text: string) => {
      const msg = await apiFetch<Message>(
        `/conversations/${conversationId}/messages`,
        {
          method: "POST",
          body: { text },
        }
      );
      setMessages((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), msg],
      }));
      messageCountRef.current[conversationId] =
        (messageCountRef.current[conversationId] ?? 0) + 1;
      lastMessageAtRef.current[conversationId] = msg.createdAt;
      return msg;
    },
    []
  );

  // Listen for real-time updates from main process
  useEffect(() => {
    const unsubUpdate = window.electron?.on?.(
      "conversation:update",
      (data: unknown) => {
        const partial = data as Partial<Conversation>;
        setConversations((prev) =>
          prev.map((c) => (c.id === partial.id ? { ...c, ...partial } : c))
        );
        // Reload messages when a conversation we're viewing gets a new message
        if (partial.id && partial.lastMessageAt) {
          const lastKnown = lastMessageAtRef.current[partial.id];
          if (!lastKnown || partial.lastMessageAt > lastKnown) {
            loadMessages(partial.id);
          }
        }
      }
    );

    // Listen for AI responses pushed from the bridge (instant, no full reload needed)
    const unsubSendResponse = window.electron?.on?.(
      "whatsapp:send-response",
      (data: unknown) => {
        const response = data as { conversationId?: string; message?: Message };
        if (response.conversationId && response.message) {
          setMessages((prev) => {
            const existing = prev[response.conversationId!] ?? [];
            if (existing.some((m) => m.id === response.message?.id)) {
              return prev;
            }
            return {
              ...prev,
              [response.conversationId!]: [...existing, response.message!],
            };
          });
          messageCountRef.current[response.conversationId] =
            (messageCountRef.current[response.conversationId] ?? 0) + 1;
          if (response.message.createdAt) {
            lastMessageAtRef.current[response.conversationId] =
              response.message.createdAt;
          }
        }
      }
    );

    return () => {
      unsubUpdate?.();
      unsubSendResponse?.();
    };
  }, [loadMessages]);

  return {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    error,
    hasMore,
    setActiveConversationId,
    loadConversations,
    loadConversation,
    loadMessages,
    updateMode,
    sendMessage,
  };
}
