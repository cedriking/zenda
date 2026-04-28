import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { apiFetch } from '../../services/api-client'
import { MessageSquare, Calendar, AlertTriangle, Activity } from 'lucide-react'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

interface DashboardStats {
  todayAppointments: number
  activeConversations: number
  needsAttention: number
  todayMessages: number
}

function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    activeConversations: 0,
    needsAttention: 0,
    todayMessages: 0,
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setError(null)
        const [convs, appts, msgStats] = await Promise.all([
          apiFetch<any[]>('/conversations'),
          apiFetch<any[]>('/appointments'),
          apiFetch<{ todayCount: number }>('/analytics/messages-today').catch(() => null),
        ])
        setStats({
          todayAppointments: appts.filter(a => {
            const today = new Date().toISOString().split('T')[0]
            return a.startAt?.startsWith(today) && !['cancelled', 'completed', 'no_show'].includes(a.status)
          }).length,
          activeConversations: convs.filter(c => c.mode === 'auto').length,
          needsAttention: convs.filter(c => c.mode === 'needs_attention' || c.mode === 'human_takeover').length,
          todayMessages: msgStats?.todayCount ?? 0,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      }
    }
    load()
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          Failed to load dashboard data: {error}
          <button onClick={() => window.location.reload()} className="ml-2 underline">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <p className="text-gray-500">Activity feed will appear here as conversations come in.</p>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm text-gray-500">{title}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
