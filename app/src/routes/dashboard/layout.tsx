import { createFileRoute, Outlet, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/auth'
import { useWhatsApp } from '../../hooks/use-whatsapp'
import { apiFetch } from '../../services/api-client'
import { MessageSquare, Calendar, Settings, LayoutDashboard, LogOut, Wifi, WifiOff, Bell } from 'lucide-react'

function DashboardLayout() {
  const { workspace, logout } = useAuthStore()
  const { isConnected, status } = useWhatsApp()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Poll notifications count
    const interval = setInterval(async () => {
      try {
        const notifs = await apiFetch<Array<{ read: unknown }>>('/notifications?limit=50')
        setUnreadCount(notifs.filter(n => !n.read).length)
      } catch { /* silent */ }
    }, 30_000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    logout()
    navigate({ to: '/auth/login' })
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Zenda</h1>
          <p className="text-sm text-gray-500">{workspace?.name ?? 'Business'}</p>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            activeOptions={{ exact: true }}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/dashboard/conversations"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <MessageSquare size={20} />
            <span>Chats</span>
          </Link>
          <Link
            to="/dashboard/appointments"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Calendar size={20} />
            <span>Calendar</span>
          </Link>
          <Link
            to="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            {isConnected ? (
              <><Wifi size={16} className="text-green-500" /> WhatsApp Connected</>
            ) : (
              <><WifiOff size={16} className="text-red-500" /> {status.status}</>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div />
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell size={18} className="text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
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

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})
