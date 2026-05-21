import { useTranslation } from 'react-i18next'
import { setAppLanguage } from '@/actions/language'
import langs from '@/localization/langs'

export default function LangToggle() {
  const { i18n } = useTranslation()
  const currentLang = i18n.language

  return (
    <select
      value={currentLang}
      onChange={(e) => setAppLanguage(e.target.value, i18n)}
      className="h-9 rounded-md border border-input bg-transparent px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      aria-label="Language"
    >
      {langs.map((lang) => (
        <option key={lang.key} value={lang.key}>
          {lang.nativeName}
        </option>
      ))}
    </select>
  )
}
