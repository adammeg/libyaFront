interface Dictionary {
    [key: string]: string | Dictionary;
  }
  
  // Load dictionaries asynchronously
  export async function getDictionary(locale: string): Promise<Dictionary> {
    try {
      // First try to load the specific dictionary
      return import(`../locales/${locale}/common.json`).then(module => module.default);
    } catch (error) {
      console.error(`Failed to load dictionary for locale ${locale}:`, error);
      // Fallback to English if the specific locale fails
      return import('../locales/en/common.json').then(module => module.default);
    }
  }