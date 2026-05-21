import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../services/api-client'
import { WifiOff, RefreshCw } from 'lucide-react'

export function ConnectivityBanner() {
  const { t } = useTranslation()
  const [isOffline, setIsOffline] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    // Check API reachability periodically
    const interval = setInterval(async () => {
      try {
        await apiFetch('/health', { method: 'GET' })
        setIsOffline(false)
      } catch {
        setIsOffline(true)
      }
    }, 15_000)

    // Also listen for browser offline/online events
    const handleOffline = () => setIsOffline(true)
    const handleOnline = () => checkConnection()

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  async function checkConnection() {
    setIsRetrying(true)
    try {
      await apiFetch('/health', { method: 'GET' })
      setIsOffline(false)
    } catch {
      // Still offline
    } finally {
      setIsRetrying(false)
    }
  }

  if (!isOffline) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-3 text-sm text-amber-800" role="alert">
      <WifiOff size={16} />
      <span>{isRetrying ? t('connectivity.reconnecting') : t('connectivity.connectionLost')}</span>
      <button
        onClick={checkConnection}
        disabled={isRetrying}
        className="flex items-center gap-1 px-2 py-0.5 text-xs bg-amber-200 rounded hover:bg-amber-300 transition disabled:opacity-50"
        aria-label={t('connectivity.retry')}
      >
        <RefreshCw size={12} className={isRetrying ? 'animate-spin' : ''} />
        {t('connectivity.retry')}
      </button>
    </div>
  )
}
