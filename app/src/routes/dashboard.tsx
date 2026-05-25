import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  Calendar,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ConnectivityBanner } from "../components/connectivity-banner";
import { useDashboardShortcuts } from "../hooks/use-keyboard-shortcuts";
import { useWhatsApp } from "../hooks/use-whatsapp";
import { apiFetch } from "../services/api-client";
import { getPostAuthRoute, useAuthStore } from "../stores/auth";

function DashboardLayout() {
  const { t } = useTranslation();
  const { workspace, logout } = useAuthStore();
  const { isConnected } = useWhatsApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      title: string;
      body: string;
      read: boolean;
      createdAt: string;
    }>
  >([]);
  const [isDark, setIsDark] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Initialize keyboard shortcuts
  const shortcuts = useDashboardShortcuts();

  // Initialize theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const dark = stored === "dark" || (!stored && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    // Poll notifications count
    const interval = setInterval(async () => {
      try {
        const notifs = await apiFetch<Array<{ read: unknown }>>(
          "/notifications?limit=50"
        );
        setUnreadCount(notifs.filter((n) => !n.read).length);
      } catch {
        // Will retry on next interval
      }
    }, 30_000);

    // Initial load
    loadNotifications();

    return () => clearInterval(interval);
  }, []);

  async function loadNotifications() {
    try {
      const notifs = await apiFetch<
        Array<{
          id: string;
          title: string;
          body: string;
          read: boolean;
          createdAt: string;
        }>
      >("/notifications?limit=10");
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    } catch {
      // Notifications will retry on next poll cycle
    }
  }

  const handleLogout = () => {
    logout();
    navigate({ to: "/auth/login" });
  };

  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showNotifications) {
      return;
    }
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifications]);

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
    if (!showNotifications) {
      loadNotifications();
    }
  };

  const timeAgo = useMemo(
    () =>
      (dateStr: string): string => {
        const now = Date.now();
        const then = new Date(dateStr).getTime();
        const diffMs = now - then;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSeconds < 60) {
          return t("timeAgo.justNow");
        }
        if (diffMinutes < 60) {
          return t("timeAgo.minAgo", { count: diffMinutes });
        }
        if (diffHours < 24) {
          return t("timeAgo.hourAgo", { count: diffHours });
        }
        if (diffDays === 1) {
          return t("timeAgo.yesterday");
        }
        if (diffDays < 7) {
          return t("timeAgo.dayAgo", { count: diffDays });
        }
        return new Date(dateStr).toLocaleDateString();
      },
    [t]
  );

  return (
    <div className="flex flex-1 overflow-hidden bg-muted">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[100] focus:bg-primary focus:px-4 focus:py-2 focus:font-medium focus:text-primary-foreground focus:text-sm"
        href="#main-content"
      >
        {t("layout.skipToContent")}
      </a>
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-border border-r bg-card">
        <div className="border-border border-b p-4">
          <h1 className="font-bold text-foreground text-xl tracking-tight">
            {t("layout.brandName")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {workspace?.name ?? t("layout.defaultWorkspaceName")}
          </p>
        </div>

        <nav
          aria-label="Main navigation"
          className="flex-1 space-y-1 p-2"
          role="navigation"
        >
          <NavLink
            exact
            icon={<LayoutDashboard size={20} />}
            label={t("nav.dashboard")}
            to="/dashboard"
          />
          <NavLink
            icon={<MessageSquare size={20} />}
            label={t("nav.chats")}
            to="/dashboard/conversations"
          />
          <NavLink
            icon={<Calendar size={20} />}
            label={t("nav.calendar")}
            to="/dashboard/appointments"
          />
          <NavLink
            icon={<Settings size={20} />}
            label={t("nav.settings")}
            to="/dashboard/settings"
          />
          <NavLink
            icon={<BarChart3 size={20} />}
            label={t("nav.analytics")}
            to="/dashboard/analytics"
          />
        </nav>

        <div className="space-y-1 border-border border-t p-4">
          {isConnected ? (
            <div
              aria-label="WhatsApp connected"
              className="mb-1 flex items-center gap-2 text-muted-foreground text-sm"
              role="status"
            >
              <Wifi className="text-emerald-500" size={16} />{" "}
              {t("whatsapp.connected")}
            </div>
          ) : (
            <button
              aria-label="WhatsApp disconnected — click to connect"
              className="mb-1 flex cursor-pointer items-center gap-2 text-destructive text-sm hover:text-destructive/80"
              onClick={() => navigate({ to: "/auth/connect-whatsapp" })}
              role="status"
            >
              <WifiOff size={16} /> {t("whatsapp.connect")}
            </button>
          )}
          <div className="flex items-center justify-between">
            <button
              aria-label="Logout"
              className="flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              {t("layout.logout")}
            </button>
            <div className="flex items-center gap-1">
              <button
                aria-label="Show keyboard shortcuts"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setShowShortcuts(true)}
              >
                <HelpCircle size={16} />
              </button>
              <button
                aria-label={
                  isDark ? "Switch to light mode" : "Switch to dark mode"
                }
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={toggleTheme}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Shortcuts modal */}
      {showShortcuts && (
        <div
          aria-label="Keyboard shortcuts"
          className="fixed inset-0 z-[100] flex items-center justify-center"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowShortcuts(false)}
          />
          <div className="relative w-96 rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-lg">
                {t("layout.keyboardShortcuts")}
              </h3>
              <button
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowShortcuts(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {shortcuts.map((s, i) => (
                <div className="flex items-center justify-between" key={i}>
                  <span className="text-foreground text-sm">
                    {s.description}
                  </span>
                  <kbd className="rounded border border-border bg-muted px-2 py-1 font-mono text-muted-foreground text-xs">
                    {formatShortcut(s)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden" id="main-content">
        <ConnectivityBanner />
        {/* Top bar */}
        <header className="flex h-11 items-center justify-between border-border border-b bg-card/80 px-4 backdrop-blur-sm">
          <nav
            aria-label="Breadcrumb"
            className="text-muted-foreground text-sm"
          >
            {getPageTitle(location.pathname, t)}
          </nav>
          <div className="flex items-center gap-4">
            <div className="relative z-50" ref={notifRef}>
              <button
                aria-expanded={showNotifications}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                aria-live="polite"
                className="relative p-1 text-muted-foreground transition-colors hover:text-foreground"
                onClick={toggleNotifications}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div
                  aria-label="Notifications"
                  className="absolute top-full right-0 z-50 mt-2 w-80 rounded-lg border border-border bg-card shadow-lg"
                  role="dialog"
                >
                  <div className="flex items-center justify-between border-border border-b p-3">
                    <h3 className="font-semibold text-foreground text-sm">
                      {t("layout.notificationsTitle")}
                    </h3>
                    <button
                      aria-label="Close notifications"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setShowNotifications(false)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <Bell
                          className="mx-auto mb-2 text-muted-foreground/50"
                          size={24}
                        />
                        <p className="text-muted-foreground text-sm">
                          {t("layout.noNotifications")}
                        </p>
                        <p className="mt-1 text-muted-foreground text-xs">
                          {t("layout.noNotificationsHint")}
                        </p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          className={`border-border/50 border-b px-3 py-2.5 last:border-0 ${n.read ? "" : "bg-primary/5"}`}
                          key={n.id}
                        >
                          <p className="font-medium text-foreground text-sm">
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-muted-foreground text-xs">
                            {n.body}
                          </p>
                          <p className="mt-1 text-muted-foreground text-xs">
                            {timeAgo(n.createdAt)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="page-transition">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function formatShortcut(s: {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
}): string {
  const parts: string[] = [];
  if (s.meta) {
    parts.push(isMac() ? "Cmd" : "Ctrl");
  }
  if (s.ctrl) {
    parts.push("Ctrl");
  }
  parts.push(s.key === "Escape" ? "Esc" : s.key);
  return parts.join("+");
}

function isMac(): boolean {
  return (
    typeof navigator !== "undefined" &&
    /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)
  );
}

function NavLink({
  to,
  icon,
  label,
  exact = false,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
}) {
  return (
    <Link
      activeOptions={{ exact }}
      activeProps={{
        className: "bg-accent text-accent-foreground font-medium",
      }}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground text-sm transition-all duration-150 hover:bg-accent hover:text-accent-foreground"
      to={to}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

const PAGE_TITLE_KEYS: Record<string, string> = {
  "/dashboard": "nav.dashboard",
  "/dashboard/conversations": "nav.chats",
  "/dashboard/appointments": "nav.calendar",
  "/dashboard/settings": "nav.settings",
  "/dashboard/analytics": "nav.analytics",
};

function getPageTitle(pathname: string, t: (key: string) => string): string {
  if (PAGE_TITLE_KEYS[pathname]) {
    return t(PAGE_TITLE_KEYS[pathname]);
  }
  const match = Object.keys(PAGE_TITLE_KEYS)
    .sort((a, b) => b.length - a.length)
    .find((p) => pathname.startsWith(`${p}/`));
  return match ? t(PAGE_TITLE_KEYS[match]) : t("nav.dashboard");
}

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const raw = localStorage.getItem("workspace");
    if (raw) {
      try {
        const workspace = JSON.parse(raw);
        if (workspace.onboardingStep === "ready") {
          return;
        }

        // localStorage may be stale — check server state
        try {
          const status = await apiFetch<{ currentStep: string }>(
            "/onboarding/status"
          );
          if (status.currentStep === "ready") {
            workspace.onboardingStep = "ready";
            localStorage.setItem("workspace", JSON.stringify(workspace));
            return;
          }
          throw redirect({ to: getPostAuthRoute() });
        } catch (fetchErr) {
          if (fetchErr && typeof fetchErr === "object" && "to" in fetchErr) {
            throw fetchErr;
          }
        }

        // localStorage says not ready and server check didn't confirm ready
        throw redirect({ to: getPostAuthRoute() });
      } catch (e) {
        if (e && typeof e === "object" && "to" in e) {
          throw e;
        }
      }
    }
  },
  component: DashboardLayout,
});
