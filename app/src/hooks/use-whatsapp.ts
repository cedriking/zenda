import { useState, useEffect, useCallback } from 'react'

interface WhatsAppStatus {
  status: 'disconnected' | 'connecting' | 'qr_required' | 'connected' | 'error'
  phoneNumber?: string
  qrData?: string
  error?: string
}

interface BridgeStatus {
  connected: boolean
  error?: string
}

export function useWhatsApp() {
  const [waStatus, setWaStatus] = useState<WhatsAppStatus>({ status: 'disconnected' })
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>({ connected: false })

  useEffect(() => {
    // Listen for WhatsApp status updates from main process
    const unsubStatus = window.electron?.on?.('whatsapp:status', (status: WhatsAppStatus) => {
      setWaStatus(status)
    })

    const unsubBridge = window.electron?.on?.('bridge:status', (status: BridgeStatus) => {
      setBridgeStatus(status)
    })

    return () => {
      unsubStatus?.()
      unsubBridge?.()
    }
  }, [])

  const initWhatsApp = useCallback(async () => {
    await window.electron?.invoke?.('whatsapp:init')
  }, [])

  const disconnectWhatsApp = useCallback(async () => {
    await window.electron?.invoke?.('whatsapp:disconnect')
  }, [])

  const connectBridge = useCallback(async (workspaceId: string, accessToken: string) => {
    await window.electron?.invoke?.('bridge:connect', { workspaceId, accessToken })
  }, [])

  return {
    status: waStatus,
    bridgeConnected: bridgeStatus.connected,
    isConnected: waStatus.status === 'connected',
    isConnecting: waStatus.status === 'connecting',
    needsQR: waStatus.status === 'qr_required',
    initWhatsApp,
    disconnectWhatsApp,
    connectBridge,
  }
}
