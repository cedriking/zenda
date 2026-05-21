'use client'

import { useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { apiFetch, ApiError } from '@/lib/api-client'
import { useTranslations } from 'next-intl'

export function SignupPageClient() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordStrength = (() => {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  })()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError(t('passwordMinError'))
      return
    }

    setLoading(true)

    try {
      await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, businessName }),
      })
      router.push('/download')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full border border-input rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Nav variant="simple" />

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mt-6 mb-2">{t('signupTitle')}</h1>
            <p className="text-muted-foreground">{t('signupDesc')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5">{t('nameLabel')}</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className={inputClass} placeholder={t('namePlaceholder')} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">{t('businessNameLabel')}</label>
              <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} required className={inputClass} placeholder={t('businessNamePlaceholder')} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">{t('emailLabel')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} placeholder={t('emailPlaceholder')} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">{t('passwordLabel')}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className={inputClass} placeholder={t('passwordSignupPlaceholder')} />
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          passwordStrength >= i
                            ? passwordStrength <= 1 ? 'bg-red-400'
                            : passwordStrength <= 2 ? 'bg-yellow-400'
                            : passwordStrength <= 3 ? 'bg-primary'
                            : 'bg-green-500'
                          : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${
                    passwordStrength <= 1 ? 'text-red-500'
                    : passwordStrength <= 2 ? 'text-yellow-600'
                    : passwordStrength <= 3 ? 'text-primary'
                    : 'text-green-600'
                  }`}>
                    {passwordStrength <= 1 ? t('passwordWeak') : passwordStrength <= 2 ? t('passwordFair') : passwordStrength <= 3 ? t('passwordGood') : t('passwordStrong')}
                  </p>
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 text-sm">
              {loading ? t('signupLoading') : t('signupButton')}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              {t('agreeToTerms', {
                terms: t('termsLink'),
                privacy: t('privacyLink'),
              })}
            </p>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t('haveAccount')}{' '}
            <Link href="/login" className="text-primary underline">{t('loginLink')}</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
