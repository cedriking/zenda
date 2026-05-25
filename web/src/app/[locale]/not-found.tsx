import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Nav } from '@/components/nav'

export default function NotFound() {
  const t = useTranslations('notFound')

  return (
    <div className="flex min-h-screen flex-col pt-16">
      <Nav variant="simple" />

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
        <div className="max-w-md text-center">
          <p className="mb-2 font-semibold text-emerald-500 text-sm uppercase tracking-wide">
            404
          </p>
          <h1 className="mb-4 font-bold text-4xl tracking-tight text-slate-900">
            {t('title')}
          </h1>
          <p className="mb-8 text-lg text-slate-500">
            {t('description')}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
          >
            {t('backHome')}
          </Link>
        </div>
      </main>
    </div>
  )
}
