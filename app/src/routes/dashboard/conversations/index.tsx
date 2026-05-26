import {
  AlertTriangle,
  Bot,
  MessageSquare,
  Search,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@/utils/router";
import { useConversations } from "../../../hooks/use-conversations";

export default function ConversationsPage() {
  const { t } = useTranslation();
  const {
    conversations,
    isLoading,
    error,
    loadConversations,
    setActiveConversationId,
  } = useConversations();
  const [searchQuery, setSearchQuery] = useState("");

  const avatarColors = useMemo(
    () => [
      "bg-blue-100 text-blue-700",
      "bg-emerald-100 text-emerald-700",
      "bg-purple-100 text-purple-700",
      "bg-amber-100 text-amber-700",
      "bg-pink-100 text-pink-700",
    ],
    []
  );

  useEffect(() => {
    loadConversations();
    const interval = setInterval(() => loadConversations(), 15_000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  // Note: conversation:update listener is already registered by useConversations hook -- no duplicate needed

  const filtered = searchQuery.trim()
    ? conversations.filter(
        (c) =>
          (c.customerName ?? c.customerPhone ?? c.customerId)
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (c.lastMessagePreview ?? "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : conversations;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-bold text-2xl text-foreground">
          {t("conversations.heading")}
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              className="w-64 rounded-lg border border-border bg-card py-2 pr-8 pl-9 text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              data-testid="global-search"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("conversations.searchPlaceholder")}
              type="text"
              value={searchQuery}
            />
            {searchQuery && (
              <button
                className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery("")}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <span className="text-muted-foreground text-sm">
            {searchQuery.trim()
              ? t("conversations.countFiltered", {
                  filtered: filtered.length,
                  total: conversations.length,
                })
              : t("conversations.count", { count: conversations.length })}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-border bg-destructive/10 p-3 text-destructive text-sm">
          {error}
          <button
            className="ml-2 underline"
            onClick={() => loadConversations()}
          >
            {t("common.retry")}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              className="flex animate-pulse items-center justify-between rounded-lg border border-border bg-card p-4"
              key={i}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div>
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="mt-1 h-3 w-16 rounded bg-muted" />
                </div>
              </div>
              <div className="h-5 w-14 rounded-full bg-muted" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <MessageSquare className="mx-auto mb-4 opacity-50" size={48} />
          {searchQuery ? (
            <>
              <p>{t("conversations.noMatch", { query: searchQuery })}</p>
              <button
                className="mt-2 text-primary text-sm"
                onClick={() => setSearchQuery("")}
              >
                {t("conversations.clearSearch")}
              </button>
            </>
          ) : (
            <>
              <p>{t("conversations.empty")}</p>
              <p className="text-sm">{t("conversations.emptyHint")}</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((conv) => (
            <Link
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-border"
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              params={{ id: conv.id }}
              to="/dashboard/conversations/$id"
            >
              <div className="flex items-center gap-3">
                {(conv.mode === "needs_attention" ||
                  conv.mode === "human_takeover") && (
                  <AlertTriangle className="text-amber-500" size={20} />
                )}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-medium text-sm ${avatarColors[(conv.customerName ?? conv.customerPhone ?? conv.customerId).charCodeAt(0) % avatarColors.length]}`}
                >
                  {(conv.customerName ?? conv.customerPhone ?? "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p
                      className={`text-foreground ${(conv.unreadCount ?? 0) > 0 ? "font-bold" : "font-medium"}`}
                    >
                      {conv.customerName ??
                        conv.customerPhone ??
                        conv.customerId}
                    </p>
                    {(conv.unreadCount ?? 0) > 0 && (
                      <span
                        aria-label="Unread messages"
                        className="h-2 w-2 shrink-0 rounded-full bg-primary"
                      />
                    )}
                  </div>
                  <p className="max-w-[200px] truncate text-muted-foreground text-sm">
                    {conv.lastMessagePreview ?? t("conversation.noMessages")}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {(conv.customerLanguage ?? conv.language) === "es"
                      ? t("conversations.langSpanish")
                      : t("conversations.langEnglish")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    conv.mode === "auto"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : conv.mode === "needs_attention"
                        ? "bg-amber-500/10 text-amber-600"
                        : conv.mode === "human_takeover"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-foreground"
                  }`}
                >
                  {conv.mode === "auto" ? (
                    <>
                      <Bot size={12} /> {t("conversations.modeAuto")}
                    </>
                  ) : conv.mode === "human_takeover" ? (
                    <>
                      <User size={12} /> {t("conversations.modeYou")}
                    </>
                  ) : conv.mode === "needs_attention" ? (
                    <>
                      <AlertTriangle size={12} />{" "}
                      {t("conversations.modeAttention")}
                    </>
                  ) : (
                    conv.mode
                  )}
                </span>
                <span className="text-muted-foreground text-xs">
                  {new Date(conv.lastMessageAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
