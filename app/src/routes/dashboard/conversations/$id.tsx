import {
  AlertCircle,
  ArrowLeft,
  Bot,
  CalendarDays,
  Globe,
  Info,
  Phone,
  Send,
  User,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "@/utils/router";
import { useConversations } from "../../../hooks/use-conversations";

function MessageBubble({
  msg,
}: {
  msg: { id: string; senderType: string; body: string; createdAt: string };
}) {
  const isCustomer = msg.senderType === "customer";
  const isAi = msg.senderType === "ai";
  const time = new Date(msg.createdAt).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const bubbleStyles: Record<string, string> = {
    customer: "rounded-bl-sm bg-muted text-foreground",
    ai: "rounded-br-sm bg-primary text-white",
    owner: "rounded-br-sm bg-emerald-500 text-white",
  };
  const bubbleClass = bubbleStyles[msg.senderType] ?? bubbleStyles.owner;

  return (
    <div
      className={`flex ${isCustomer ? "justify-start" : "justify-end"} fade-in-0 slide-in-from-bottom-1 animate-in duration-300`}
    >
      <div className="flex flex-col items-end">
        <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${bubbleClass}`}>
          <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">
            {msg.body}
          </p>
        </div>
        <span className="mt-1 mr-1 text-[10px] text-muted-foreground">
          {isAi && (
            <Bot aria-hidden="true" className="mr-0.5 inline" size={10} />
          )}
          {!(isCustomer || isAi) && (
            <User aria-hidden="true" className="mr-0.5 inline" size={10} />
          )}
          {time}
        </span>
      </div>
    </div>
  );
}

export default function ConversationDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const {
    conversations,
    messages,
    error,
    loadConversation,
    loadMessages,
    updateMode,
    sendMessage,
  } = useConversations();
  const [input, setInput] = useState("");
  const [modeError, setModeError] = useState<string | null>(null);
  const [confirmTakeOver, setConfirmTakeOver] = useState(false);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(true);
  const isNearBottomRef = useRef(true);
  const conv = conversations.find((c) => c.id === id);

  useEffect(() => {
    initialLoadRef.current = true;
    loadConversation(id);
    loadMessages(id);
  }, [id, loadConversation, loadMessages]);

  // Track whether user is near the bottom of the scroll container
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) {
      return;
    }
    // Consider "near bottom" if within 100px of the bottom
    const threshold = 100;
    isNearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  // Smart auto-scroll: instant on initial load, smooth only when near bottom
  useEffect(() => {
    const convMessages = messages[id] ?? [];
    if (convMessages.length === 0) {
      return;
    }

    if (initialLoadRef.current) {
      // Initial load: always scroll to bottom instantly
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      });
      initialLoadRef.current = false;
    } else if (isNearBottomRef.current) {
      // New message and user is near bottom: smooth scroll
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    // If user scrolled up, don't auto-scroll — let them read history
  }, [messages[id], id]);

  const clearModeError = useCallback(() => setModeError(null), []);

  const handleSend = async () => {
    if (!input.trim()) {
      return;
    }
    await sendMessage(id, input.trim());
    setInput("");
  };

  useEffect(() => {
    if (!confirmTakeOver) {
      return;
    }
    const timer = setTimeout(() => setConfirmTakeOver(false), 3000);
    return () => clearTimeout(timer);
  }, [confirmTakeOver]);

  const handleTakeOverClick = () => {
    if (confirmTakeOver) {
      handleTakeOver();
    } else {
      setConfirmTakeOver(true);
    }
  };

  const handleTakeOver = async () => {
    setConfirmTakeOver(false);
    setModeError(null);
    const previousMode = conv?.mode;
    try {
      await updateMode(id, "human_takeover");
    } catch (err) {
      setModeError(
        err instanceof Error ? err.message : t("conversation.errors.takeoverFailed", "Failed to take over conversation")
      );
      if (previousMode) {
        updateMode(id, previousMode).catch(() => {});
      }
    }
  };

  const handleReturnToAuto = async () => {
    setModeError(null);
    const previousMode = conv?.mode;
    try {
      await updateMode(id, "auto");
    } catch (err) {
      setModeError(
        err instanceof Error ? err.message : t("conversation.errors.returnToAutoFailed", "Failed to return to auto mode")
      );
      if (previousMode) {
        updateMode(id, previousMode).catch(() => {});
      }
    }
  };

  const convMessages = messages[id] ?? [];

  // Build date separators for messages
  type Msg = (typeof convMessages)[number];
  type ChatItem =
    | { type: "date"; date: string; id: string }
    | { type: "message"; msg: Msg };

  const chatItems: ChatItem[] = useMemo(() => {
    const items: ChatItem[] = [];
    let lastDate = "";
    for (const msg of convMessages) {
      const msgDate = new Date(msg.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      if (msgDate !== lastDate) {
        items.push({ type: "date", date: msgDate, id: `date-${msg.id}` });
        lastDate = msgDate;
      }
      items.push({ type: "message", msg });
    }
    return items;
  }, [convMessages]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-border border-b bg-card p-4">
        <div className="flex items-center gap-3">
          <Link
            aria-label={t("conversation.backToConversations")}
            className="text-muted-foreground hover:text-foreground"
            to="/dashboard/conversations"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground">
                {conv?.customerName ??
                  conv?.customerPhone ??
                  t("conversation.defaultCustomer")}
              </h3>
              <button
                aria-expanded={showCustomerInfo}
                aria-label={t("conversation.toggleCustomerInfo", "Toggle customer information")}
                className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setShowCustomerInfo((prev) => !prev)}
              >
                <Info size={16} />
              </button>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                conv?.mode === "auto"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : conv?.mode === "human_takeover"
                    ? "bg-destructive/10 text-destructive"
                    : conv?.mode === "needs_attention"
                      ? "bg-amber-500/10 text-amber-600"
                      : conv?.mode === "paused"
                        ? "bg-gray-500/10 text-gray-600"
                        : conv?.mode === "queued_offline"
                          ? "bg-blue-500/10 text-blue-600"
                          : conv?.mode === "closed"
                            ? "bg-gray-500/10 text-gray-500"
                            : "bg-gray-500/10 text-gray-600"
              }`}
            >
              {conv?.mode === "auto"
                ? t("conversation.modeAi")
                : conv?.mode === "human_takeover"
                  ? t("conversation.modeYou")
                  : conv?.mode === "needs_attention"
                    ? t("conversation.modeAttention")
                    : conv?.mode === "paused"
                      ? t("conversation.modePaused")
                      : conv?.mode === "queued_offline"
                        ? t("conversation.modeQueued")
                        : conv?.mode === "closed"
                          ? t("conversation.modeClosed")
                          : (conv?.mode ?? t("conversation.modeUnknown"))}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {(conv?.mode === "auto" || conv?.mode === "needs_attention") && (
            <button
              aria-label={
                confirmTakeOver
                  ? t("conversation.takeOver")
                  : t("conversation.takeOverAria")
              }
              className={`rounded-lg px-3 py-1.5 text-sm ${
                confirmTakeOver
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : "bg-amber-500 text-white hover:bg-amber-600"
              }`}
              onClick={handleTakeOverClick}
            >
              {confirmTakeOver
                ? `${t("conversation.takeOver")}?`
                : t("conversation.takeOver")}
            </button>
          )}
          {conv?.mode === "human_takeover" && (
            <button
              aria-label={t("conversation.returnToAutoAria")}
              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm text-white hover:bg-emerald-600"
              onClick={handleReturnToAuto}
            >
              {t("conversation.returnToAuto")}
            </button>
          )}
        </div>
      </div>

      {/* Collapsible customer info panel */}
      {showCustomerInfo && (
        <div className="border-border border-b bg-muted p-4">
          <div className="grid max-w-lg grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Phone className="text-muted-foreground" size={14} />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {t("conversation.phone")}
                </p>
                <p className="text-foreground text-sm">
                  {conv?.customerPhone ?? t("common.notAvailable", "N/A")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="text-muted-foreground" size={14} />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {t("conversation.language")}
                </p>
                <p className="text-foreground text-sm">
                  {(conv?.customerLanguage ?? conv?.language) === "es"
                    ? t("conversations.langSpanish")
                    : (conv?.customerLanguage ?? conv?.language) === "en"
                      ? t("conversations.langEnglish")
                      : (conv?.customerLanguage ?? conv?.language ?? t("common.unknown", "Unknown"))}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="text-muted-foreground" size={14} />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {t("conversation.mode")}
                </p>
                <p className="text-foreground text-sm">
                  {conv?.mode === "auto"
                    ? t("conversation.modeAi")
                    : conv?.mode === "human_takeover"
                      ? t("conversation.modeYou")
                      : conv?.mode === "needs_attention"
                        ? t("conversation.modeAttention")
                        : conv?.mode === "paused"
                          ? t("conversation.modePaused")
                          : conv?.mode === "queued_offline"
                            ? t("conversation.modeQueued")
                            : conv?.mode === "closed"
                              ? t("conversation.modeClosed")
                              : (conv?.mode ?? t("conversation.modeUnknown"))}
                </p>
              </div>
            </div>
          </div>
          <Link
            className="mt-3 inline-flex items-center gap-1 text-primary text-xs hover:text-primary/80 hover:underline"
            to="/dashboard/appointments"
          >
            <CalendarDays size={12} />
            {t("conversation.viewAppointments")}
          </Link>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-2 border-border border-b bg-destructive/10 p-3 text-destructive text-sm"
          role="alert"
        >
          <AlertCircle aria-hidden="true" size={16} />
          {error}
        </div>
      )}

      {/* Mode switch error */}
      {modeError && (
        <div
          className="flex items-center justify-between border-border border-b bg-destructive/10 p-3 text-destructive text-sm"
          role="alert"
        >
          <span className="flex items-center gap-2">
            <AlertCircle aria-hidden="true" size={16} />
            {modeError}
          </span>
          <button
            className="text-destructive text-xs underline hover:text-destructive/80"
            onClick={clearModeError}
          >
            {t("common.close")}
          </button>
        </div>
      )}

      {/* Messages */}
      <div
        aria-label={t("conversation.messagesAria")}
        aria-live="polite"
        className="flex-1 space-y-1 overflow-auto px-4 py-4"
        onScroll={handleScroll}
        ref={scrollContainerRef}
        role="log"
      >
        {convMessages.length === 0 && !error && (
          <div className="py-8 text-center text-muted-foreground text-sm">
            {t("conversation.noMessages")}
          </div>
        )}
        {chatItems.map((item) =>
          item.type === "date" ? (
            <div
              className="flex items-center justify-center py-3"
              key={item.id}
            >
              <span className="rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">
                {item.date}
              </span>
            </div>
          ) : (
            <MessageBubble key={item.msg.id} msg={item.msg} />
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input — always show when in human_takeover or needs_attention */}
      {(conv?.mode === "human_takeover" ||
        conv?.mode === "needs_attention") && (
        <div className="border-border border-t bg-card p-4">
          <div className="flex gap-2">
            <input
              aria-label={t("conversation.inputAria")}
              autoFocus
              className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={t("conversation.inputPlaceholder")}
              type="text"
              value={input}
            />
            <button
              aria-label={t("conversation.sendAria")}
              className="rounded-lg bg-primary px-4 py-2 text-white transition-opacity hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!input.trim()}
              onClick={handleSend}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
