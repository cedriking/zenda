import { type RouteDefinition } from './router'
import { getPostAuthRoute, isTokenValid } from '@/stores/auth'

// ---------------------------------------------------------------------------
// Route components
// ---------------------------------------------------------------------------

import RootComponent from '@/routes/__root'
import IndexComponent from '@/routes/index'
import AuthLogin from '@/routes/auth/login'
import AuthSignup from '@/routes/auth/signup'
import AuthConnectWhatsApp from '@/routes/auth/connect-whatsapp'
import OnboardingPage from '@/routes/onboarding/index'
import DashboardLayout from '@/routes/dashboard'
import DashboardHome from '@/routes/dashboard/index'
import ConversationsPage from '@/routes/dashboard/conversations/index'
import ConversationDetailPage from '@/routes/dashboard/conversations/$id'
import CustomersPage from '@/routes/dashboard/customers/index'
import CustomerProfilePage from '@/routes/dashboard/customers/$id'
import AppointmentsPage from '@/routes/dashboard/appointments/index'
import AnalyticsPage from '@/routes/dashboard/analytics/index'
import IntegrationsPage from '@/routes/dashboard/integrations/index'
import SettingsPage from '@/routes/dashboard/settings/index'
import SettingsAppointments from '@/routes/dashboard/settings/appointments'
import SettingsKnowledgeBase from '@/routes/dashboard/settings/knowledge-base'
import SettingsSafety from '@/routes/dashboard/settings/safety'
import SettingsReceptionist from '@/routes/dashboard/settings/receptionist'
import SettingsMessaging from '@/routes/dashboard/settings/messaging'

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <a href="/dashboard" className="text-primary underline hover:no-underline">
        Go to Dashboard
      </a>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Route tree
// ---------------------------------------------------------------------------

export const routes: RouteDefinition[] = [
  {
    path: '',
    component: RootComponent,
    children: [
      { path: '/', component: IndexComponent },
      // Auth
      { path: '/auth/login', component: AuthLogin },
      { path: '/auth/signup', component: AuthSignup },
      { path: '/auth/connect-whatsapp', component: AuthConnectWhatsApp },
      // Onboarding
      { path: '/onboarding', component: OnboardingPage },
      // Dashboard
      {
        path: '/dashboard',
        component: DashboardLayout,
        children: [
          { path: '', component: DashboardHome },
          { path: '/conversations', component: ConversationsPage },
          { path: '/conversations/$id', component: ConversationDetailPage },
          { path: '/customers', component: CustomersPage },
          { path: '/customers/$id', component: CustomerProfilePage },
          { path: '/appointments', component: AppointmentsPage },
          { path: '/analytics', component: AnalyticsPage },
          { path: '/integrations', component: IntegrationsPage },
          {
            path: '/settings',
            component: SettingsPage,
            children: [
              { path: '/appointments', component: SettingsAppointments },
              { path: '/knowledge-base', component: SettingsKnowledgeBase },
              { path: '/safety', component: SettingsSafety },
              { path: '/receptionist', component: SettingsReceptionist },
              { path: '/messaging', component: SettingsMessaging },
            ],
          },
        ],
      },
      { path: '*', component: NotFoundPage },
    ],
  },
]

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

/** Redirect `/` to `/dashboard`. */
export function indexGuard(pathname: string): string | null {
  if (pathname === '/') return '/dashboard'
  return null
}

/** Auth guard — redirect unauthenticated users to login. */
export function authGuard(pathname: string): string | null {
  const token = localStorage.getItem('accessToken')
  const isAuthRoute = pathname.startsWith('/auth')
  const isConnectWhatsApp = pathname === '/auth/connect-whatsapp'
  const hasValidToken = isTokenValid(token)

  if (!(hasValidToken || isAuthRoute)) return '/auth/login'
  if (hasValidToken && isAuthRoute && !isConnectWhatsApp) return getPostAuthRoute()
  return null
}
