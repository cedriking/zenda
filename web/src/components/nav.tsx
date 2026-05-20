'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#faq', label: 'FAQ' },
]

export function Nav({ variant = 'home' }: { variant?: 'home' | 'simple' }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (variant === 'simple') {
    return (
      <nav className={`border-b border-border transition-all duration-300 ${scrolled ? 'glass' : 'bg-background'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold gradient-text">Zenda</Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition hidden sm:inline">Log in</Link>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled
        ? 'glass border-b border-border/50 shadow-sm'
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold gradient-text">Zenda</Link>

        {/* Desktop links */}
        <div className="hidden md:flex gap-8 text-sm text-muted-foreground">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="hover:text-foreground transition">{l.label}</Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition hidden sm:inline">Log in</Link>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/signup">Get Started</Link>
          </Button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 -mr-2 text-foreground"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border glass">
          <div className="px-6 py-4 space-y-3">
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block text-sm text-muted-foreground hover:text-foreground transition py-1"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-muted-foreground hover:text-foreground transition py-1"
            >
              Log in
            </Link>
            <Button asChild className="w-full mt-2">
              <Link href="/signup" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}
