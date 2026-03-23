import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendNewTestimonialNotification, sendTestimonialApprovedEmail } from '@/lib/email'

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
    const { space_id, type, submitter_name, submitter_email, submitter_role, submitter_company, content, rating } = body
    if (!space_id || !submitter_name) return NextResponse.json({ error: 'space_id and submitter_name are required' }, { status: 400 })

    const { data: testimonial, error } = await supabaseAdmin.from('testimonials').insert({
      space_id, type: type || 'text', submitter_name, submitter_email, submitter_role, submitter_company, content, rating, status: 'pending',
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Notify space owner via Resend
    try {
      const { data: space } = await supabaseAdmin.from('spaces').select('name, user_id').eq('id', space_id).single()
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

    // If just approved AND submitter has email, notify them
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
