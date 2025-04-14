import { NextRequest, NextResponse } from 'next/server'

// Define the list of supported locales
export const locales = ['en', 'ar']
export const defaultLocale = 'ar'

// Regex pattern to match all supported locales
const localePattern = new RegExp(`^/(${locales.join('|')})`)

// List of public paths that should bypass locale checks
const publicPaths = [
  '/_next',
  '/favicon.ico',
  '/api',
  '/images',
  '/static'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip public files
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // Check if URL has a supported locale prefix
  const pathnameHasLocale = localePattern.test(pathname)
  
  if (pathnameHasLocale) {
    return NextResponse.next()
  }
  
  // Determine preferred locale - from cookie, header, or default
  const locale = getLocaleFromRequest(request)
  
  // Create new URL with locale prefix and redirect
  const newUrl = new URL(`/${locale}${pathname}`, request.url)
  return NextResponse.redirect(newUrl)
}

function getLocaleFromRequest(request: NextRequest): string {
  // 1. Check cookie first
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value
  if (localeCookie && locales.includes(localeCookie)) {
    return localeCookie
  }
  
  // 2. Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') || ''
  
  // Simple parsing of Accept-Language
  for (const locale of locales) {
    if (acceptLanguage.includes(locale)) {
      return locale
    }
  }
  
  // 3. Fall back to default
  return defaultLocale
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}