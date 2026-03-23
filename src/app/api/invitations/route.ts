import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendTestimonialInviteEmail } from '@/lib/email'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const { spaceId, email, name, customMessage } = await req.json()
    if (!spaceId || !email) return NextResponse.json({ error: 'spaceId and email are required' }, { status: 400 })
    const token = uuidv4()
    const { data: space } = await supabaseAdmin.from('spaces').select('id, slug, name, user_id').eq('id', spaceId).single()
    if (!space) return NextResponse.json({ error: 'Space not found' }, { status: 404 })
    const { error: dbError } = await supabaseAdmin.from('invitations').insert({ space_id: spaceId, email, name: name || null, token, status: 'sent' })
    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
    const collectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/collect/${space.slug}?token=${token}`
    const { error: emailError } = await sendTestimonialInviteEmail(email, name || '', space.name, collectUrl, customMessage)
    if (emailError) console.error('Failed to send invitation email:', emailError)
    return NextResponse.json({ success: true, collectUrl, token })
  } catch (error) {
    console.error('Invitation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const spaceId = searchParams.get('spaceId')
  if (!spaceId) return NextResponse.json({ error: 'spaceId required' }, { status: 400 })
  const { data, error } = await supabaseAdmin.from('invitations').select('*').eq('space_id', spaceId).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ invitations: data })
}
