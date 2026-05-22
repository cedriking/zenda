import { useEffect, useRef } from "react";

/**
 * Auto-connects the WhatsApp-to-API bridge when the app loads
 * and the user is authenticated. Runs once per session.
 *
 * Also listens for bridge:status events from the main process.
 * When the bridge reports auth failure (token expired), it tries
 * to refresh the token via /auth/refresh and reconnects.
 */

function refreshBridgeToken(attempted: React.MutableRefObject<boolean>): void {
  const API_BASE_URL = import.meta.env.VITE_API_URL ?? "https://api.zenda.bot";
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    console.warn(
      "[useBridgeSync] No refresh token available, user must re-login"
    );
    return;
  }

  fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Refresh failed: ${res.status}`);
      }
      return res.json();
    })
    .then((data: { accessToken?: string; refreshToken?: string }) => {
      if (!data.accessToken) {
        console.error("[useBridgeSync] Token refresh returned no access token");
        return;
      }

      console.log("[useBridgeSync] Token refreshed, reconnecting bridge");
      localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      const workspaceRaw = localStorage.getItem("workspace");
      const workspace = workspaceRaw ? JSON.parse(workspaceRaw) : null;

      if (workspace?.id && window.electron?.invoke) {
        attempted.current = true;
        window.electron.invoke("bridge:connect", {
          workspaceId: workspace.id,
          accessToken: data.accessToken,
        });
      }
    })
    .catch((err: unknown) => {
      console.error("[useBridgeSync] Token refresh failed:", err);
    });
}

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

  // Listen for bridge auth failures and attempt token refresh + reconnect
  useEffect(() => {
    if (!window.electron?.on) {
      return;
    }

    const unsub = window.electron.on("bridge:status", (status: unknown) => {
      const s = status as {
        connected?: boolean;
        error?: string;
        requiresReLogin?: boolean;
      };

      if (s?.requiresReLogin) {
        console.log(
          "[useBridgeSync] Bridge reports auth failure, attempting token refresh..."
        );
        attempted.current = false;
        refreshBridgeToken(attempted);
      }
    });

    return unsub;
  }, []);
}
