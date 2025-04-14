import { cache } from 'react'

// Store dictionaries in memory
const dictionaryCache: Record<string, any> = {}

export const getDictionary = async (locale: string) => {
  // Always load fresh dictionary for each request (disabling cache)
  try {
    if (locale === 'ar') {
      return await import('@/locales/ar/common.json').then(module => module.default)
    } else {
      return await import('@/locales/en/common.json').then(module => module.default)
    }
  } catch (error) {
    console.error(`Failed to load dictionary for locale ${locale}:`, error)
    // Fallback to a safe minimal dictionary
    return { error: 'Failed to load translations' }
  }
}