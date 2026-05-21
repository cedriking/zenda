interface LanguageDef {
  key: string
  nativeName: string
  englishName: string
}

const supportedLanguages: LanguageDef[] = [
  { key: 'en', nativeName: 'English', englishName: 'English' },
  { key: 'es', nativeName: 'Español', englishName: 'Spanish' },
  { key: 'ar', nativeName: 'العربية', englishName: 'Arabic' },
  { key: 'fr', nativeName: 'Français', englishName: 'French' },
  { key: 'de', nativeName: 'Deutsch', englishName: 'German' },
  { key: 'ru', nativeName: 'Русский', englishName: 'Russian' },
  { key: 'zh', nativeName: '中文', englishName: 'Chinese' },
  { key: 'ja', nativeName: '日本語', englishName: 'Japanese' },
  { key: 'ko', nativeName: '한국어', englishName: 'Korean' },
]

export default supportedLanguages
