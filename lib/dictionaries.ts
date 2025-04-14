import { cache } from 'react'

export const dictionaries = {
  en: () => import('@/locales/en/common.json').then(module => module.default),
  ar: () => import('@/locales/ar/common.json').then(module => module.default),
}

export const getDictionary = cache(async (locale: string) => {
  try {
    // Use the appropriate dictionary loader or fallback to English
    const loadDictionary = dictionaries[locale as keyof typeof dictionaries] || dictionaries.en
    return await loadDictionary()
  } catch (error) {
    console.error(`Failed to load dictionary for locale ${locale}:`, error)
    // Fallback to a safe minimal dictionary
    return { error: 'Failed to load translations' }
  }
})