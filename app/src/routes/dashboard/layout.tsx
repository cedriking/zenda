import { createFileRoute, Outlet, Link, useNavigate, redirect } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuthStore, getPostAuthRoute } from '../../stores/auth'
import { useWhatsApp } from '../../hooks/use-whatsapp'
import { apiFetch } from '../../services/api-client'
import { MessageSquare, Calendar, Settings, LayoutDashboard, LogOut, Wifi, WifiOff, Bell, BarChart3, X } from 'lucide-react'
import { ConnectivityBanner } from '../../components/connectivity-banner'

function DashboardLayout() {
  const { workspace, logout } = useAuthStore()
  const { isConnected, status } = useWhatsApp()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; body: string; read: boolean; createdAt: string }>>([])

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

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev)
    if (!showNotifications) loadNotifications()
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:text-sm focus:font-medium">
        Skip to content
      </a>
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Zenda</h1>
          <p className="text-sm text-gray-500">{workspace?.name ?? 'Business'}</p>
        </div>

        <nav className="flex-1 p-2 space-y-1" role="navigation" aria-label="Main navigation">
          <NavLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" exact />
          <NavLink to="/dashboard/conversations" icon={<MessageSquare size={20} />} label="Chats" />
          <NavLink to="/dashboard/appointments" icon={<Calendar size={20} />} label="Calendar" />
          <NavLink to="/dashboard/settings" icon={<Settings size={20} />} label="Settings" />
          <NavLink to="/dashboard/analytics" icon={<BarChart3 size={20} />} label="Analytics" />
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3" role="status" aria-label={isConnected ? 'WhatsApp connected' : 'WhatsApp disconnected'}>
            {isConnected ? (
              <><Wifi size={16} className="text-green-500" /> WhatsApp Connected</>
            ) : (
              <><WifiOff size={16} className="text-red-500" /> {status.status}</>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            aria-label="Logout"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden" id="main-content">
        <ConnectivityBanner />
        {/* Top bar */}
        <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div />
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="relative p-1 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              aria-live="polite"
                aria-expanded={showNotifications}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center" aria-hidden="true">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg border border-gray-200 shadow-lg z-50" role="dialog" aria-label="Notifications">
                  <div className="flex items-center justify-between p-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Close notifications"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`px-3 py-2.5 border-b border-gray-50 last:border-0 ${!n.read ? 'bg-blue-50/50' : ''}`}
                        >
                          <p className="text-sm font-medium text-gray-900">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(n.createdAt).toLocaleString()}
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

function NavLink({ to, icon, label, exact = false }: { to: string; icon: React.ReactNode; label: string; exact?: boolean }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
      activeProps={{
        className: 'bg-blue-50 text-blue-700 font-medium',
      }}
      activeOptions={{ exact }}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

export const Route = createFileRoute('/dashboard/layout')({
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
