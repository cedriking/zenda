import { useCallback, useEffect, useState } from "react";

interface WhatsAppStatus {
  error?: string;
  phoneNumber?: string;
  qrData?: string;
  status: "disconnected" | "connecting" | "qr_required" | "connected" | "error";
}

interface BridgeStatus {
  connected: boolean;
  error?: string;
}

const VALID_WA_STATUSES: readonly WhatsAppStatus["status"][] = [
  "disconnected",
  "connecting",
  "qr_required",
  "connected",
  "error",
];

function validateWhatsAppStatus(data: unknown): WhatsAppStatus {
  if (typeof data !== "object" || data === null) {
    return { status: "disconnected" };
  }
  const obj = data as Record<string, unknown>;
  if (
    typeof obj.status === "string" &&
    VALID_WA_STATUSES.includes(obj.status as WhatsAppStatus["status"])
  ) {
    return {
      status: obj.status as WhatsAppStatus["status"],
      ...(typeof obj.phoneNumber === "string"
        ? { phoneNumber: obj.phoneNumber }
        : {}),
      ...(typeof obj.qrData === "string" ? { qrData: obj.qrData } : {}),
      ...(typeof obj.error === "string" ? { error: obj.error } : {}),
    };
  }
  return { status: "disconnected" };
}

function validateBridgeStatus(data: unknown): BridgeStatus {
  if (typeof data !== "object" || data === null) {
    return { connected: false };
  }
  const obj = data as Record<string, unknown>;
  return {
    connected: typeof obj.connected === "boolean" ? obj.connected : false,
    ...(typeof obj.error === "string" ? { error: obj.error } : {}),
  };
}

export function useWhatsApp() {
  const [waStatus, setWaStatus] = useState<WhatsAppStatus>({
    status: "disconnected",
  });
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>({
    connected: false,
  });

  useEffect(() => {
    // Listen for WhatsApp status updates from main process
    const unsubStatus = window.electron?.on?.(
      "whatsapp:status",
      (status: unknown) => {
        setWaStatus(validateWhatsAppStatus(status));
      }
    );

    const unsubBridge = window.electron?.on?.(
      "bridge:status",
      (status: unknown) => {
        setBridgeStatus(validateBridgeStatus(status));
      }
    );

    return () => {
      unsubStatus?.();
      unsubBridge?.();
    };
  }, []);

  const initWhatsApp = useCallback(async () => {
    try {
      await window.electron?.invoke?.("whatsapp:init");
    } catch {
      // Error handled by status update from main process
    }
  }, []);

  const disconnectWhatsApp = useCallback(async () => {
    await window.electron?.invoke?.("whatsapp:disconnect");
  }, []);

  const connectBridge = useCallback(
    async (workspaceId: string, accessToken: string) => {
      await window.electron?.invoke?.("bridge:connect", {
        workspaceId,
        accessToken,
      });
    },
    []
  );

  return {
    status: waStatus,
    bridgeConnected: bridgeStatus.connected,
    isConnected: waStatus.status === "connected",
    isConnecting: waStatus.status === "connecting",
    needsQR: waStatus.status === "qr_required",
    initWhatsApp,
    disconnectWhatsApp,
    connectBridge,
  };
}
