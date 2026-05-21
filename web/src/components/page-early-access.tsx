'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api-client'
import { PartyPopper } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function EarlyAccessPageClient() {
  const t = useTranslations('earlyAccess')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await apiFetch('/support/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email, name, businessType }),
      })
      setSubmitted(true)
    } catch { /* */ }
    setLoading(false)
  }

  const inputClass = "w-full border border-input rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Nav variant="simple" />

      <main className="flex-1 max-w-lg mx-auto px-6 py-20 text-center">
        {!submitted ? (
          <>
            <div className="inline-block bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              {t('badge')}
            </div>
            <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t('desc')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('nameLabel')}</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder={t('namePlaceholder')} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('emailLabel')}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} placeholder="you@business.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('businessTypeLabel')}</label>
                <select value={businessType} onChange={e => setBusinessType(e.target.value)} className={inputClass}>
                  <option value="">{t('selectIndustry')}</option>
                  <option value="beauty">{t('beauty')}</option>
                  <option value="wellness">{t('wellness')}</option>
                  <option value="health">{t('health')}</option>
                  <option value="fitness">{t('fitness')}</option>
                  <option value="coaching">{t('coaching')}</option>
                  <option value="other">{t('other')}</option>
                </select>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 text-sm">
                {loading ? t('joining') : t('joinButton')}
              </Button>
            </form>
          </>
        ) : (
          <>
            <PartyPopper className="size-12 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">{t('successTitle')}</h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t('successDesc', { email })}
            </p>
            <Link href="/" className="text-primary underline">
              {t('backHome')}
            </Link>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
