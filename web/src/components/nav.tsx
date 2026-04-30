'use client'

import { useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#faq', label: 'FAQ' },
]

export function Nav({ variant = 'home' }: { variant?: 'home' | 'simple' }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  if (variant === 'simple') {
    return (
      <nav className="border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[var(--primary)]">Zenda</Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition hidden sm:inline">Log in</Link>
            <Link href="/signup" className="bg-[var(--primary)] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-[var(--border)] z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[var(--primary)]">Zenda</Link>

        {/* Desktop links */}
        <div className="hidden md:flex gap-8 text-sm text-[var(--text-muted)]">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="hover:text-[var(--text)] transition">{l.label}</Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/signup" className="bg-[var(--primary)] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition">
            Get Started
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 -mr-2 text-[var(--text)]"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-white">
          <div className="px-6 py-4 space-y-3">
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition py-1"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition py-1"
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
