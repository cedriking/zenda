import { DownloadPageClient } from '@/components/page-download'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('download')
  return {
    title: t('title'),
    description: t('desc'),
  }
}

export default async function DownloadPage() {
  return <DownloadPageClient />
}
