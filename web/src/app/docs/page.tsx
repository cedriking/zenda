import Link from 'next/link'
import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { DocsAnimations } from '@/components/docs-animations'

export const metadata: Metadata = {
  title: 'Documentation — Zenda',
  description: 'Getting started guides and documentation for Zenda AI receptionist.',
}

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <Nav variant="simple" />

      <main className="relative max-w-4xl mx-auto px-6 py-16 overflow-hidden">
        <div className="gradient-orb w-[300px] h-[300px] -top-20 right-0 bg-primary/10" />

        <DocsAnimations />
      </main>

      <Footer />
    </div>
  )
}
