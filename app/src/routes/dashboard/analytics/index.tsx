import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  Clock,
  MessageSquare,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiFetch } from "../../../services/api-client";

interface AnalyticsData {
  ai: { providerBreakdown: Record<string, number>; totalTokens: number };
  appointments: {
    total: number;
    byDay: Array<{ date: string; count: number }>;
    noShowRate: number;
  };
  conversations: {
    total: number;
    byDay: Array<{ date: string; count: number }>;
  };
  escalations: { total: number; rate: number };
  messages: { total: number; avgResponseTimeMs: number };
}

const PIE_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-1 flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="font-bold text-2xl">{value}</div>
      {sub && <div className="mt-1 text-muted-foreground text-xs">{sub}</div>}
    </div>
  );
}

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<number>(7);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFetch<AnalyticsData>(
        `/analytics?period=${period}`
      );
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading && !data) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 animate-pulse rounded bg-muted" />
          <div className="h-9 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              className="h-24 animate-pulse rounded-xl bg-muted"
              key={`skel-${i}`}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-xl bg-muted" />
          <div className="h-72 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="font-medium text-red-800 text-sm">
              Failed to load analytics
            </p>
            <p className="mt-1 text-red-600 text-xs">{error}</p>
          </div>
          <button
            className="ml-auto font-medium text-red-700 text-sm underline hover:text-red-900"
            onClick={loadAnalytics}
            type="button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const convByDay = data.conversations.byDay.slice(-period);
  const apptByDay = data.appointments.byDay.slice(-period);

  const providerData = Object.entries(data.ai.providerBreakdown).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTokens = (n: number) => {
    if (n >= 1_000_000) {
      return `${(n / 1_000_000).toFixed(1)}M`;
    }
    if (n >= 1000) {
      return `${(n / 1000).toFixed(1)}K`;
    }
    return String(n);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 font-semibold text-xl">
          <BarChart3 className="h-5 w-5" />
          {t("analytics.title", "Analytics")}
        </h1>
        <select
          className="rounded-lg border bg-background px-3 py-2 text-sm"
          onChange={(e) => setPeriod(Number(e.target.value))}
          value={period}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <MetricCard
          icon={MessageSquare}
          label={t("analytics.metrics.conversations", "Conversations")}
          sub={`${convByDay.length} days tracked`}
          value={data.conversations.total}
        />
        <MetricCard
          icon={Calendar}
          label={t("analytics.metrics.appointments", "Appointments")}
          sub={`No-show rate: ${(data.appointments.noShowRate * 100).toFixed(1)}%`}
          value={data.appointments.total}
        />
        <MetricCard
          icon={BarChart3}
          label={t("analytics.metrics.messages", "Messages")}
          sub={`Avg response: ${formatResponseTime(data.messages.avgResponseTimeMs)}`}
          value={data.messages.total}
        />
        <MetricCard
          icon={AlertTriangle}
          label={t("analytics.metrics.escalations", "Escalations")}
          sub={`Rate: ${(data.escalations.rate * 100).toFixed(1)}%`}
          value={data.escalations.total}
        />
        <MetricCard
          icon={Zap}
          label="AI Tokens"
          sub={`${providerData.length} provider(s)`}
          value={formatTokens(data.ai.totalTokens)}
        />
        <MetricCard
          icon={Clock}
          label={t("analytics.metrics.avgResponseTime", "Avg Response")}
          value={formatResponseTime(data.messages.avgResponseTimeMs)}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Conversations chart */}
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="mb-4 font-medium text-sm">
            {t("analytics.charts.conversationsPerDay", "Conversations per day")}
          </h2>
          {convByDay.length > 0 ? (
            <ResponsiveContainer height={260} width="100%">
              <AreaChart data={convByDay}>
                <CartesianGrid className="stroke-muted" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(d: string) => {
                    const date = new Date(d);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => [Number(value), "Conversations"]}
                  labelFormatter={(d) =>
                    new Date(String(d)).toLocaleDateString()
                  }
                />
                <Area
                  dataKey="count"
                  fill="#6366f1"
                  fillOpacity={0.15}
                  stroke="#6366f1"
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[260px] items-center justify-center text-muted-foreground text-sm">
              No conversation data for this period
            </div>
          )}
        </div>

        {/* Appointments chart */}
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="mb-4 font-medium text-sm">
            {t("analytics.charts.appointmentsPerDay", "Appointments per day")}
          </h2>
          {apptByDay.length > 0 ? (
            <ResponsiveContainer height={260} width="100%">
              <BarChart data={apptByDay}>
                <CartesianGrid className="stroke-muted" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(d: string) => {
                    const date = new Date(d);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => [Number(value), "Appointments"]}
                  labelFormatter={(d) =>
                    new Date(String(d)).toLocaleDateString()
                  }
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[260px] items-center justify-center text-muted-foreground text-sm">
              No appointment data for this period
            </div>
          )}
        </div>
      </div>

      {/* AI Provider breakdown */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <h2 className="mb-4 font-medium text-sm">
          {t("analytics.charts.aiProviderUsage", "AI Provider Usage")}
        </h2>
        {providerData.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ResponsiveContainer height={220} width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={providerData}
                  dataKey="value"
                  innerRadius={50}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {providerData.map((entry, index) => (
                    <Cell
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                      key={`cell-${entry.name}`}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatTokens(Number(value)), "Tokens"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col justify-center gap-3">
              {providerData.map((provider, i) => {
                const total = providerData.reduce((s, p) => s + p.value, 0);
                const pct = total > 0 ? (provider.value / total) * 100 : 0;
                return (
                  <div className="space-y-1" key={provider.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{
                            backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        />
                        {provider.name}
                      </span>
                      <span className="text-muted-foreground">
                        {formatTokens(provider.value)} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex h-[220px] items-center justify-center text-muted-foreground text-sm">
            No AI provider usage data yet
          </div>
        )}
      </div>
    </div>
  );
}
