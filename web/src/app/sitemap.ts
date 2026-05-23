import { MetadataRoute } from 'next'
import { locales } from '@/i18n/routing'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://zenda.ai'
  const routes = [
    '',
    '/pricing',
    '/signup',
    '/download',
    '/docs',
    '/beauty',
    '/wellness',
    '/clinics',
    '/legal/privacy',
    '/legal/terms',
  ]

  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === '' ? 'weekly' : route.includes('legal') ? 'yearly' : 'monthly',
      priority: route === '' ? 1 : route === '/pricing' ? 0.9 : route.includes('legal') ? 0.3 : 0.6,
    }))
  )
}
