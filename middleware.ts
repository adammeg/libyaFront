// You can safely delete this file if you're not using any middleware functionality
// Or keep a minimal version:

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [], // No paths to match
}