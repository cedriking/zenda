import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useWhatsApp } from '../../hooks/use-whatsapp'
import { useAuthStore } from '../../stores/auth'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { apiFetch } from '../../services/api-client'

export const Route = createFileRoute('/auth/connect-whatsapp')({
  component: ConnectWhatsAppPage,
})

function ConnectWhatsAppPage() {
  const { status, initWhatsApp, connectBridge, isConnected, needsQR } = useWhatsApp()
  const { workspace, accessToken, updateWorkspace } = useAuthStore()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const initCalled = useRef(false)

  // Detect reconnection mode (workspace already onboarded, just reconnecting WhatsApp)
  const isReconnect = workspace?.onboardingStep === 'ready'

  useEffect(() => {
    // Prevent double-init in React StrictMode
    if (!initCalled.current) {
      initCalled.current = true
      initWhatsApp()
    }
  }, [initWhatsApp])

  useEffect(() => {
    if (isConnected && workspace?.id && accessToken) {
      connectBridge(workspace.id, accessToken)
      if (!isReconnect) {
        // Advance onboarding step from 'not_started' to 'whatsapp_connected'
        apiFetch('/onboarding/advance', {
          method: 'POST',
          body: { completedStep: 'not_started' },
        }).then(() => {
          updateWorkspace({ onboardingStep: 'whatsapp_connected' })
        }).catch(() => {
          // Non-critical — onboarding page handles step transitions too
        })
      }
    }
  }, [isConnected, workspace?.id, accessToken, connectBridge, isReconnect])

  useEffect(() => {
    if (isConnected) {
      const dest = isReconnect ? '/dashboard' : '/onboarding'
      const timer = setTimeout(() => navigate({ to: dest }), 1500)
      return () => clearTimeout(timer)
    }
  }, [isConnected, navigate, isReconnect])

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="bg-card rounded-xl shadow-sm border border-border p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('whatsapp.connectTitle')}</h1>
        <p className="text-muted-foreground mb-8">{t('whatsapp.connectSubtitle')}</p>

        {status.status === 'connecting' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-primary animate-spin" />
            <p className="text-muted-foreground">{t('whatsapp.initializing')}</p>
          </div>
        )}

        {needsQR && (
          <div className="flex flex-col items-center gap-4">
            {status.qrData ? (
              <img src={status.qrData} alt="WhatsApp QR Code" className="w-[280px] h-[280px]" />
            ) : (
              <Loader2 size={200} className="text-muted-foreground animate-spin" />
            )}
            <p className="text-muted-foreground">{t('whatsapp.scanTheQr')}</p>
            <p className="text-sm text-muted-foreground">{t('whatsapp.scanQrInstruction')}</p>
          </div>
        )}

        {isConnected && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle size={48} className="text-emerald-500" />
            <p className="text-emerald-600 font-medium">{t('whatsapp.connectedSuccess')}</p>
            <p className="text-sm text-muted-foreground">{t('whatsapp.redirecting')}</p>
          </div>
        )}

        {status.status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <XCircle size={48} className="text-destructive" />
            <p className="text-destructive">{status.error ?? t('whatsapp.connectionFailed')}</p>
            <button
              onClick={initWhatsApp}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              {t('whatsapp.tryAgain')}
            </button>
          </div>
        )}

        {status.status === 'disconnected' && (
          <button
            onClick={initWhatsApp}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-lg"
          >
            {t('whatsapp.connect')}
          </button>
        )}
      </div>
    </div>
  )
}
