import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@/utils/router";
import { useWhatsApp } from "../../hooks/use-whatsapp";
import { apiFetch } from "../../services/api-client";
import { useAuthStore } from "../../stores/auth";

export default function ConnectWhatsAppPage() {
  const { status, initWhatsApp, connectBridge, isConnected, needsQR } =
    useWhatsApp();
  const { workspace, accessToken, updateWorkspace } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const initCalled = useRef(false);

  // Detect reconnection mode (workspace already onboarded, just reconnecting WhatsApp)
  const isReconnect = workspace?.onboardingStep === "ready";

  useEffect(() => {
    // Prevent double-init in React StrictMode
    if (!initCalled.current) {
      initCalled.current = true;
      initWhatsApp();
    }
  }, [initWhatsApp]);

  useEffect(() => {
    if (isConnected && workspace?.id && accessToken) {
      connectBridge(workspace.id, accessToken);
      if (!isReconnect) {
        // Advance onboarding step from 'not_started' to 'whatsapp_connected'
        apiFetch("/onboarding/advance", {
          method: "POST",
          body: { completedStep: "not_started" },
        })
          .then(() => {
            updateWorkspace({ onboardingStep: "whatsapp_connected" });
          })
          .catch(() => {
            // Non-critical — onboarding page handles step transitions too
          });
      }
    }
  }, [
    isConnected,
    workspace?.id,
    accessToken,
    connectBridge,
    isReconnect,
    updateWorkspace,
  ]);

  useEffect(() => {
    if (isConnected) {
      const dest = isReconnect ? "/dashboard" : "/onboarding";
      const timer = setTimeout(() => navigate(dest), 1500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, navigate, isReconnect]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="mb-2 font-bold text-2xl text-foreground">
          {t("whatsapp.connectTitle")}
        </h1>
        <p className="mb-8 text-muted-foreground">
          {t("whatsapp.connectSubtitle")}
        </p>

        {status.status === "connecting" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted-foreground">
              {t("whatsapp.initializing")}
            </p>
          </div>
        )}

        {needsQR && (
          <div className="flex flex-col items-center gap-4">
            {status.qrData ? (
              <img
                alt="WhatsApp QR Code"
                className="h-[280px] w-[280px]"
                src={status.qrData}
              />
            ) : (
              <Loader2
                className="animate-spin text-muted-foreground"
                size={200}
              />
            )}
            <p className="text-muted-foreground">{t("whatsapp.scanTheQr")}</p>
            <p className="text-muted-foreground text-sm">
              {t("whatsapp.scanQrInstruction")}
            </p>
          </div>
        )}

        {isConnected && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="text-emerald-500" size={48} />
            <p className="font-medium text-emerald-600">
              {t("whatsapp.connectedSuccess")}
            </p>
            <p className="text-muted-foreground text-sm">
              {t("whatsapp.redirecting")}
            </p>
          </div>
        )}

        {status.status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="text-destructive" size={48} />
            <p className="text-destructive">
              {status.error ?? t("whatsapp.connectionFailed")}
            </p>
            <button
              className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
              onClick={initWhatsApp}
            >
              {t("whatsapp.tryAgain")}
            </button>
          </div>
        )}

        {status.status === "disconnected" && (
          <button
            className="rounded-lg bg-emerald-500 px-6 py-3 text-lg text-white hover:bg-emerald-600"
            onClick={initWhatsApp}
          >
            {t("whatsapp.connect")}
          </button>
        )}
      </div>
    </div>
  );
}
