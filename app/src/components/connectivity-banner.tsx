import { RefreshCw, WifiOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../services/api-client";

export function ConnectivityBanner() {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const checkConnection = useCallback(async () => {
    setIsRetrying(true);
    try {
      await apiFetch("/health", { method: "GET" });
      setIsOffline(false);
    } catch {
      // Still offline
    } finally {
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    // Check API reachability immediately on mount, then periodically
    const check = async () => {
      // Skip health check when the page is hidden
      if (document.visibilityState === "hidden") {
        return;
      }
      try {
        await apiFetch("/health", { method: "GET" });
        setIsOffline(false);
      } catch {
        setIsOffline(true);
      }
    };

    check();
    const interval = setInterval(check, 15_000);

    // Also listen for browser offline/online events
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => checkConnection();

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [checkConnection]);

  if (!isOffline) {
    return null;
  }

  return (
    <div
      className="flex items-center justify-center gap-3 border-warning/20 border-b bg-warning/10 px-4 py-2 text-sm text-warning-foreground"
      role="alert"
    >
      <WifiOff size={16} />
      <span>
        {isRetrying
          ? t("connectivity.reconnecting")
          : t("connectivity.connectionLost")}
      </span>
      <button
        aria-label={t("connectivity.retry")}
        className="flex items-center gap-1 rounded bg-warning/20 px-2 py-0.5 text-xs transition hover:bg-warning/30 disabled:opacity-50"
        disabled={isRetrying}
        onClick={checkConnection}
        type="button"
      >
        <RefreshCw className={isRetrying ? "animate-spin" : ""} size={12} />
        {t("connectivity.retry")}
      </button>
    </div>
  );
}
