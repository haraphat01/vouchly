import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  // Require auth to prevent abuse
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, slug } = await req.json()

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url is required' }, { status: 400 })
  }

  // Validate URL
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return NextResponse.json({ error: 'URL must be http or https' }, { status: 400 })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(parsed.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VouchlyBot/1.0; +https://vouchly.tech)',
        'Accept': 'text/html',
      },
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return NextResponse.json({ found: false, error: `Site returned ${response.status}` })
    }

    const html = await response.text()

    // Check for the embed script — look for embed.js AND the space slug
    const hasScript = html.includes('vouchly') && html.includes('embed.js')
    const hasSlug = slug ? html.includes(`data-space="${slug}"`) || html.includes(`data-space='${slug}'`) : true

    return NextResponse.json({ found: hasScript && hasSlug })
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === 'AbortError'
    return NextResponse.json({
      found: false,
      error: isTimeout ? 'Request timed out — your site took too long to respond.' : 'Could not reach your site.',
    })
  }
}
