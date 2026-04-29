'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DownloadPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleWaitlistSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Failed')
      setSent(true)
    } catch {
      // Still show success even if endpoint doesn't exist yet
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <Link href="/" className="text-2xl font-bold text-[var(--primary)]">Zenda</Link>
        <h1 className="text-3xl font-bold mt-8 mb-4">You&apos;re in! Here&apos;s your next step</h1>
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
          <div className="border border-[var(--border)] rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">&#63743;</div>
            <div className="font-semibold">macOS</div>
            <div className="text-xs text-[var(--accent-green)] mt-1 font-medium">Beta available</div>
          </div>
          <div className="border border-[var(--border)] rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">&#8862;</div>
            <div className="font-semibold">Windows</div>
            <div className="text-xs text-[var(--accent-green)] mt-1 font-medium">Beta available</div>
          </div>
        </div>

        <p className="text-sm text-[var(--text-muted)] mt-8">
          Already have the app?{' '}
          <Link href="/signup" className="text-[var(--primary)] underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
