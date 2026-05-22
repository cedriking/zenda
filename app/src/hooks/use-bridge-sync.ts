import { useEffect, useRef } from "react";

/**
 * Auto-connects the WhatsApp-to-API bridge when the app loads
 * and the user is authenticated. Runs once per session.
 *
 * The bridge connects regardless of onboarding status — the API-side
 * conversation engine routes messages based on server-side onboardingStep,
 * so even during onboarding, WhatsApp messages flow correctly.
 *
 * Also: the main process auto-connects the bridge at startup using
 * persisted credentials (bridge-credentials.json), so this hook serves
 * as a fallback for fresh logins where no saved credentials exist yet.
 */
export function useBridgeSync() {
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) {
      return;
    }

    const token = localStorage.getItem("accessToken");
    const workspaceRaw = localStorage.getItem("workspace");

    if (!(token && workspaceRaw)) {
      console.log(
        "[useBridgeSync] No auth data in localStorage, skipping bridge connect"
      );
      return;
    }

    try {
      const workspace = JSON.parse(workspaceRaw);
      if (!workspace?.id) {
        console.log(
          "[useBridgeSync] Workspace has no id, skipping bridge connect"
        );
        return;
      }

      if (!window.electron?.invoke) {
        console.warn(
          "[useBridgeSync] window.electron.invoke not available — bridge IPC skipped"
        );
        return;
      }

      attempted.current = true;
      console.log(
        "[useBridgeSync] Calling bridge:connect IPC for workspace",
        workspace.id
      );

      window.electron
        .invoke("bridge:connect", {
          workspaceId: workspace.id,
          accessToken: token,
        })
        .catch((err: unknown) => {
          console.error("[useBridgeSync] bridge:connect IPC failed:", err);
          // Allow retry on next mount
          attempted.current = false;
        });
    } catch {
      console.error("[useBridgeSync] Failed to parse workspace data");
    }
  }, []);
}
