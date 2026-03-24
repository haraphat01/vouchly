import { NextRequest, NextResponse } from 'next/server'

const SUPPORTED = ['en', 'fr', 'es']

export function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Auto-detect locale from browser Accept-Language if no cookie yet
  if (!req.cookies.has('NEXT_LOCALE')) {
    const acceptLang = req.headers.get('accept-language') ?? ''
    const lang = acceptLang.split(',')[0].split('-')[0].toLowerCase()
    const locale = SUPPORTED.includes(lang) ? lang : 'en'
    res.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon|.*\\..*).*)'],
}
