import { EarlyAccessPageClient } from '@/components/page-early-access'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('earlyAccess')
  return {
    title: t('title'),
    description: t('desc'),
  }
}

export default async function EarlyAccessPage() {
  return <EarlyAccessPageClient />
}
