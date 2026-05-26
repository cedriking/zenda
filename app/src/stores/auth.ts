import { create } from "zustand";

/**
 * Decode JWT payload without a library.
 * Returns null if the token is malformed.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Check whether a JWT access token is present and not expired.
 * Returns true only if the token exists and `exp` is still in the future.
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) {
    return false;
  }
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") {
    return false;
  }
  return Date.now() < payload.exp * 1000;
}

interface User {
  email: string;
  id: string;
  name: string;
}

interface WorkspaceInfo {
  id: string;
  name: string;
  onboardingStep: string;
  planTier: string;
  slug: string;
}

interface AuthState {
  accessToken: string | null;
  error: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  refreshToken: string | null;

  setAuth: (data: {
    user: User;
    workspace: WorkspaceInfo;
    accessToken: string;
    refreshToken: string;
  }) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  updateWorkspace: (partial: Partial<WorkspaceInfo>) => void;
  user: User | null;
  workspace: WorkspaceInfo | null;
}

function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`[auth] Failed to parse localStorage key "${key}"`);
    return null;
  }
}

export function getPostAuthRoute(): string {
  const workspace = loadFromStorage<WorkspaceInfo>("workspace");
  if (!workspace) {
    return "/auth/login";
  }
  if (!workspace.onboardingStep || workspace.onboardingStep === "not_started") {
    return "/auth/connect-whatsapp";
  }
  if (workspace.onboardingStep === "whatsapp_connected") {
    return "/onboarding";
  }
  if (workspace.onboardingStep !== "ready") {
    return "/onboarding";
  }
  return "/dashboard";
}

export const useAuthStore = create<AuthState>((set) => ({
  user: loadFromStorage<User>("user"),
  workspace: loadFromStorage<WorkspaceInfo>("workspace"),
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  isAuthenticated: isTokenValid(localStorage.getItem("accessToken")),
  isLoading: false,
  error: null,

  setAuth: (data) => {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("workspace", JSON.stringify(data.workspace));
    localStorage.setItem("user", JSON.stringify(data.user));
    set({
      user: data.user,
      workspace: data.workspace,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      isAuthenticated: isTokenValid(data.accessToken),
      isLoading: false,
      error: null,
    });
  },
  setLoading: (isLoading) => set({ isLoading }),
  updateWorkspace: (partial) => {
    const current = loadFromStorage<WorkspaceInfo>("workspace");
    if (!current) {
      return;
    }
    const updated = { ...current, ...partial };
    localStorage.setItem("workspace", JSON.stringify(updated));
    set({ workspace: updated });
  },
  setError: (error) => set({ error, isLoading: false }),
  logout: () => {
    // Disconnect WhatsApp and clear session files so auto-init
    // won't reconnect with stale credentials on next login.
    window.electron?.invoke?.("whatsapp:disconnect-and-clear")?.catch(() => {});
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("workspace");
    localStorage.removeItem("user");
    set({
      user: null,
      workspace: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      error: null,
    });
  },
}));
