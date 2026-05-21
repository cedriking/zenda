import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../services/api-client'
import { WifiOff, Send, Eye, Trash2, RefreshCw } from 'lucide-react'

interface QueueStats {
  retryQueue: { pending: number; oldest: number }
  offlineQueue: { total: number; safe: number; unsafe: number }
}

export function OfflineQueueBanner() {
  const { t } = useTranslation()
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
          {t('offlineQueue.queuedMessages', { count: stats.offlineQueue.total })}
        </button>
      ) : (
        <div className="bg-white border border-amber-300 rounded-lg shadow-xl p-4 w-80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-amber-800">{t('offlineQueue.title')}</h3>
            <button onClick={() => setShowPanel(false)} className="text-amber-600 hover:text-amber-800 text-lg leading-none">&times;</button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('offlineQueue.messagesWaiting', { count: stats.offlineQueue.total })}</span>
            </div>

            {stats.retryQueue.pending > 0 && (
              <div className="flex items-center gap-2 text-amber-600">
                <RefreshCw size={14} className="animate-spin" />
                {t('offlineQueue.retrying')} ({stats.retryQueue.pending})
              </div>
            )}

            <div className="flex gap-2 text-xs pt-1">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">{t('offlineQueue.readyToSend')}: {stats.offlineQueue.safe}</span>
              {stats.offlineQueue.unsafe > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">{t('offlineQueue.drafts')}: {stats.offlineQueue.unsafe}</span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={flushQueue}
              disabled={sending}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded text-sm hover:bg-amber-600 disabled:opacity-50"
            >
              <Send size={14} />
              {sending ? t('offlineQueue.sending') : t('offlineQueue.sendAll')}
            </button>
            {stats.offlineQueue.unsafe > 0 && (
              <button
                onClick={clearQueue}
                className="flex items-center gap-1 px-3 py-1.5 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50"
              >
                <Trash2 size={14} />
                {t('offlineQueue.clear')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
