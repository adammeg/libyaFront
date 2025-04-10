module.exports = {
  locales: ['en', 'ar'],
  defaultLocale: 'ar',
  pages: {
    '*': ['common'],
    '/': ['home'],
    '/blog': ['blog'],
    '/admin': ['admin'],
  },
  loadLocaleFrom: (locale, namespace) => 
    import(`./locales/${locale}/${namespace}`).then((m) => m.default),
} 