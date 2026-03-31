import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendNewTestimonialNotification, sendTestimonialApprovedEmail } from '@/lib/email'
import { PLANS } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const spaceId = searchParams.get('spaceId')
  const status = searchParams.get('status')
  if (!spaceId) return NextResponse.json({ error: 'spaceId required' }, { status: 400 })
  let query = supabaseAdmin.from('testimonials').select('*').eq('space_id', spaceId).order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ testimonials: data })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { space_id, type, submitter_name, submitter_email, submitter_role, submitter_company, content, video_url, image_url, rating, answers, campaign, _hp } = body
    if (!space_id || !submitter_name) return NextResponse.json({ error: 'space_id and submitter_name are required' }, { status: 400 })

    // Honeypot check — bots fill hidden fields, humans don't
    if (_hp) return NextResponse.json({ testimonial: { id: 'spam' } }) // silent success to fool bots

    // Look up the space and its owner's plan to enforce limits
    const { data: space } = await supabaseAdmin.from('spaces').select('name, user_id, collect_video, auto_approve, rating_required').eq('id', space_id).single()

    if (space) {
      const { data: ownerProfile } = await supabaseAdmin.from('profiles').select('plan').eq('id', space.user_id).single()
      const plan = (ownerProfile?.plan || 'free') as keyof typeof PLANS
      const planConfig = PLANS[plan]

      // Block video submissions if the owner's plan doesn't include video
      if (type === 'video' && !planConfig.video) {
        return NextResponse.json({ error: 'Video testimonials are not available on this plan.' }, { status: 403 })
      }

      // Enforce testimonial limit for free plan
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
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Notify space owner
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
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { data: testimonial, error } = await supabaseAdmin.from('testimonials').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

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
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const { error } = await supabaseAdmin.from('testimonials').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
