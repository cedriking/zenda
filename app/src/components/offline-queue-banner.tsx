import { AlertCircle, RefreshCw, Send, Trash2, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../services/api-client";

interface QueueStats {
  offlineQueue: { total: number; safe: number; unsafe: number };
  retryQueue: { pending: number; oldest: number };
}

export function OfflineQueueBanner() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const data = await apiFetch<QueueStats>("/queue");
        setStats(data);
        if (data.offlineQueue?.total > 0) {
          setShowPanel(true);
        }
      } catch {
        /* offline */
      }
    };
    check();
    const interval = setInterval(check, 15_000);
    return () => clearInterval(interval);
  }, []);

  if (!stats || stats.offlineQueue.total === 0) {
    return null;
  }

  const flushQueue = async () => {
    setSending(true);
    setError(null);
    try {
      await apiFetch("/queue/flush", { method: "POST" });
      setStats(null);
      setShowPanel(false);
    } catch {
      setError(t("offlineQueue.flushFailed"));
    }
    setSending(false);
  };

  const clearQueue = async () => {
    setError(null);
    try {
      await apiFetch("/queue?type=unsafe", { method: "DELETE" });
      setStats({
        ...stats,
        offlineQueue: {
          total: stats.offlineQueue.safe,
          safe: stats.offlineQueue.safe,
          unsafe: 0,
        },
      });
    } catch {
      setError(t("offlineQueue.clearFailed"));
    }
  };

  return (
    <div className="fixed right-4 bottom-4 z-50">
      {showPanel ? (
        <div className="w-80 space-y-3 rounded-lg border border-amber-300 bg-card p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-amber-600 dark:text-amber-400">
              {t("offlineQueue.title")}
            </h3>
            <button
              className="text-amber-600 text-lg leading-none hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
              onClick={() => setShowPanel(false)}
            >
              &times;
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("offlineQueue.messagesWaiting", {
                  count: stats.offlineQueue.total,
                })}
              </span>
            </div>

            {stats.retryQueue.pending > 0 && (
              <div className="flex items-center gap-2 text-amber-600">
                <RefreshCw className="animate-spin" size={14} />
                {t("offlineQueue.retrying")} ({stats.retryQueue.pending})
              </div>
            )}

            <div className="flex gap-2 pt-1 text-xs">
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700">
                {t("offlineQueue.readyToSend")}: {stats.offlineQueue.safe}
              </span>
              {stats.offlineQueue.unsafe > 0 && (
                <span className="rounded bg-red-100 px-2 py-0.5 text-red-700">
                  {t("offlineQueue.drafts")}: {stats.offlineQueue.unsafe}
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm">
              <AlertCircle className="shrink-0" size={14} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              className="flex flex-1 items-center justify-center gap-1 rounded bg-amber-500 px-3 py-1.5 text-sm text-white hover:bg-amber-600 disabled:opacity-50"
              disabled={sending}
              onClick={flushQueue}
            >
              <Send size={14} />
              {sending ? t("offlineQueue.sending") : t("offlineQueue.sendAll")}
            </button>
            {stats.offlineQueue.unsafe > 0 && (
              <button
                className="flex items-center gap-1 rounded border border-red-300 px-3 py-1.5 text-red-600 text-sm hover:bg-red-50"
                onClick={clearQueue}
              >
                <Trash2 size={14} />
                {t("offlineQueue.clear")}
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-white shadow-lg hover:bg-amber-600"
          onClick={() => setShowPanel(true)}
        >
          <WifiOff size={16} />
          {t("offlineQueue.queuedMessages", {
            count: stats.offlineQueue.total,
          })}
        </button>
      )}
    </div>
  );
}
