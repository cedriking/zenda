import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../../services/api-client'
import { MessageSquare, Calendar, AlertTriangle, Activity, Clock, UserPlus, CheckCircle, Inbox } from 'lucide-react'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

interface DashboardStats {
  todayAppointments: number
  activeConversations: number
  needsAttention: number
  todayMessages: number
}

interface RecentConversation {
  id: string
  customerName: string | null
  createdAt: string
}

interface RecentAppointment {
  id: string
  customerName: string | null
  serviceName: string | null
  status: string
  startAt: string
}

interface TodayAppointment {
  id: string
  customerName: string | null
  serviceName: string | null
  startAt: string
  endAt: string
  status: string
}

type ActivityItem =
  | { type: 'conversation'; customerName: string | null; createdAt: string }
  | { type: 'appointment_booked'; customerName: string | null; date: string; time: string; createdAt: string }
  | { type: 'appointment_completed'; customerName: string | null; createdAt: string }

function DashboardPage() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    activeConversations: 0,
    needsAttention: 0,
    todayMessages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [todaySchedule, setTodaySchedule] = useState<TodayAppointment[]>([])

  const loadStats = useCallback(async () => {
    try {
      setError(null)
      const result = await apiFetch<DashboardStats>('/analytics/dashboard-stats')
      setStats(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dashboard.errorLoad'))
    }
  }, [])

  const loadRecentActivity = useCallback(async () => {
    try {
      const [conversations, appointments] = await Promise.all([
        apiFetch<RecentConversation[]>('/conversations?limit=5'),
        apiFetch<RecentAppointment[]>('/appointments?limit=5&status=confirmed'),
      ])

      const items: ActivityItem[] = []

      for (const c of conversations) {
        items.push({ type: 'conversation', customerName: c.customerName, createdAt: c.createdAt })
      }

      for (const a of appointments) {
        if (a.status === 'completed') {
          items.push({ type: 'appointment_completed', customerName: a.customerName, createdAt: a.startAt })
        } else {
          const startDate = new Date(a.startAt)
          items.push({
            type: 'appointment_booked',
            customerName: a.customerName,
            date: startDate.toLocaleDateString(),
            time: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: a.startAt,
          })
        }
      }

      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setRecentActivity(items.slice(0, 8))
    } catch {
      // Activity feed is non-critical; ignore errors
    }
  }, [])

  const loadTodaySchedule = useCallback(async () => {
    try {
      const data = await apiFetch<TodayAppointment[]>('/appointments?date=today&status=confirmed,pending_confirmation')
      setTodaySchedule(data)
    } catch {
      // Non-critical; ignore errors
    }
  }, [])

  const loadAll = useCallback(async () => {
    await Promise.all([loadStats(), loadRecentActivity(), loadTodaySchedule()])
    setLoading(false)
  }, [loadStats, loadRecentActivity, loadTodaySchedule])

  useEffect(() => {
    loadAll()

    const interval = setInterval(loadAll, 30000)

    const handler = () => loadAll()
    const unsubAppointment = window.electron?.on('appointment:update', handler)
    const unsubConversation = window.electron?.on('conversation:update', handler)

    return () => {
      clearInterval(interval)
      unsubAppointment?.()
      unsubConversation?.()
    }
  }, [loadAll])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">{t('dashboard.heading')}</h2>

      {error && (
        <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {t('dashboard.errorLoad')}: {error}
          <button onClick={() => loadAll()} className="ml-2 underline">{t('dashboard.retry')}</button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 bg-muted rounded" />
                <div className="h-4 w-28 bg-muted rounded" />
              </div>
              <div className="h-8 w-16 bg-muted rounded" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              icon={<Calendar className="text-primary" size={24} />}
              title={t('dashboard.todayAppointments')}
              value={stats.todayAppointments}
            />
            <StatCard
              icon={<MessageSquare className="text-emerald-500" size={24} />}
              title={t('dashboard.activeConversations')}
              value={stats.activeConversations}
            />
            <StatCard
              icon={<AlertTriangle className="text-amber-500" size={24} />}
              title={t('dashboard.needsAttention')}
              value={stats.needsAttention}
            />
            <StatCard
              icon={<Activity className="text-primary" size={24} />}
              title={t('dashboard.messagesToday')}
              value={stats.todayMessages}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('dashboard.recentActivity')}</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-muted rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-40 bg-muted rounded" />
                    <div className="h-3 w-24 bg-muted rounded mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Inbox size={32} className="mb-2" />
              <p className="text-sm">{t('dashboard.noActivity')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <ActivityRow key={i} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Today's Schedule */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">{t('dashboard.todaySchedule')}</h3>
            <Link
              to="/dashboard/appointments"
              className="text-sm text-primary hover:text-primary/80"
            >
              {t('dashboard.viewAll')}
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-14 h-8 bg-muted rounded" />
                  <div className="flex-1">
                    <div className="h-4 w-28 bg-muted rounded" />
                    <div className="h-3 w-20 bg-muted rounded mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : todaySchedule.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Calendar size={32} className="mb-2" />
              <p className="text-sm">{t('dashboard.noAppointments')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todaySchedule
                .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
                .map((appt) => {
                  const start = new Date(appt.startAt)
                  const time = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  return (
                    <div
                      key={appt.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
                    >
                      <div className="text-sm font-medium text-foreground w-14 flex-shrink-0">{time}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {appt.customerName ?? t('dashboard.unknown')}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {appt.serviceName ?? t('dashboard.noService')}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                        appt.status === 'confirmed'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {appt.status === 'confirmed' ? t('dashboard.confirmed') : t('dashboard.pending')}
                      </span>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: number }) {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  )
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const { t } = useTranslation()

  if (item.type === 'conversation') {
    return (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0">
          <MessageSquare size={14} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground">
            {t('dashboard.newConversationWith', { name: item.customerName ?? t('dashboard.unknown') })}
          </p>
          <p className="text-xs text-muted-foreground">{formatRelativeTime(item.createdAt, t)}</p>
        </div>
      </div>
    )
  }

  if (item.type === 'appointment_booked') {
    return (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <Calendar size={14} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground">
            {t('dashboard.appointmentBookedFor', { date: item.date, time: item.time })}
          </p>
          <p className="text-xs text-muted-foreground">{item.customerName ?? t('dashboard.unknown')}</p>
        </div>
      </div>
    )
  }

  // appointment_completed
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
        <CheckCircle size={14} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          {t('dashboard.appointmentCompletedWith', { name: item.customerName ?? t('dashboard.unknown') })}
        </p>
        <p className="text-xs text-muted-foreground">{formatRelativeTime(item.createdAt, t)}</p>
      </div>
    </div>
  )
}

function formatRelativeTime(dateStr: string, t: (key: string, opts?: Record<string, unknown>) => string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return t('timeAgo.justNow')
  if (diffMin < 60) return t('timeAgo.minAgo', { count: diffMin })
  if (diffHr < 24) return t('timeAgo.hourAgo', { count: diffHr })
  if (diffDay === 1) return t('timeAgo.yesterday')
  if (diffDay < 7) return t('timeAgo.dayAgo', { count: diffDay })
  return new Date(dateStr).toLocaleDateString()
}
