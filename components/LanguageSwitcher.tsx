'use client'

import { useLanguage } from '@/lib/i18n'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      title={language === 'en' ? 'Switch to Bengali' : 'Switch to English'}
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium text-sm">
        {language === 'en' ? 'বাংলা' : 'English'}
      </span>
    </button>
  )
}

// Compact version for mobile
export function LanguageSwitcherCompact() {
  const { language, setLanguage } = useLanguage()

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
      className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      title={language === 'en' ? 'Switch to Bengali' : 'Switch to English'}
    >
      <span className="text-xs font-bold">
        {language === 'en' ? 'বা' : 'EN'}
      </span>
    </button>
  )
}
