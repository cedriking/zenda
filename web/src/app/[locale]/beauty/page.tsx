import type { Metadata } from 'next'
import { VerticalPage, type VerticalPageConfig } from '@/components/vertical-page'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('verticals.beauty')
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
  }
}

export default async function BeautyPage() {
  const t = await getTranslations('verticals.beauty')

  const config: VerticalPageConfig = {
    slug: 'beauty',
    title: t('title'),
    headline: t('headline'),
    description: t('description'),
    featuresSectionTitle: t('featuresTitle'),
    features: [
      { title: t('feature1Title'), desc: t('feature1Desc') },
      { title: t('feature2Title'), desc: t('feature2Desc') },
      { title: t('feature3Title'), desc: t('feature3Desc') },
      { title: t('feature4Title'), desc: t('feature4Desc') },
      { title: t('feature5Title'), desc: t('feature5Desc') },
      { title: t('feature6Title'), desc: t('feature6Desc') },
    ],
  }

  return <VerticalPage config={config} />
}
