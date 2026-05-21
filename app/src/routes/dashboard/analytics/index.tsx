import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../../../services/api-client'
import { BarChart3, MessageSquare, Calendar, AlertTriangle, Zap, Clock, AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/dashboard/analytics/')({
  component: AnalyticsPage,
})

interface AnalyticsData {
  conversations: { total: number; byDay: Array<{ date: string; count: number }> }
  appointments: { total: number; byDay: Array<{ date: string; count: number }>; noShowRate: number }
  messages: { total: number; avgResponseTimeMs: number }
  escalations: { total: number; rate: number }
  ai: { providerBreakdown: Record<string, number>; totalTokens: number }
}

function SimpleBarChart({ data, color }: { data: Array<{ date: string; count: number }>; color: 'blue' | 'green' }) {
  const max = useMemo(() => Math.max(...data.map(x => x.count), 1), [data])
  const yTicks = useMemo(() => {
    const m = Math.max(...data.map(x => x.count), 1)
    return [0, Math.round(m / 2), m]
  }, [data])

  return (
    <div className="flex h-48 gap-2">
      {/* Y-axis labels */}
      <div className="flex flex-col justify-between text-right pr-1 py-0.5 shrink-0 w-8">
        {yTicks.map((tick, i) => (
          <span key={i} className="text-[10px] text-muted-foreground/50 leading-none">
            {tick}
          </span>
        ))}
      </div>
      {/* Bars */}
      <div className="flex-1 flex items-end gap-1">
        {data.map((d, idx) => {
          const height = (d.count / max) * 100
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-t transition-all duration-150 cursor-default ${
                  color === 'blue'
                    ? 'bg-primary hover:bg-primary/80'
                    : 'bg-emerald-500 hover:bg-emerald-400'
                }`}
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`${d.date}: ${d.count}`}
              />
              <span className="text-[9px] text-muted-foreground/50">
                {d.date.slice(5)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AnalyticsPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [period, setPeriod] = useState('30')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  async function loadAnalytics() {
    setLoading(true)
    setError(null)
    try {
      const result = await apiFetch<AnalyticsData>(`/analytics?period=${period}`)
      setData(result as any)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('analytics.errorLoad'))
    } finally {
      setLoading(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 size={24} />
            {t('analytics.heading')}
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-5 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-4 w-4 bg-muted rounded" />
              </div>
              <div className="h-6 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
          <BarChart3 size={24} />
          {t('analytics.heading')}
        </h2>
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-6 text-center">
          <AlertCircle size={32} className="mx-auto mb-3 text-destructive" />
          <p className="text-destructive mb-2">{t('analytics.errorLoad')}</p>
          <p className="text-sm text-destructive mb-4">{error}</p>
          <button onClick={loadAnalytics} className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 text-sm">
            {t('analytics.tryAgain')}
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const cards = [
    { label: t('analytics.cardConversations'), value: data.conversations.total, icon: <MessageSquare size={20} />, iconClass: 'text-primary' },
    { label: t('analytics.cardAppointments'), value: data.appointments.total, icon: <Calendar size={20} />, iconClass: 'text-emerald-500' },
    { label: t('analytics.cardMessages'), value: data.messages.total, icon: <Zap size={20} />, iconClass: 'text-primary' },
    { label: t('analytics.cardEscalations'), value: data.escalations.total, icon: <AlertTriangle size={20} />, iconClass: 'text-amber-500' },
    { label: t('analytics.cardNoShowRate'), value: `${(data.appointments.noShowRate * 100).toFixed(1)}%`, icon: <Clock size={20} />, iconClass: 'text-destructive' },
    { label: t('analytics.cardAiTokens'), value: data.ai.totalTokens.toLocaleString(), icon: <BarChart3 size={20} />, iconClass: 'text-primary' },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 size={24} />
          {t('analytics.heading')}
        </h2>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground"
        >
          <option value="7">{t('analytics.period7')}</option>
          <option value="30">{t('analytics.period30')}</option>
          <option value="90">{t('analytics.period90')}</option>
        </select>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-card rounded-lg border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <span className={card.iconClass}>{card.icon}</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Conversations chart */}
      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <h3 className="font-semibold text-foreground mb-4">{t('analytics.chartConversations')}</h3>
        {data.conversations.byDay.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground/50 text-sm">
            <BarChart3 size={32} className="mr-2 opacity-50" />
            {t('analytics.noConversationData')}
          </div>
        ) : (
          <SimpleBarChart data={data.conversations.byDay.slice(-14)} color="blue" />
        )}
      </div>

      {/* Appointments chart */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4">{t('analytics.chartAppointments')}</h3>
        {data.appointments.byDay.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground/50 text-sm">
            <BarChart3 size={32} className="mr-2 opacity-50" />
            {t('analytics.noAppointmentData')}
          </div>
        ) : (
          <SimpleBarChart data={data.appointments.byDay.slice(-14)} color="green" />
        )}
      </div>

      {/* AI Provider breakdown */}
      <div className="bg-card rounded-lg border border-border p-6 mt-6">
        <h3 className="font-semibold text-foreground mb-4">{t('analytics.chartAiProvider')}</h3>
        <div className="space-y-3">
          {Object.entries(data.ai.providerBreakdown).map(([provider, count]) => {
            const total = Object.values(data.ai.providerBreakdown).reduce((a, b) => a + b, 0)
            const pct = total > 0 ? (count / total) * 100 : 0
            return (
              <div key={provider}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{provider}</span>
                  <span className="text-muted-foreground">{count} {t('analytics.providerCalls')} ({pct.toFixed(0)}%)</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full">
                  <div className="h-2 bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
          {Object.keys(data.ai.providerBreakdown).length === 0 && (
            <p className="text-sm text-muted-foreground/50">{t('analytics.noAiUsage')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
