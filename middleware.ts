// You can safely delete this file if you're not using any middleware functionality
// Or keep a minimal version:

import { NextRequest, NextResponse } from 'next/server'
import acceptLanguage from 'accept-language'

// Configure the languages you want to support
acceptLanguage.languages(['en', 'ar'])

export const config = {
  // Match only the paths that should be internationalized
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}

export function middleware(request: NextRequest) {
  // Check if there is a supported locale in the pathname
  const pathname = request.nextUrl.pathname
  
  // Check if the pathname already has a locale
  const pathnameHasLocale = /^\/(?:en|ar)(?:\/|$)/.test(pathname)
  
  if (pathnameHasLocale) return NextResponse.next()
  
  // Redirect if there is no locale
  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`
  
  return NextResponse.redirect(request.nextUrl)
}

function getLocale(request: NextRequest): string {
  // Get accept-language from header
  const acceptLang = request.headers.get('accept-language') || 'ar'
  
  // Get the preferred locale, or fallback to Arabic
  return acceptLanguage.get(acceptLang) || 'ar'
}