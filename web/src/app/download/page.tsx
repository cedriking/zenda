import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Download — Zenda',
  description: 'Download the Zenda desktop app for macOS and Windows.',
}

export default function DownloadPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <Link href="/" className="text-2xl font-bold text-[var(--primary)]">Zenda</Link>
        <h1 className="text-3xl font-bold mt-8 mb-4">Download Zenda</h1>
        <p className="text-[var(--text-muted)] mb-8">
          Install the desktop app to connect your WhatsApp and start managing appointments.
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
          <a
            href="#"
            className="border border-[var(--border)] rounded-xl p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-3xl mb-2">&#63743;</div>
            <div className="font-semibold">macOS</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Coming soon</div>
          </a>
          <a
            href="#"
            className="border border-[var(--border)] rounded-xl p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-3xl mb-2">&#8862;</div>
            <div className="font-semibold">Windows</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Coming soon</div>
          </a>
        </div>

        <p className="text-sm text-[var(--text-muted)] mt-8">
          Already have an account?{' '}
          <Link href="/signup" className="text-[var(--primary)] underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
