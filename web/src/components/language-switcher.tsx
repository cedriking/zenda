'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { supportedLanguages } from '@/i18n/routing'
import { Globe } from 'lucide-react'

export function LanguageSwitcher({ variant = 'header' }: { variant?: 'header' | 'footer' }) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function handleChange(newLocale: string) {
    router.replace(pathname, { locale: newLocale })
  }

  const isDark = variant === 'footer'

  return (
    <div className="relative inline-flex items-center">
      <Globe className={`size-4 mr-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value)}
        className={`appearance-none bg-transparent text-sm font-medium cursor-pointer pr-1 outline-none ${
          isDark
            ? 'text-slate-400 hover:text-white'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        aria-label="Language"
      >
        {supportedLanguages.map((lang) => (
          <option key={lang.key} value={lang.key}>
            {lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  )
}
