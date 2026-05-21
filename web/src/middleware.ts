import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: [
    '/',
    '/(es|en|ar|fr|de|ru|zh|ja|ko)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
