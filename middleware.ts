// You can safely delete this file if you're not using any middleware functionality
// Or keep a minimal version:

import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = [
  '/_next',
  '/favicon.ico',
  '/api',
  '/images',
  '/static'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the request is for a non-localized path
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // Check if already has a locale
  const pathnameHasLocale = /^\/(?:en|ar)(?:\/|$)/.test(pathname)
  if (pathnameHasLocale) return NextResponse.next()
  
  // Detect user locale or default to Arabic
  const locale = detectLocale(request) || 'ar'
  
  // Redirect to the same URL but with locale prefix
  return NextResponse.redirect(
    new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
  )
}

function detectLocale(request: NextRequest) {
  // Read Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') || ''
  
  // Simple detection - can be more sophisticated
  if (acceptLanguage.includes('ar')) return 'ar'
  if (acceptLanguage.includes('en')) return 'en'
  
  // Default to Arabic
  return 'ar'
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}