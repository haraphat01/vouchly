import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendNewTestimonialNotification, sendTestimonialApprovedEmail } from '@/lib/email'
import { PLANS } from '@/lib/utils'
import { requireAuth, requireSpaceOwner, requireTestimonialOwner } from '@/lib/apiAuth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(req.url)
  const spaceId = searchParams.get('spaceId')
  const status = searchParams.get('status')
  if (!spaceId) return NextResponse.json({ error: 'spaceId required' }, { status: 400 })

  // Verify the caller owns this space before returning its testimonials
  const ownerCheck = await requireSpaceOwner(spaceId, auth.user.id)
  if (ownerCheck instanceof NextResponse) return ownerCheck

  let query = supabaseAdmin.from('testimonials').select('*').eq('space_id', spaceId).order('created_at', { ascending: false })
  if (status) query = query.eq('status', status as 'pending' | 'approved' | 'archived')

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Failed to load testimonials' }, { status: 500 })
  return NextResponse.json({ testimonials: data })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { space_id, type, submitter_name, submitter_email, submitter_role, submitter_company, content, video_url, image_url, rating, answers, campaign, _hp } = body
    if (!space_id || !submitter_name) return NextResponse.json({ error: 'space_id and submitter_name are required' }, { status: 400 })

    // Honeypot — bots fill hidden fields, humans don't
    if (_hp) return NextResponse.json({ testimonial: { id: 'spam' } })

    // Look up the space and its owner's plan to enforce limits
    const { data: space } = await supabaseAdmin.from('spaces').select('name, user_id, collect_video, auto_approve, rating_required').eq('id', space_id).single()

    if (space) {
      const { data: ownerProfile } = await supabaseAdmin.from('profiles').select('plan').eq('id', space.user_id).single()
      const plan = (ownerProfile?.plan || 'free') as keyof typeof PLANS
      const planConfig = PLANS[plan]

      if (type === 'video' && !planConfig.video) {
        return NextResponse.json({ error: 'Video testimonials are not available on this plan.' }, { status: 403 })
      }

      if (planConfig.testimonials !== -1) {
        const { data: allSpaces } = await supabaseAdmin.from('spaces').select('id').eq('user_id', space.user_id)
        const spaceIds = (allSpaces || []).map(s => s.id)
        const { count } = await supabaseAdmin.from('testimonials').select('id', { count: 'exact', head: true }).in('space_id', spaceIds)
        if ((count || 0) >= planConfig.testimonials) {
          return NextResponse.json({ error: `Testimonial limit of ${planConfig.testimonials} reached for this account.` }, { status: 403 })
        }
      }
    }

    const status = space?.auto_approve ? 'approved' : 'pending'
    const { data: testimonial, error } = await supabaseAdmin.from('testimonials').insert({
      space_id, type: type || 'text', submitter_name, submitter_email, submitter_role, submitter_company, content, video_url, image_url, rating, answers: answers || null, campaign: campaign || null, status,
    }).select().single()
    if (error) return NextResponse.json({ error: 'Submission failed' }, { status: 500 })

    try {
      if (space) {
        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(space.user_id)
        if (user?.email) {
          const ownerName = (user.user_metadata?.full_name as string) || user.email.split('@')[0]
          const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/spaces/${space_id}`
          await sendNewTestimonialNotification(
            user.email, ownerName, space.name,
            { submitter_name, submitter_role, content, rating, type: type || 'text' },
            reviewUrl,
          )
        }
      }
    } catch (notifyErr) { console.error('Owner notification failed:', notifyErr) }

    return NextResponse.json({ testimonial })
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

    // Verify caller owns the space containing this testimonial
    const ownerCheck = await requireTestimonialOwner(id, auth.user.id)
    if (ownerCheck instanceof NextResponse) return ownerCheck

    // Whitelist — only allow these fields from this endpoint
    const updates = {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.ai_enhanced_content !== undefined && { ai_enhanced_content: body.ai_enhanced_content }),
    }

    const { data: testimonial, error } = await supabaseAdmin.from('testimonials').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 })

    if (updates.status === 'approved' && testimonial?.submitter_email) {
      try {
        const { data: space } = await supabaseAdmin.from('spaces').select('name, slug').eq('id', testimonial.space_id).single()
        if (space) {
          const wallUrl = `${process.env.NEXT_PUBLIC_APP_URL}/wall/${space.slug}`
          await sendTestimonialApprovedEmail(testimonial.submitter_email, testimonial.submitter_name, space.name, wallUrl)
        }
      } catch (notifyErr) { console.error('Approved notification failed:', notifyErr) }
    }

    return NextResponse.json({ testimonial })
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

    // Verify caller owns the space containing this testimonial
    const ownerCheck = await requireTestimonialOwner(id, auth.user.id)
    if (ownerCheck instanceof NextResponse) return ownerCheck

    const { error } = await supabaseAdmin.from('testimonials').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
