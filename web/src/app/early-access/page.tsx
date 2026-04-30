'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'

export default function EarlyAccessPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/support/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, businessType }),
      })
      setSubmitted(true)
    } catch { /* */ }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav variant="simple" />

      <main className="flex-1 max-w-lg mx-auto px-6 py-20 text-center">
        {!submitted ? (
          <>
            <div className="inline-block bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              Founding Member Early Access
            </div>
            <h1 className="text-4xl font-bold mb-4">Be first in line</h1>
            <p className="text-lg text-[var(--text-muted)] mb-8">
              Join the waitlist for exclusive founding member pricing. Limited spots available.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="you@business.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Business Type</label>
                <select
                  value={businessType}
                  onChange={e => setBusinessType(e.target.value)}
                  className="w-full border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="">Select your industry</option>
                  <option value="beauty">Beauty Salon</option>
                  <option value="wellness">Wellness / Spa</option>
                  <option value="health">Health Clinic</option>
                  <option value="fitness">Fitness Studio</option>
                  <option value="coaching">Coaching</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-medium hover:bg-[var(--primary-dark)] disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join the Waitlist'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-5xl mb-6">&#127881;</div>
            <h1 className="text-3xl font-bold mb-4">You&apos;re on the list!</h1>
            <p className="text-lg text-[var(--text-muted)] mb-8">
              We&apos;ll reach out to {email} when it&apos;s your turn. Founding members get special pricing.
            </p>
            <Link href="/" className="text-[var(--primary)] underline">
              Back to homepage
            </Link>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
