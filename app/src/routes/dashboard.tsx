import { createFileRoute, Outlet, Link, useNavigate, useLocation, redirect } from '@tanstack/react-router'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore, getPostAuthRoute } from '../stores/auth'
import { useWhatsApp } from '../hooks/use-whatsapp'
import { useDashboardShortcuts } from '../hooks/use-keyboard-shortcuts'
import { apiFetch } from '../services/api-client'
import { MessageSquare, Calendar, Settings, LayoutDashboard, LogOut, Wifi, WifiOff, Bell, BarChart3, X, Moon, Sun, HelpCircle } from 'lucide-react'
import { ConnectivityBanner } from '../components/connectivity-banner'

function DashboardLayout() {
  const { t } = useTranslation()
  const { workspace, logout } = useAuthStore()
  const { isConnected } = useWhatsApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; body: string; read: boolean; createdAt: string }>>([])
  const [isDark, setIsDark] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Initialize keyboard shortcuts
  const shortcuts = useDashboardShortcuts()

  // Initialize theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = stored === 'dark' || (!stored && prefersDark)
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  useEffect(() => {
    // Poll notifications count
    const interval = setInterval(async () => {
      try {
        const notifs = await apiFetch<Array<{ read: unknown }>>('/notifications?limit=50')
        setUnreadCount(notifs.filter(n => !n.read).length)
      } catch {
        // Will retry on next interval
      }
    }, 30_000)

    // Initial load
    loadNotifications()

    return () => clearInterval(interval)
  }, [])

  async function loadNotifications() {
    try {
      const notifs = await apiFetch<Array<{ id: string; title: string; body: string; read: boolean; createdAt: string }>>('/notifications?limit=10')
      setNotifications(notifs)
      setUnreadCount(notifs.filter(n => !n.read).length)
    } catch {
      // Notifications will retry on next poll cycle
    }
  }

  const handleLogout = () => {
    logout()
    navigate({ to: '/auth/login' })
  }

  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showNotifications) return
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showNotifications])

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev)
    if (!showNotifications) loadNotifications()
  }

  const timeAgo = useMemo(() => {
    return (dateStr: string): string => {
      const now = Date.now()
      const then = new Date(dateStr).getTime()
      const diffMs = now - then
      const diffSeconds = Math.floor(diffMs / 1000)
      const diffMinutes = Math.floor(diffSeconds / 60)
      const diffHours = Math.floor(diffMinutes / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffSeconds < 60) return t('timeAgo.justNow')
      if (diffMinutes < 60) return t('timeAgo.minAgo', { count: diffMinutes })
      if (diffHours < 24) return t('timeAgo.hourAgo', { count: diffHours })
      if (diffDays === 1) return t('timeAgo.yesterday')
      if (diffDays < 7) return t('timeAgo.dayAgo', { count: diffDays })
      return new Date(dateStr).toLocaleDateString()
    }
  }, [t])

  return (
    <div className="flex h-screen bg-muted">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-medium">
        {t('layout.skipToContent')}
      </a>
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">{t('layout.brandName')}</h1>
          <p className="text-sm text-muted-foreground">{workspace?.name ?? t('layout.defaultWorkspaceName')}</p>
        </div>

        <nav className="flex-1 p-2 space-y-1" role="navigation" aria-label="Main navigation">
          <NavLink to="/dashboard" icon={<LayoutDashboard size={20} />} label={t('nav.dashboard')} exact />
          <NavLink to="/dashboard/conversations" icon={<MessageSquare size={20} />} label={t('nav.chats')} />
          <NavLink to="/dashboard/appointments" icon={<Calendar size={20} />} label={t('nav.calendar')} />
          <NavLink to="/dashboard/settings" icon={<Settings size={20} />} label={t('nav.settings')} />
          <NavLink to="/dashboard/analytics" icon={<BarChart3 size={20} />} label={t('nav.analytics')} />
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          {isConnected ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1" role="status" aria-label="WhatsApp connected">
              <Wifi size={16} className="text-emerald-500" /> {t('whatsapp.connected')}
            </div>
          ) : (
            <button
              onClick={() => navigate({ to: '/auth/connect-whatsapp' })}
              className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 mb-1 cursor-pointer"
              role="status"
              aria-label="WhatsApp disconnected — click to connect"
            >
              <WifiOff size={16} /> {t('whatsapp.connect')}
            </button>
          )}
          <div className="flex items-center justify-between">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              aria-label="Logout"
            >
              <LogOut size={16} />
              {t('layout.logout')}
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowShortcuts(true)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Show keyboard shortcuts"
              >
                <HelpCircle size={16} />
              </button>
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Shortcuts modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-label="Keyboard shortcuts">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowShortcuts(false)} />
          <div className="relative bg-card rounded-xl border border-border shadow-xl w-96 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{t('layout.keyboardShortcuts')}</h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {shortcuts.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{s.description}</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-muted text-muted-foreground rounded border border-border">
                    {formatShortcut(s)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden" id="main-content">
        <ConnectivityBanner />
        {/* Top bar */}
        <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            {getPageTitle(location.pathname, t)}
          </nav>
          <div className="flex items-center gap-4">
            <div className="relative z-50" ref={notifRef}>
              <button
                onClick={toggleNotifications}
                className="relative p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                aria-live="polite"
                aria-expanded={showNotifications}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center" aria-hidden="true">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-lg border border-border shadow-lg z-50" role="dialog" aria-label="Notifications">
                  <div className="flex items-center justify-between p-3 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground">{t('layout.notificationsTitle')}</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Close notifications"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <Bell size={24} className="mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">{t('layout.noNotifications')}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t('layout.noNotificationsHint')}</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`px-3 py-2.5 border-b border-border/50 last:border-0 ${!n.read ? 'bg-primary/5' : ''}`}
                        >
                          <p className="text-sm font-medium text-foreground">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                          <p className="text-xs text-muted-foreground mt-1">
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
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function formatShortcut(s: { key: string; meta?: boolean; ctrl?: boolean }): string {
  const parts: string[] = []
  if (s.meta) parts.push(isMac() ? 'Cmd' : 'Ctrl')
  if (s.ctrl) parts.push('Ctrl')
  parts.push(s.key === 'Escape' ? 'Esc' : s.key)
  return parts.join('+')
}

function isMac(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)
}

function NavLink({ to, icon, label, exact = false }: { to: string; icon: React.ReactNode; label: string; exact?: boolean }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
      activeProps={{
        className: 'bg-primary/10 text-primary font-medium',
      }}
      activeOptions={{ exact }}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

const PAGE_TITLE_KEYS: Record<string, string> = {
  '/dashboard': 'nav.dashboard',
  '/dashboard/conversations': 'nav.chats',
  '/dashboard/appointments': 'nav.calendar',
  '/dashboard/settings': 'nav.settings',
  '/dashboard/analytics': 'nav.analytics',
}

function getPageTitle(pathname: string, t: (key: string) => string): string {
  if (PAGE_TITLE_KEYS[pathname]) return t(PAGE_TITLE_KEYS[pathname])
  const match = Object.keys(PAGE_TITLE_KEYS)
    .sort((a, b) => b.length - a.length)
    .find(p => pathname.startsWith(p + '/'))
  return match ? t(PAGE_TITLE_KEYS[match]) : t('nav.dashboard')
}

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => {
    const raw = localStorage.getItem('workspace')
    if (raw) {
      try {
        const workspace = JSON.parse(raw)
        if (workspace.onboardingStep !== 'ready') {
          throw redirect({ to: getPostAuthRoute() })
        }
      } catch (e) {
        if (e && typeof e === 'object' && 'to' in e) throw e
      }
    }
  },
  component: DashboardLayout,
})
