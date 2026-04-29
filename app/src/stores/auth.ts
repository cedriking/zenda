import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
}

interface WorkspaceInfo {
  id: string
  name: string
  slug: string
  planTier: string
  onboardingStep: string
}

interface AuthState {
  user: User | null
  workspace: WorkspaceInfo | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  setAuth: (data: {
    user: User
    workspace: WorkspaceInfo
    accessToken: string
    refreshToken: string
  }) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
}

function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getPostAuthRoute(): string {
  const workspace = loadFromStorage<WorkspaceInfo>('workspace')
  if (!workspace) return '/auth/login'
  if (!workspace.onboardingStep || workspace.onboardingStep === 'not_started') return '/auth/connect-whatsapp'
  if (workspace.onboardingStep === 'whatsapp_connected') return '/onboarding'
  if (workspace.onboardingStep !== 'ready') return '/onboarding'
  return '/dashboard'
}

export const useAuthStore = create<AuthState>((set) => ({
  user: loadFromStorage<User>('user'),
  workspace: loadFromStorage<WorkspaceInfo>('workspace'),
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  setAuth: (data) => {
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('workspace', JSON.stringify(data.workspace))
    localStorage.setItem('user', JSON.stringify(data.user))
    set({
      user: data.user,
      workspace: data.workspace,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    })
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('workspace')
    localStorage.removeItem('user')
    set({
      user: null,
      workspace: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      error: null,
    })
  },
}))
