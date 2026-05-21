import { SignupPageClient } from '@/components/page-signup'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('auth')
  return {
    title: t('signupTitle'),
    description: t('signupDesc'),
  }
}

export default async function SignupPage() {
  return <SignupPageClient />
}
