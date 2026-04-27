import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useWhatsApp } from '../../hooks/use-whatsapp'
import { useAuthStore } from '../../stores/auth'
import { useEffect } from 'react'
import { QrCode, Loader2, CheckCircle, XCircle } from 'lucide-react'

export const Route = createFileRoute('/auth/connect-whatsapp')({
  component: ConnectWhatsAppPage,
})

function ConnectWhatsAppPage() {
  const { status, initWhatsApp, connectBridge, isConnected, needsQR } = useWhatsApp()
  const { workspace, accessToken } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    initWhatsApp()
  }, [initWhatsApp])

  useEffect(() => {
    if (isConnected && workspace?.id && accessToken) {
      connectBridge(workspace.id, accessToken)
    }
  }, [isConnected, workspace?.id, accessToken, connectBridge])

  useEffect(() => {
    if (isConnected) {
      const timer = setTimeout(() => navigate({ to: '/dashboard' }), 1500)
      return () => clearTimeout(timer)
    }
  }, [isConnected, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect WhatsApp</h1>
        <p className="text-gray-500 mb-8">Link your WhatsApp Business to start receiving messages</p>

        {status.status === 'connecting' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-blue-500 animate-spin" />
            <p className="text-gray-600">Initializing WhatsApp...</p>
          </div>
        )}

        {needsQR && (
          <div className="flex flex-col items-center gap-4">
            <QrCode size={200} className="text-gray-300" />
            <p className="text-gray-600">Scan the QR code with your WhatsApp</p>
            <p className="text-sm text-gray-400">Open WhatsApp {'>'} Settings {'>'} Linked Devices {'>'} Link a Device</p>
          </div>
        )}

        {isConnected && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle size={48} className="text-green-500" />
            <p className="text-green-600 font-medium">Connected!</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        )}

        {status.status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <XCircle size={48} className="text-red-500" />
            <p className="text-red-600">{status.error ?? 'Connection failed'}</p>
            <button
              onClick={initWhatsApp}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        )}

        {status.status === 'disconnected' && (
          <button
            onClick={initWhatsApp}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-lg"
          >
            Connect WhatsApp
          </button>
        )}
      </div>
    </div>
  )
}
