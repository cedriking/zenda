import {
  Calendar,
  CheckCircle,
  ExternalLink,
  Loader2,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { openExternalLink } from "@/actions/shell";
import { apiFetch } from "@/services/api-client";

interface CalendarInfo {
  id: string;
  primary: boolean;
  summary: string;
}

interface IntegrationStatus {
  connected: boolean;
  email?: string | null;
  lastSyncAt?: string | null;
  selectedCalendarId?: string | null;
}

export default function IntegrationsPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] =
    useState<string>("primary");

  const fetchStatus = useCallback(async () => {
    try {
      const res = await apiFetch("/integrations/google/status");
      const data = (await res.json()) as IntegrationStatus;
      setStatus(data);
      if (data.connected) {
        setSelectedCalendarId(data.selectedCalendarId ?? "primary");
      }
    } catch {
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // Listen for deep-link callback from OAuth flow (Electron only)
    // biome-ignore lint/suspicious/noExplicitAny: electron bridge is untyped
    const cleanup = (window as any).electron?.on?.(
      "deep-link:integrations-callback",
      (data: { status?: string }) => {
        if (data?.status === "success") {
          fetchStatus();
        }
      }
    );

    return () => {
      cleanup?.();
    };
  }, [fetchStatus]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await apiFetch("/integrations/google/connect");
      const data = (await res.json()) as { authUrl?: string };
      if (data.authUrl) {
        openExternalLink(data.authUrl);
      }
    } catch {
      // OAuth URL fetch failed — nothing to show the user
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await apiFetch("/integrations/google/disconnect", { method: "POST" });
      setStatus({ connected: false });
      setCalendars([]);
    } catch {
      // Disconnect failed — UI still shows disconnected state
    }
  };

  const loadCalendars = async () => {
    try {
      const res = await apiFetch("/integrations/google/calendars");
      const data = (await res.json()) as { calendars: CalendarInfo[] };
      setCalendars(data.calendars);
    } catch {
      // Calendar list fetch failed — dropdown stays with default
    }
  };

  const handleSelectCalendar = async (calendarId: string) => {
    setSelectedCalendarId(calendarId);
    try {
      await apiFetch("/integrations/google/calendars/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calendarId }),
      });
    } catch {
      // Selection save failed — local state already updated
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const description = status?.connected
    ? t(
        "Sync your appointments to Google Calendar. New bookings will automatically create events."
      )
    : t("Connect your Google Calendar to automatically sync appointments.");

  return (
    <div className="space-y-6">
      <h1 className="font-semibold text-2xl">{t("Integrations")}</h1>

      {/* Google Calendar Card */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <Calendar className="h-5 w-5 text-blue-500" />
          <h2 className="font-medium text-lg">Google Calendar</h2>
          {status?.connected && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-700 text-xs">
              <CheckCircle className="h-3 w-3" />
              Connected
            </span>
          )}
        </div>

        <p className="mb-4 text-muted-foreground text-sm">{description}</p>

        {status?.connected ? (
          <div className="space-y-4">
            {status.email && (
              <p className="text-muted-foreground text-sm">
                Connected as <strong>{status.email}</strong>
              </p>
            )}

            {/* Calendar selector */}
            <div className="space-y-2">
              <label className="font-medium text-sm" htmlFor="calendar-select">
                {t("Calendar to sync")}
              </label>
              <div className="flex items-center gap-2">
                <select
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  id="calendar-select"
                  onChange={(e) => handleSelectCalendar(e.target.value)}
                  onFocus={loadCalendars}
                  value={selectedCalendarId}
                >
                  {calendars.length === 0 ? (
                    <option value="primary">Primary Calendar</option>
                  ) : (
                    calendars.map((cal) => (
                      <option key={cal.id} value={cal.id}>
                        {cal.summary}
                        {cal.primary ? " (Primary)" : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <button
              className="inline-flex items-center gap-2 rounded-md border border-red-300 px-4 py-2 font-medium text-red-600 text-sm hover:bg-red-50"
              onClick={handleDisconnect}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
              {t("Disconnect")}
            </button>
          </div>
        ) : (
          <button
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
            disabled={connecting}
            onClick={handleConnect}
            type="button"
          >
            {connecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            {connecting ? t("Connecting...") : t("Connect Google Calendar")}
          </button>
        )}
      </div>
    </div>
  );
}
