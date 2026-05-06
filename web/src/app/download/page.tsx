'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'

export default function DownloadPage() {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/support/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Failed')
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav variant="simple" />

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="text-center max-w-lg">
          <h1 className="text-3xl font-bold mb-4">You&apos;re in! Here&apos;s your next step</h1>
          <p className="text-[var(--text-muted)] mb-8">
            Download the desktop app to connect your WhatsApp and start managing appointments.
          </p>

          {!sent ? (
            <div className="bg-[var(--bg-muted)] rounded-xl p-6 mb-8 text-left max-w-sm mx-auto">
              <h3 className="font-semibold mb-2">Get the download link</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                We&apos;ll email you the download link. Available for macOS and Windows.
              </p>
              <form onSubmit={handleWaitlistSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
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
                    className="flex-1 border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[var(--primary)] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 max-w-sm mx-auto">
              <p className="text-green-800 font-medium">Download link sent to {email}!</p>
              <p className="text-sm text-green-600 mt-1">Check your inbox. We&apos;ll also notify you when new versions are released.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <a
              href="https://github.com/ruvnet/zenda/releases/latest/download/Zenda-macOS.dmg"
              className="border border-[var(--border)] rounded-xl p-6 text-center hover:border-[var(--primary)] hover:shadow-md transition"
            >
              <svg className="mx-auto mb-2 h-8 w-8 text-gray-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="font-semibold">macOS</div>
              <div className="text-xs text-[var(--accent-green)] mt-1 font-medium">Download .dmg</div>
            </a>
            <a
              href="https://github.com/ruvnet/zenda/releases/latest/download/Zenda-Windows.exe"
              className="border border-[var(--border)] rounded-xl p-6 text-center hover:border-[var(--primary)] hover:shadow-md transition"
            >
              <svg className="mx-auto mb-2 h-8 w-8 text-gray-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M3 12V6.75l6-1.32v6.48L3 12zm6.98.1l.02 6.5 6 .9V12.08l-6.02.02zM10 5.29L16 4v7.96h-6V5.29zM17 4.77L23 4v8h-6V4.77zM17 12.1L23 12v8l-6-.84V12.1zM3 12.98l6 .07v6.27l-6 .86V12.98z"/>
              </svg>
              <div className="font-semibold">Windows</div>
              <div className="text-xs text-[var(--accent-green)] mt-1 font-medium">Download .exe</div>
            </a>
          </div>

          <p className="text-sm text-[var(--text-muted)] mt-8">
            Already have the app?{' '}
            <Link href="/login" className="text-[var(--primary)] underline">Sign in</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
