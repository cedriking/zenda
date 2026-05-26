import { sendToRenderer } from "./whatsapp/bridge.js";

interface HealthStatus {
  api: boolean;
  lastCheck: number;
  whatsapp: boolean;
}

let monitorInterval: ReturnType<typeof setInterval> | null = null;
let initialTimeout: ReturnType<typeof setTimeout> | null = null;
let currentStatus: HealthStatus = {
  whatsapp: false,
  api: false,
  lastCheck: 0,
};
let previousStatus: HealthStatus | null = null;

const CHECK_INTERVAL = 60_000;

export function startHealthMonitor(apiBaseUrl: string) {
  if (monitorInterval) {
    return;
  }

  const check = async () => {
    let apiHealthy = false;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const res = await fetch(`${apiBaseUrl}/health`, {
        signal: controller.signal,
      });
      apiHealthy = res.ok;
    } catch {
      apiHealthy = false;
    } finally {
      clearTimeout(timeout);
    }

    // WhatsApp status is updated via updateWhatsAppHealth() from the WhatsApp
    // IPC onStatus callback — no renderer roundtrip needed.
    currentStatus = {
      whatsapp: currentStatus.whatsapp,
      api: apiHealthy,
      lastCheck: Date.now(),
    };

    // Only send when status changed
    if (
      !previousStatus ||
      previousStatus.whatsapp !== currentStatus.whatsapp ||
      previousStatus.api !== currentStatus.api
    ) {
      previousStatus = { ...currentStatus };
      sendToRenderer("health-status", currentStatus);
    }

    // Auto-reconnect logic: if API is down, don't retry too aggressively
    if (!apiHealthy) {
      console.warn("[Health] API unreachable");
    }
  };

  // Initial check after 10s
  initialTimeout = setTimeout(check, 10_000);
  monitorInterval = setInterval(check, CHECK_INTERVAL);
}

export function stopHealthMonitor() {
  if (initialTimeout) {
    clearTimeout(initialTimeout);
    initialTimeout = null;
  }
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }
}

export function updateWhatsAppHealth(connected: boolean) {
  currentStatus.whatsapp = connected;
}
