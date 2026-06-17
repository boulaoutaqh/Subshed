import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // الصفحات العمومية - لا تحتاج redirect
  const publicPaths = ['/', '/privacy', '/terms', '/contact', '/sitemap.xml', '/robots.txt']

  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}