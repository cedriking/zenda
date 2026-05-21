import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { DocsAnimations } from '@/components/docs-animations'

export const metadata: Metadata = {
  title: 'Documentation — Zenda',
  description: 'Getting started guides and documentation for Zenda AI receptionist.',
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-neutral-200 pt-16">
      <Nav variant="simple" />

      <main className="bg-white rounded-b-[2rem] shadow-2xl">
        <div className="relative max-w-4xl mx-auto px-6 py-16 overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] -top-20 bg-emerald-500/5 rounded-full" />
          <DocsAnimations />
        </div>
      </main>

      <Footer />
    </div>
  )
}
