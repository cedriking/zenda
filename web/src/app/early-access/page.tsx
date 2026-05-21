'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api-client'
import { PartyPopper } from 'lucide-react'

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
    <div className="min-h-screen flex flex-col">
      <Nav variant="simple" />

      <main className="flex-1 max-w-lg mx-auto px-6 py-20 text-center">
        {!submitted ? (
          <>
            <div className="inline-block bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              Founding Member Early Access
            </div>
            <h1 className="text-4xl font-bold mb-4">Be first in line</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Join the waitlist for exclusive founding member pricing. Limited spots available.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} placeholder="you@business.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Business Type</label>
                <select value={businessType} onChange={e => setBusinessType(e.target.value)} className={inputClass}>
                  <option value="">Select your industry</option>
                  <option value="beauty">Beauty Salon</option>
                  <option value="wellness">Wellness / Spa</option>
                  <option value="health">Health Clinic</option>
                  <option value="fitness">Fitness Studio</option>
                  <option value="coaching">Coaching</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 text-sm">
                {loading ? 'Joining...' : 'Join the Waitlist'}
              </Button>
            </form>
          </>
        ) : (
          <>
            <PartyPopper className="size-12 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">You&apos;re on the list!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              We&apos;ll reach out to {email} when it&apos;s your turn. Founding members get special pricing.
            </p>
            <Link href="/" className="text-primary underline">
              Back to homepage
            </Link>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
