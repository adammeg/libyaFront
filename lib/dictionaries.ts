import { cache } from 'react'

export interface Dictionary {
  navbar?: {
    home: string;
    vehicles: string;
    blog: string;
    contact: string;
    account: string;
    language: string;
  };
  footer?: {
    quickLinks: string;
    contactUs: string;
    copyright: string;
  };
  buttons?: {
    search: string;
    readMore: string;
    viewAll: string;
    testDrive: string;
  };
  home?: {
    title: string;
    subtitle: string;
    searchVehicles: string;
    featuredBrands: {
      title: string;
      viewAll: string;
    };
    latestNews: {
      title: string;
      viewAll: string;
    };
  };
  vehicles?: {
    title: string;
    description: string;
    newVehicles: string;
    usedVehicles: string;
    sedan: string;
    suv: string;
    pickup: string;
    berlin: string;
    allBrands: string;
  };
  blog?: {
    title: string;
    description: string;
  };
  contact?: {
    title: string;
    description: string;
    infoTitle: string;
    formTitle: string;
    formPlaceholder: string;
  };
  common?: {
    buttons: {
      search: string;
      readMore: string;
      viewAll: string;
    };
  };
  error?: string;
}

// Store dictionaries in memory
const dictionaryCache: Record<string, Dictionary> = {}

export const getDictionary = async (locale: string): Promise<Dictionary> => {
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