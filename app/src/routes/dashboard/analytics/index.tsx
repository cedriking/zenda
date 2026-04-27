import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { apiFetch } from '../../../services/api-client'
import { BarChart3, MessageSquare, Calendar, AlertTriangle, Zap, Clock } from 'lucide-react'

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

function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [period, setPeriod] = useState('30')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  async function loadAnalytics() {
    setLoading(true)
    try {
      const result = await apiFetch<AnalyticsData>(`/analytics?period=${period}`)
      setData(result as any)
    } catch { /* silent */ }
    setLoading(false)
  }

  if (loading && !data) {
    return <div className="p-6 text-gray-500">Loading analytics...</div>
  }

  if (!data) {
    return <div className="p-6 text-gray-500">No data available</div>
  }

  const cards = [
    { label: 'Conversations', value: data.conversations.total, icon: <MessageSquare size={20} />, color: 'blue' },
    { label: 'Appointments', value: data.appointments.total, icon: <Calendar size={20} />, color: 'green' },
    { label: 'Messages', value: data.messages.total, icon: <Zap size={20} />, color: 'purple' },
    { label: 'Escalations', value: data.escalations.total, icon: <AlertTriangle size={20} />, color: 'orange' },
    { label: 'No-Show Rate', value: `${(data.appointments.noShowRate * 100).toFixed(1)}%`, icon: <Clock size={20} />, color: 'red' },
    { label: 'AI Tokens', value: data.ai.totalTokens.toLocaleString(), icon: <BarChart3 size={20} />, color: 'indigo' },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 size={24} />
          Analytics
        </h2>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{card.label}</span>
              <span className={`text-${card.color}-500`}>{card.icon}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Conversations chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Conversations per Day</h3>
        <div className="h-48 flex items-end gap-1">
          {data.conversations.byDay.slice(-14).map((d, idx) => {
            const max = Math.max(...data.conversations.byDay.map(x => x.count), 1)
            const height = (d.count / max) * 100
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${Math.max(height, 2)}%` }}
                  title={`${d.date}: ${d.count}`}
                />
                <span className="text-[9px] text-gray-400">
                  {d.date.slice(5)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Appointments chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Appointments per Day</h3>
        <div className="h-48 flex items-end gap-1">
          {data.appointments.byDay.slice(-14).map((d, idx) => {
            const max = Math.max(...data.appointments.byDay.map(x => x.count), 1)
            const height = (d.count / max) * 100
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-green-500 rounded-t"
                  style={{ height: `${Math.max(height, 2)}%` }}
                  title={`${d.date}: ${d.count}`}
                />
                <span className="text-[9px] text-gray-400">
                  {d.date.slice(5)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Provider breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
        <h3 className="font-semibold text-gray-900 mb-4">AI Provider Usage</h3>
        <div className="space-y-3">
          {Object.entries(data.ai.providerBreakdown).map(([provider, count]) => {
            const total = Object.values(data.ai.providerBreakdown).reduce((a, b) => a + b, 0)
            const pct = total > 0 ? (count / total) * 100 : 0
            return (
              <div key={provider}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{provider}</span>
                  <span className="text-gray-500">{count} calls ({pct.toFixed(0)}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
          {Object.keys(data.ai.providerBreakdown).length === 0 && (
            <p className="text-sm text-gray-400">No AI usage data yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
