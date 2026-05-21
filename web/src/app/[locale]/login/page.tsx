import { LoginPageClient } from '@/components/page-login'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('auth')
  return {
    title: t('loginTitle'),
    description: t('loginDesc'),
  }
}

export default async function LoginPage() {
  return <LoginPageClient />
}
