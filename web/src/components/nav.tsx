'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Menu, X, MessageCircle } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="relative">
        <MessageCircle className="size-7 text-emerald-500 fill-emerald-500 stroke-white" strokeWidth={2} />
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
      </div>
      <span className="text-xl font-bold text-slate-900">Zenda</span>
    </Link>
  )
}

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
    >
      {children}
    </Link>
  )
}

function GhostButton({ href, children, dark = false }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
        dark
          ? 'text-slate-300 hover:text-white hover:bg-white/10'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      {children}
    </Link>
  )
}

export function Nav({ variant = 'home' }: { variant?: 'home' | 'simple' }) {
  const t = useTranslations('nav')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const NAV_LINKS = [
    { href: '/features', label: t('features'), hash: false },
    { href: '/pricing', label: t('pricing'), hash: false },
    { href: '#how-it-works', label: t('howItWorks'), hash: true },
    { href: '#faq', label: t('faq'), hash: true },
  ] as const

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (variant === 'simple') {
    return (
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-slate-200 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <GhostButton href="/login">{t('login')}</GhostButton>
            <PrimaryButton href="/signup">{t('getStarted')}</PrimaryButton>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm'
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />

        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(l => (
            l.hash ? (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                {l.label}
              </Link>
            )
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <GhostButton href="/login">{t('login')}</GhostButton>
          <PrimaryButton href="/signup">{t('getStarted')}</PrimaryButton>
        </div>

        <button
          className="md:hidden p-2 text-slate-600"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={t('menuToggle')}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 pb-4">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map(l => (
              l.hash ? (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm text-slate-600 hover:text-slate-900 py-2 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-slate-600 hover:text-slate-900 py-2 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              )
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <LanguageSwitcher />
              <GhostButton href="/login">{t('login')}</GhostButton>
              <PrimaryButton href="/signup">{t('getStarted')}</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
