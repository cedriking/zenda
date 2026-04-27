import { useState, useEffect } from 'react'
import { apiFetch } from '../../services/api-client'
import { WifiOff, Send, Eye, Trash2, RefreshCw } from 'lucide-react'

interface QueueStats {
  retryQueue: { pending: number; oldest: number }
  offlineQueue: { total: number; safe: number; unsafe: number }
}

export function OfflineQueueBanner() {
  const [stats, setStats] = useState<QueueStats | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const check = async () => {
      try {
        const data = await apiFetch<QueueStats>('/queue')
        setStats(data as any)
        if ((data as any).offlineQueue?.total > 0) {
          setShowPanel(true)
        }
      } catch { /* offline */ }
    }
    check()
    const interval = setInterval(check, 15_000)
    return () => clearInterval(interval)
  }, [])

  if (!stats || stats.offlineQueue.total === 0) return null

  const flushQueue = async () => {
    setSending(true)
    try {
      await apiFetch('/queue/flush', { method: 'POST' })
      setStats(null)
      setShowPanel(false)
    } catch { /* */ }
    setSending(false)
  }

  const clearQueue = async () => {
    try {
      await apiFetch('/queue?type=unsafe', { method: 'DELETE' })
      setStats({ ...stats, offlineQueue: { total: stats.offlineQueue.safe, safe: stats.offlineQueue.safe, unsafe: 0 } })
    } catch { /* */ }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!showPanel ? (
        <button
          onClick={() => setShowPanel(true)}
          className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-amber-600"
        >
          <WifiOff size={16} />
          {stats.offlineQueue.total} queued messages
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <WifiOff size={16} className="text-amber-500" />
                Offline Queue
              </h3>
              <button onClick={() => setShowPanel(false)} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.offlineQueue.total} messages waiting to be sent
            </p>
          </div>

          <div className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ready to send</span>
              <span className="font-medium">{stats.offlineQueue.unsafe}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Drafts</span>
              <span className="font-medium">{stats.offlineQueue.safe}</span>
            </div>
            {stats.retryQueue.pending > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Retrying</span>
                <span className="font-medium text-amber-600">{stats.retryQueue.pending}</span>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 flex gap-2">
            <button
              onClick={flushQueue}
              disabled={sending}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              <Send size={14} />
              {sending ? 'Sending...' : 'Send All'}
            </button>
            <button
              onClick={clearQueue}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              <Trash2 size={14} />
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
