'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { apiFetch } from '@/lib/api-client'
import { useTranslations } from 'next-intl'

export function DownloadPageClient() {
  const t = useTranslations('download')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleWaitlistSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    try {
      await apiFetch('/support/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Nav variant="simple" />

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="text-center max-w-lg">
          <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
          <p className="text-muted-foreground mb-8">
            {t('desc')}
          </p>

          {!sent ? (
            <Card className="mb-8 text-left max-w-sm mx-auto bg-muted">
              <CardContent>
                <h3 className="font-semibold mb-2">{t('getLinkTitle')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('getLinkDesc')}
                </p>
                <form onSubmit={handleWaitlistSubmit}>
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm mb-4">
                      {error}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@business.com"
                      required
                      className="flex-1 border border-input rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <Button type="submit" disabled={loading}>
                      {loading ? t('sending') : t('send')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 max-w-sm mx-auto">
              <p className="text-green-800 font-medium">{t('sentTitle', { email })}</p>
              <p className="text-sm text-green-600 mt-1">{t('sentDesc', { email })}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <a
              href="https://github.com/ruvnet/zenda/releases/latest/download/Zenda-macOS.dmg"
              className="border border-border rounded-xl p-6 text-center hover:border-primary hover:shadow-md transition"
            >
              <svg className="mx-auto mb-2 h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="font-semibold">{t('macos')}</div>
              <div className="text-xs text-primary mt-1 font-medium">{t('downloadDmg')}</div>
            </a>
            <a
              href="https://github.com/ruvnet/zenda/releases/latest/download/Zenda-Windows.exe"
              className="border border-border rounded-xl p-6 text-center hover:border-primary hover:shadow-md transition"
            >
              <svg className="mx-auto mb-2 h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M3 12V6.75l6-1.32v6.48L3 12zm6.98.1l.02 6.5 6 .9V12.08l-6.02.02zM10 5.29L16 4v7.96h-6V5.29zM17 4.77L23 4v8h-6V4.77zM17 12.1L23 12v8l-6-.84V12.1zM3 12.98l6 .07v6.27l-6 .86V12.98z"/>
              </svg>
              <div className="font-semibold">{t('windows')}</div>
              <div className="text-xs text-primary mt-1 font-medium">{t('downloadExe')}</div>
            </a>
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            {t('alreadyHave')}{' '}
            <Link href="/login" className="text-primary underline">{t('signin')}</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
