import { Link, useNavigate } from '@/utils/router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore, getPostAuthRoute } from '@/stores/auth'
import { apiFetch } from '@/services/api-client'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail } from 'lucide-react'
import LangToggle from '@/components/lang-toggle'

export default function LoginPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const setAuth = useAuthStore((s) => s.setAuth)
  const setLoading = useAuthStore((s) => s.setLoading)
  const isLoading = useAuthStore((s) => s.isLoading)
  const navigate = useNavigate()

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
      navigate(getPostAuthRoute())
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginFailed'))
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
      setResetError(err instanceof Error ? err.message : t('auth.sending'))
    } finally {
      setResetLoading(false)
    }
  }

  // Password reset view
  if (showReset) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-sm space-y-6 p-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setShowReset(false); setResetSent(false); setResetError(null) }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              aria-label={t('auth.backToLogin')}
            >
              <ArrowLeft size={16} />
              {t('auth.backToLogin')}
            </button>
            <LangToggle />
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="text-primary" size={24} />
            </div>
            <h1 className="text-2xl font-bold">{t('auth.resetPassword')}</h1>
            <p className="text-muted-foreground mt-1">
              {resetSent ? t('auth.resetLinkSent') : t('auth.enterEmail')}
            </p>
          </div>

          {resetSent ? (
            <div className="rounded-md bg-emerald-500/10 border border-border p-4 text-sm text-emerald-600">
              {t('auth.resetLinkSentDetail', { email: resetEmail })}
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
                  {t('auth.email')}
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
                {resetLoading ? t('auth.sending') : t('auth.sendResetLink')}
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
          <h1 className="text-2xl font-bold">{t('auth.loginHeading')}</h1>
          <p className="text-muted-foreground">{t('auth.aiReceptionist')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t('auth.email')}
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
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('auth.loggingIn') : t('auth.login')}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <button
            onClick={() => setShowReset(true)}
            className="text-primary underline hover:no-underline"
          >
            {t('auth.forgotPassword')}
          </button>
        </p>
        <p className="text-center text-sm text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <Link to="/auth/signup" className="text-primary underline">
            {t('auth.createOne')}
          </Link>
        </p>

        <div className="flex justify-center">
          <LangToggle />
        </div>
      </div>
    </div>
  )
}
