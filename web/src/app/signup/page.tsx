'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { apiFetch, ApiError } from '@/lib/api-client'

export default function SignupPage() {
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
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, businessName }),
      })
      window.location.href = '/download'
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full border border-input rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"

  return (
    <div className="min-h-screen flex flex-col">
      <Nav variant="simple" />

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mt-6 mb-2">Create your account</h1>
            <p className="text-muted-foreground">Start your 14-day free trial. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className={inputClass} placeholder="Your name" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Business Name</label>
              <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} required className={inputClass} placeholder="Your business name" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} placeholder="you@business.com" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className={inputClass} placeholder="At least 8 characters" />
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
                    {passwordStrength <= 1 ? 'Weak' : passwordStrength <= 2 ? 'Fair' : passwordStrength <= 3 ? 'Good' : 'Strong'}
                  </p>
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 text-sm">
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By signing up, you agree to our{' '}
              <Link href="/legal/terms" className="underline">Terms of Service</Link> and{' '}
              <Link href="/legal/privacy" className="underline">Privacy Policy</Link>.
            </p>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary underline">Log in</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
