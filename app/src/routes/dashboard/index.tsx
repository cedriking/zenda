import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState, useCallback } from 'react'
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
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Dashboard</h2>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
          Failed to load dashboard data: {error}
          <button onClick={() => loadAll()} className="ml-2 underline">Retry</button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              icon={<Calendar className="text-blue-500" size={24} />}
              title="Today's Appointments"
              value={stats.todayAppointments}
            />
            <StatCard
              icon={<MessageSquare className="text-green-500" size={24} />}
              title="Active Conversations"
              value={stats.activeConversations}
            />
            <StatCard
              icon={<AlertTriangle className="text-orange-500" size={24} />}
              title="Needs Attention"
              value={stats.needsAttention}
            />
            <StatCard
              icon={<Activity className="text-purple-500" size={24} />}
              title="Messages Today"
              value={stats.todayMessages}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-24 bg-gray-100 dark:bg-gray-600 rounded mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
              <Inbox size={32} className="mb-2" />
              <p className="text-sm">No activity yet</p>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Today's Schedule</h3>
            <Link
              to="/dashboard/appointments"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              View all
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-14 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="flex-1">
                    <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-20 bg-gray-100 dark:bg-gray-600 rounded mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : todaySchedule.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
              <Calendar size={32} className="mb-2" />
              <p className="text-sm">No appointments today</p>
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
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 w-14 flex-shrink-0">{time}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {appt.customerName ?? 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {appt.serviceName ?? 'No service'}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                        appt.status === 'confirmed'
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {appt.status === 'confirmed' ? 'Confirmed' : 'Pending'}
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
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  )
}

function ActivityRow({ item }: { item: ActivityItem }) {
  if (item.type === 'conversation') {
    return (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
          <MessageSquare size={14} className="text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 dark:text-gray-100">
            New conversation with <span className="font-medium">{item.customerName ?? 'Unknown'}</span>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{formatRelativeTime(item.createdAt)}</p>
        </div>
      </div>
    )
  }

  if (item.type === 'appointment_booked') {
    return (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
          <Calendar size={14} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 dark:text-gray-100">
            Appointment booked for <span className="font-medium">{item.date}</span> at <span className="font-medium">{item.time}</span>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{item.customerName ?? 'Unknown'}</p>
        </div>
      </div>
    )
  }

  // appointment_completed
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
        <CheckCircle size={14} className="text-purple-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-gray-100">
          Appointment completed with <span className="font-medium">{item.customerName ?? 'Unknown'}</span>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{formatRelativeTime(item.createdAt)}</p>
      </div>
    </div>
  )
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return new Date(dateStr).toLocaleDateString()
}
