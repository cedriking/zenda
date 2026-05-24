import type { WhatsAppConnectionStatus } from "@zenda/shared";
import { create } from "zustand";

interface WhatsAppState {
  error: string | null;
  lastConnectedAt: Date | null;
  phoneNumber: string | null;
  qrData: string | null;
  setError: (error: string | null) => void;
  setPhoneNumber: (phone: string | null) => void;
  setQrData: (qr: string | null) => void;

  setStatus: (status: WhatsAppConnectionStatus) => void;
  status: WhatsAppConnectionStatus;
}

export const useWhatsAppStore = create<WhatsAppState>((set) => ({
  status: "disconnected",
  phoneNumber: null,
  qrData: null,
  lastConnectedAt: null,
  error: null,

  setStatus: (status) =>
    set({
      status,
      error: null,
      ...(status === "connected" ? { lastConnectedAt: new Date() } : {}),
    }),
  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
  setQrData: (qrData) => set({ qrData }),
  setError: (error) => set({ error }),
}));
