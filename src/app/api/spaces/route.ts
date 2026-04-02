import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { PLANS } from '@/lib/utils'
import { requireAuth, requireSpaceOwner } from '@/lib/apiAuth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  // Only return spaces belonging to the authenticated user — ignore userId param
  const { data, error } = await supabaseAdmin
    .from('spaces')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to load spaces' }, { status: 500 })
  return NextResponse.json({ spaces: data })
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (auth instanceof NextResponse) return auth

    // Check space limit against plan
    const { data: profile } = await supabaseAdmin.from('profiles').select('plan').eq('id', auth.user.id).single()
    const plan = (profile?.plan || 'free') as keyof typeof PLANS
    const planConfig = PLANS[plan]

    if (planConfig.spaces !== -1) {
      const { count } = await supabaseAdmin.from('spaces').select('id', { count: 'exact', head: true }).eq('user_id', auth.user.id)
      if ((count || 0) >= planConfig.spaces) {
        return NextResponse.json(
          { error: `Your ${planConfig.name} plan allows ${planConfig.spaces} space${planConfig.spaces !== 1 ? 's' : ''}. Upgrade to create more.` },
          { status: 403 },
        )
      }
    }

    // Whitelist allowed fields — never trust the full body
    const body = await req.json()
    const allowed = {
      name: body.name,
      slug: body.slug,
      description: body.description,
      header_title: body.header_title,
      header_message: body.header_message,
      theme_color: body.theme_color,
      collect_text: body.collect_text,
      collect_video: body.collect_video,
      questions: body.questions ?? [],
      is_active: body.is_active,
      rating_required: body.rating_required,
      auto_approve: body.auto_approve,
    }

    const { data, error } = await supabaseAdmin.from('spaces').insert({ ...allowed, user_id: auth.user.id }).select().single()
    if (error) return NextResponse.json({ error: 'Failed to create space' }, { status: 500 })
    return NextResponse.json({ space: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (auth instanceof NextResponse) return auth

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const ownerCheck = await requireSpaceOwner(id, auth.user.id)
    if (ownerCheck instanceof NextResponse) return ownerCheck

    // Delete all storage files for this space from both buckets
    for (const bucket of ['images', 'videos'] as const) {
      const { data: files } = await supabaseAdmin.storage.from(bucket).list(id)
      if (files && files.length > 0) {
        const paths = files.map(f => `${id}/${f.name}`)
        await supabaseAdmin.storage.from(bucket).remove(paths)
      }
    }

    // Delete all testimonials for this space
    await supabaseAdmin.from('testimonials').delete().eq('space_id', id)

    // Delete the space itself
    const { error } = await supabaseAdmin.from('spaces').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'Failed to delete space' }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (auth instanceof NextResponse) return auth

    const body = await req.json()
    const { id } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    // Verify the caller owns this space
    const ownerCheck = await requireSpaceOwner(id, auth.user.id)
    if (ownerCheck instanceof NextResponse) return ownerCheck

    // Whitelist updatable fields — prevents mass assignment
    const updates = {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.header_title !== undefined && { header_title: body.header_title }),
      ...(body.header_message !== undefined && { header_message: body.header_message }),
      ...(body.theme_color !== undefined && { theme_color: body.theme_color }),
      ...(body.collect_text !== undefined && { collect_text: body.collect_text }),
      ...(body.collect_video !== undefined && { collect_video: body.collect_video }),
      ...(body.questions !== undefined && { questions: body.questions }),
      ...(body.is_active !== undefined && { is_active: body.is_active }),
      ...(body.rating_required !== undefined && { rating_required: body.rating_required }),
      ...(body.auto_approve !== undefined && { auto_approve: body.auto_approve }),
    }

    const { data, error } = await supabaseAdmin.from('spaces').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: 'Failed to update space' }, { status: 500 })
    return NextResponse.json({ space: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
