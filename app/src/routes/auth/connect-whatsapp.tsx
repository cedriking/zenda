import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useWhatsApp } from '../../hooks/use-whatsapp'
import { useAuthStore } from '../../stores/auth'
import { useEffect, useRef } from 'react'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { apiFetch } from '../../services/api-client'

export const Route = createFileRoute('/auth/connect-whatsapp')({
  component: ConnectWhatsAppPage,
})

function ConnectWhatsAppPage() {
  const { status, initWhatsApp, connectBridge, isConnected, needsQR } = useWhatsApp()
  const { workspace, accessToken } = useAuthStore()
  const navigate = useNavigate()
  const initCalled = useRef(false)

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
      // Advance onboarding step from 'not_started' to 'whatsapp_connected'
      apiFetch('/onboarding/advance', {
        method: 'POST',
        body: { completedStep: 'not_started' },
      }).catch(() => {
        // Non-critical — onboarding page handles step transitions too
      })
    }
  }, [isConnected, workspace?.id, accessToken, connectBridge])

  useEffect(() => {
    if (isConnected) {
      const timer = setTimeout(() => navigate({ to: '/onboarding' }), 1500)
      return () => clearTimeout(timer)
    }
  }, [isConnected, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="bg-card rounded-xl shadow-sm border border-border p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Connect WhatsApp</h1>
        <p className="text-muted-foreground mb-8">Link your WhatsApp Business to start receiving messages</p>

        {status.status === 'connecting' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-primary animate-spin" />
            <p className="text-muted-foreground">Initializing WhatsApp...</p>
          </div>
        )}

        {needsQR && (
          <div className="flex flex-col items-center gap-4">
            {status.qrData ? (
              <img src={status.qrData} alt="WhatsApp QR Code" className="w-[280px] h-[280px]" />
            ) : (
              <Loader2 size={200} className="text-muted-foreground animate-spin" />
            )}
            <p className="text-muted-foreground">Scan the QR code with your WhatsApp</p>
            <p className="text-sm text-muted-foreground">Open WhatsApp {'>'} Settings {'>'} Linked Devices {'>'} Link a Device</p>
          </div>
        )}

        {isConnected && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle size={48} className="text-emerald-500" />
            <p className="text-emerald-600 font-medium">Connected!</p>
            <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
          </div>
        )}

        {status.status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <XCircle size={48} className="text-destructive" />
            <p className="text-destructive">{status.error ?? 'Connection failed'}</p>
            <button
              onClick={initWhatsApp}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        )}

        {status.status === 'disconnected' && (
          <button
            onClick={initWhatsApp}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-lg"
          >
            Connect WhatsApp
          </button>
        )}
      </div>
    </div>
  )
}
