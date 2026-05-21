import { createFileRoute, redirect, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuthStore, getPostAuthRoute } from '@/stores/auth'
import { apiFetch } from '@/services/api-client'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/auth/signup')({
  beforeLoad: ({ context }) => {
    if (context.auth?.isAuthenticated) {
      throw redirect({ to: getPostAuthRoute() })
    }
  },
  component: SignupPage,
})

function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [language, setLanguage] = useState<'en' | 'es'>('en')
  const [error, setError] = useState<string | null>(null)
  const setAuth = useAuthStore((s) => s.setAuth)
  const setLoading = useAuthStore((s) => s.setLoading)
  const isLoading = useAuthStore((s) => s.isLoading)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const data = await apiFetch('/auth/signup', {
        method: 'POST',
        body: { name, email, password, businessName, language },
      })
      setAuth(data as Parameters<typeof setAuth>[0])
      navigate({ to: getPostAuthRoute() })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create your Zenda account</h1>
          <p className="text-muted-foreground">Set up your AI receptionist</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Your name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Maria Garcia"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="you@business.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Min 8 characters"
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Re-enter your password"
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="businessName" className="text-sm font-medium">Business name</label>
            <input
              id="businessName"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Luna Studio"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="language" className="text-sm font-medium">Language / Idioma</label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
