import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Inbox,
  MessageSquare,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@/utils/router";
import { apiFetch } from "../../services/api-client";

interface DashboardStats {
  activeConversations: number;
  needsAttention: number;
  todayAppointments: number;
  todayMessages: number;
}

interface RecentConversation {
  createdAt: string;
  customerName: string | null;
  id: string;
}

interface RecentAppointment {
  customerName: string | null;
  id: string;
  serviceName: string | null;
  startAt: string;
  status: string;
}

interface TodayAppointment {
  customerName: string | null;
  endAt: string;
  id: string;
  serviceName: string | null;
  startAt: string;
  status: string;
}

type ActivityItem =
  | { type: "conversation"; customerName: string | null; createdAt: string }
  | {
      type: "appointment_booked";
      customerName: string | null;
      date: string;
      time: string;
      createdAt: string;
    }
  | {
      type: "appointment_completed";
      customerName: string | null;
      createdAt: string;
    };

export default function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    activeConversations: 0,
    needsAttention: 0,
    todayMessages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<TodayAppointment[]>([]);

  const loadStats = useCallback(async () => {
    try {
      setError(null);
      const result = await apiFetch<DashboardStats>(
        "/analytics/dashboard-stats"
      );
      setStats(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("dashboard.errorLoad"));
    }
  }, [t]);

  const loadRecentActivity = useCallback(async () => {
    try {
      const [conversations, appointments] = await Promise.all([
        apiFetch<RecentConversation[]>("/conversations?limit=5"),
        apiFetch<RecentAppointment[]>("/appointments?limit=5&status=confirmed"),
      ]);

      const items: ActivityItem[] = [];

      for (const c of conversations) {
        items.push({
          type: "conversation",
          customerName: c.customerName,
          createdAt: c.createdAt,
        });
      }

      for (const a of appointments) {
        if (a.status === "completed") {
          items.push({
            type: "appointment_completed",
            customerName: a.customerName,
            createdAt: a.startAt,
          });
        } else {
          const startDate = new Date(a.startAt);
          items.push({
            type: "appointment_booked",
            customerName: a.customerName,
            date: startDate.toLocaleDateString(),
            time: startDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            createdAt: a.startAt,
          });
        }
      }

      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentActivity(items.slice(0, 8));
    } catch {
      // Activity feed is non-critical; ignore errors
    }
  }, []);

  const loadTodaySchedule = useCallback(async () => {
    try {
      const data = await apiFetch<TodayAppointment[]>(
        "/appointments?date=today&status=confirmed,pending_confirmation"
      );
      setTodaySchedule(data);
    } catch {
      // Non-critical; ignore errors
    }
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([loadStats(), loadRecentActivity(), loadTodaySchedule()]);
    setLoading(false);
  }, [loadStats, loadRecentActivity, loadTodaySchedule]);

  useEffect(() => {
    loadAll();

    const interval = setInterval(loadAll, 30_000);

    const handler = () => loadAll();
    const unsubAppointment = window.electron?.on("appointment:update", handler);
    const unsubConversation = window.electron?.on(
      "conversation:update",
      handler
    );

    return () => {
      clearInterval(interval);
      unsubAppointment?.();
      unsubConversation?.();
    };
  }, [loadAll]);

  return (
    <div className="p-6">
      <h2 className="mb-6 font-bold text-2xl text-foreground">
        {t("dashboard.heading")}
      </h2>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive text-sm">
          {t("dashboard.errorLoad")}: {error}
          <button className="ml-2 underline" onClick={() => loadAll()}>
            {t("dashboard.retry")}
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              className="animate-pulse rounded-lg border border-border bg-card p-4"
              key={i}
            >
              <div className="mb-2 flex items-center gap-3">
                <div className="h-6 w-6 rounded bg-muted" />
                <div className="h-4 w-28 rounded bg-muted" />
              </div>
              <div className="h-8 w-16 rounded bg-muted" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              icon={<Calendar className="text-primary" size={24} />}
              title={t("dashboard.todayAppointments")}
              value={stats.todayAppointments}
            />
            <StatCard
              icon={<MessageSquare className="text-emerald-500" size={24} />}
              title={t("dashboard.activeConversations")}
              value={stats.activeConversations}
            />
            <StatCard
              icon={<AlertTriangle className="text-amber-500" size={24} />}
              title={t("dashboard.needsAttention")}
              value={stats.needsAttention}
            />
            <StatCard
              icon={<Activity className="text-primary" size={24} />}
              title={t("dashboard.messagesToday")}
              value={stats.todayMessages}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold text-foreground text-lg">
            {t("dashboard.recentActivity")}
          </h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div className="flex animate-pulse items-start gap-3" key={i}>
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 w-40 rounded bg-muted" />
                    <div className="mt-1 h-3 w-24 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Inbox className="mb-2" size={32} />
              <p className="text-sm">{t("dashboard.noActivity")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <ActivityRow
                  item={item}
                  key={`${item.type}-${item.createdAt}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Today's Schedule */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-lg">
              {t("dashboard.todaySchedule")}
            </h3>
            <Link
              className="text-primary text-sm hover:text-primary/80"
              to="/dashboard/appointments"
            >
              {t("dashboard.viewAll")}
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div className="flex animate-pulse items-center gap-3" key={i}>
                  <div className="h-8 w-14 rounded bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 w-28 rounded bg-muted" />
                    <div className="mt-1 h-3 w-20 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : todaySchedule.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Calendar className="mb-2" size={32} />
              <p className="text-sm">{t("dashboard.noAppointments")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todaySchedule
                .sort(
                  (a, b) =>
                    new Date(a.startAt).getTime() -
                    new Date(b.startAt).getTime()
                )
                .map((appt) => {
                  const start = new Date(appt.startAt);
                  const time = start.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <div
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted"
                      key={appt.id}
                    >
                      <div className="w-14 flex-shrink-0 font-medium text-foreground text-sm">
                        {time}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground text-sm">
                          {appt.customerName ?? t("dashboard.unknown")}
                        </p>
                        <p className="truncate text-muted-foreground text-xs">
                          {appt.serviceName ?? t("dashboard.noService")}
                        </p>
                      </div>
                      <span
                        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs ${
                          appt.status === "confirmed"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {appt.status === "confirmed"
                          ? t("dashboard.confirmed")
                          : t("dashboard.pending")}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-3">
        {icon}
        <span className="text-muted-foreground text-sm">{title}</span>
      </div>
      <p className="font-bold text-2xl text-foreground">{value}</p>
    </div>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const { t } = useTranslation();

  if (item.type === "conversation") {
    return (
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
          <MessageSquare
            className="text-emerald-600 dark:text-emerald-400"
            size={14}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground text-sm">
            {t("dashboard.newConversationWith", {
              name: item.customerName ?? t("dashboard.unknown"),
            })}
          </p>
          <p className="text-muted-foreground text-xs">
            {formatRelativeTime(item.createdAt, t)}
          </p>
        </div>
      </div>
    );
  }

  if (item.type === "appointment_booked") {
    return (
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Calendar className="text-primary" size={14} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground text-sm">
            {t("dashboard.appointmentBookedFor", {
              date: item.date,
              time: item.time,
            })}
          </p>
          <p className="text-muted-foreground text-xs">
            {item.customerName ?? t("dashboard.unknown")}
          </p>
        </div>
      </div>
    );
  }

  // appointment_completed
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle className="text-primary" size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-foreground text-sm">
          {t("dashboard.appointmentCompletedWith", {
            name: item.customerName ?? t("dashboard.unknown"),
          })}
        </p>
        <p className="text-muted-foreground text-xs">
          {formatRelativeTime(item.createdAt, t)}
        </p>
      </div>
    </div>
  );
}

function formatRelativeTime(
  dateStr: string,
  t: (key: string, opts?: Record<string, unknown>) => string
): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) {
    return t("timeAgo.justNow");
  }
  if (diffMin < 60) {
    return t("timeAgo.minAgo", { count: diffMin });
  }
  if (diffHr < 24) {
    return t("timeAgo.hourAgo", { count: diffHr });
  }
  if (diffDay === 1) {
    return t("timeAgo.yesterday");
  }
  if (diffDay < 7) {
    return t("timeAgo.dayAgo", { count: diffDay });
  }
  return new Date(dateStr).toLocaleDateString();
}
