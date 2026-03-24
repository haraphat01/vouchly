import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { PLANS } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const spaceSlug = searchParams.get('space')
  const limit = parseInt(searchParams.get('limit') || '6', 10)

  if (!spaceSlug) {
    return NextResponse.json({ error: 'space slug required' }, { status: 400 })
  }

  const { data: space } = await supabaseAdmin
    .from('spaces')
    .select('*')
    .eq('slug', spaceSlug)
    .single()

  if (!space) {
    return NextResponse.json({ error: 'Space not found' }, { status: 404 })
  }

  const { data: testimonials } = await supabaseAdmin
    .from('testimonials')
    .select('id, submitter_name, submitter_role, submitter_company, content, ai_enhanced_content, rating, type, video_url, is_featured, created_at')
    .eq('space_id', space.id)
    .eq('status', 'approved')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  const { data: ownerProfile } = await supabaseAdmin.from('profiles').select('plan').eq('id', space.user_id).single()
  const plan = (ownerProfile?.plan || 'free') as keyof typeof PLANS
  const removeBranding = PLANS[plan].removeBranding

  return NextResponse.json({
    testimonials: testimonials || [],
    space: { name: space.name, theme_color: space.theme_color, slug: space.slug, removeBranding },
  })
}
