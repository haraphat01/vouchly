import { NextRequest, NextResponse } from 'next/server'

const SUPPORTED = ['en', 'fr', 'es', 'de']

// Countries whose visitors should land on a non-English locale by default.
// AT is included since Austria is German-speaking; ambiguous multilingual
// countries (CH, BE, ...) are left out to fall through to Accept-Language.
const COUNTRY_TO_LOCALE: Record<string, string> = {
  DE: 'de',
  AT: 'de',
  FR: 'fr',
  ES: 'es',
}

function detectLocale(req: NextRequest): string {
  const country =
    req.headers.get('x-vercel-ip-country') ??
    req.headers.get('cf-ipcountry') ??
    req.headers.get('cloudfront-viewer-country') ??
    ''
  const fromCountry = COUNTRY_TO_LOCALE[country.toUpperCase()]
  if (fromCountry) return fromCountry

  const acceptLang = req.headers.get('accept-language') ?? ''
  const lang = acceptLang.split(',')[0].split('-')[0].toLowerCase()
  return SUPPORTED.includes(lang) ? lang : 'en'
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect /admin routes (except /admin/login itself)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminCookie = req.cookies.get('admin_token')?.value
    const secret = process.env.ADMIN_SECRET
    if (!secret || adminCookie !== secret) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/admin/login'
      return NextResponse.redirect(loginUrl)
    }
  }

  const res = NextResponse.next()

  // Auto-detect locale from visitor's country (IP geolocation), falling
  // back to browser Accept-Language, if no explicit choice has been made yet.
  if (!req.cookies.has('NEXT_LOCALE')) {
    const locale = detectLocale(req)
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
