import { Link, useNavigate } from '@/utils/router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore, getPostAuthRoute } from '@/stores/auth'
import { apiFetch } from '@/services/api-client'
import { Button } from '@/components/ui/button'
import { setAppLanguage, detectSystemLanguage } from '@/actions/language'
import { supportedLanguages, type UILanguage } from '@zenda/shared/i18n'

export default function SignupPage() {
  const { t, i18n } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [language, setLanguage] = useState<UILanguage>(detectSystemLanguage())
  const [error, setError] = useState<string | null>(null)
  const setAuth = useAuthStore((s) => s.setAuth)
  const setLoading = useAuthStore((s) => s.setLoading)
  const isLoading = useAuthStore((s) => s.isLoading)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'))
      return
    }

    setLoading(true)

    try {
      const data = await apiFetch('/auth/signup', {
        method: 'POST',
        body: { name, email, password, businessName, language },
      })
      setAuth(data as Parameters<typeof setAuth>[0])
      navigate(getPostAuthRoute())
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.signupFailed'))
      setLoading(false)
    }
  }

  function handleLanguageChange(lang: string) {
    const uiLang = lang as UILanguage
    setLanguage(uiLang)
    setAppLanguage(uiLang, i18n)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t('auth.createAccount')}</h1>
          <p className="text-muted-foreground">{t('auth.setupReceptionist')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">{t('auth.name')}</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">{t('auth.email')}</label>
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
            <label htmlFor="password" className="text-sm font-medium">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder={t('auth.minChars')}
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">{t('auth.confirmPassword')}</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder={t('auth.reEnterPassword')}
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="businessName" className="text-sm font-medium">{t('auth.businessName')}</label>
            <input
              id="businessName"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="language" className="text-sm font-medium">{t('auth.language')}</label>
            <select
              id="language"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.key} value={lang.key}>
                  {lang.nativeName}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('auth.creatingAccount') : t('auth.signup')}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t('auth.hasAccount')}{' '}
          <Link to="/auth/login" className="text-primary underline">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  )
}
