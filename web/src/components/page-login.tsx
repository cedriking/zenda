'use client'

import { useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { apiFetch, ApiError } from '@/lib/api-client'
import { useTranslations } from 'next-intl'

export function LoginPageClient() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      router.push('/download')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Nav variant="simple" />

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mt-6 mb-2">{t('loginTitle')}</h1>
            <p className="text-muted-foreground">{t('loginDesc')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5">{t('emailLabel')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-input rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder={t('emailPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">{t('passwordLabel')}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full border border-input rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder={t('passwordPlaceholder')}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 text-sm">
              {loading ? t('loginLoading') : t('loginButton')}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t('noAccount')}{' '}
            <Link href="/signup" className="text-primary underline">{t('signupLink')}</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
