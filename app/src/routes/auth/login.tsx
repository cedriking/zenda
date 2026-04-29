import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuthStore, getPostAuthRoute } from '@/stores/auth'
import { apiFetch } from '@/services/api-client'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail } from 'lucide-react'

export const Route = createFileRoute('/auth/login')({
  beforeLoad: ({ context }) => {
    if (context.auth?.isAuthenticated) {
      throw redirect({ to: getPostAuthRoute() })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const setAuth = useAuthStore((s) => s.setAuth)
  const setLoading = useAuthStore((s) => s.setLoading)
  const isLoading = useAuthStore((s) => s.isLoading)

  // Password reset state
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetLoading, setResetLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      setAuth(data as Parameters<typeof setAuth>[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setLoading(false)
    }
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault()
    setResetError(null)
    setResetLoading(true)

    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: { email: resetEmail },
      })
      setResetSent(true)
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setResetLoading(false)
    }
  }

  // Password reset view
  if (showReset) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-sm space-y-6 p-8">
          <button
            onClick={() => { setShowReset(false); setResetSent(false); setResetError(null) }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            aria-label="Back to login"
          >
            <ArrowLeft size={16} />
            Back to login
          </button>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Mail className="text-blue-600" size={24} />
            </div>
            <h1 className="text-2xl font-bold">Reset password</h1>
            <p className="text-muted-foreground mt-1">
              {resetSent
                ? 'Check your email for a reset link'
                : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          {resetSent ? (
            <div className="rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-700">
              Reset link sent to <strong>{resetEmail}</strong>. Check your inbox and spam folder.
            </div>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              {resetError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {resetError}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="reset-email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="you@business.com"
                  required
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full" disabled={resetLoading}>
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          )}
        </div>
      </div>
    )
  }

  // Login view
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Zenda</h1>
          <p className="text-muted-foreground">Your AI receptionist for WhatsApp</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="you@business.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Enter your password"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log in'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <button
            onClick={() => setShowReset(true)}
            className="text-primary underline hover:no-underline"
          >
            Forgot your password?
          </button>
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/auth/signup" className="text-primary underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
