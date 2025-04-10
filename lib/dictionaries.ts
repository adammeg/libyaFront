interface Dictionary {
    [key: string]: string | Dictionary;
  }
  
  // Load dictionaries asynchronously
  export async function getDictionary(locale: string): Promise<Dictionary> {
    return import(`../locales/${locale}/common.json`).then(module => module.default);
  }