import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { DocsAnimations } from '@/components/docs-animations'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('docs')
  return {
    title: t('title'),
    description: t('desc'),
  }
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
