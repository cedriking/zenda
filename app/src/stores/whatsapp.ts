import { create } from 'zustand'
import type { WhatsAppConnectionStatus } from '@zenda/shared'

interface WhatsAppState {
  status: WhatsAppConnectionStatus
  phoneNumber: string | null
  qrData: string | null
  lastConnectedAt: Date | null
  error: string | null

  setStatus: (status: WhatsAppConnectionStatus) => void
  setPhoneNumber: (phone: string | null) => void
  setQrData: (qr: string | null) => void
  setError: (error: string | null) => void
}

export const useWhatsAppStore = create<WhatsAppState>((set) => ({
  status: 'disconnected',
  phoneNumber: null,
  qrData: null,
  lastConnectedAt: null,
  error: null,

  setStatus: (status) => set({ status, error: null }),
  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
  setQrData: (qrData) => set({ qrData }),
  setError: (error) => set({ error }),
}))
