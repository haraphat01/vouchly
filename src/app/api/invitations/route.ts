import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendTestimonialInviteEmail } from '@/lib/email'
import { v4 as uuidv4 } from 'uuid'
import { requireAuth, requireSpaceOwner } from '@/lib/apiAuth'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (auth instanceof NextResponse) return auth

    const { spaceId, email, name, customMessage } = await req.json()
    if (!spaceId || !email) return NextResponse.json({ error: 'spaceId and email are required' }, { status: 400 })

    // Verify the caller owns this space before sending invites on their behalf
    const ownerCheck = await requireSpaceOwner(spaceId, auth.user.id)
    if (ownerCheck instanceof NextResponse) return ownerCheck

    const { space: spaceRef } = ownerCheck as { space: { id: string; user_id: string } }

    const { data: space } = await supabaseAdmin.from('spaces').select('slug, name').eq('id', spaceId).single()
    if (!space) return NextResponse.json({ error: 'Space not found' }, { status: 404 })

    const token = uuidv4()
    const { error: dbError } = await supabaseAdmin.from('invitations').insert({ space_id: spaceId, email, name: name || null, token, status: 'sent' })
    if (dbError) return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })

    const collectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/collect/${space.slug}?token=${token}`
    const { error: emailError } = await sendTestimonialInviteEmail(email, name || '', space.name, collectUrl, customMessage)
    if (emailError) console.error('Failed to send invitation email:', emailError)

    return NextResponse.json({ success: true, collectUrl, token })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (auth instanceof NextResponse) return auth

    const { searchParams } = new URL(req.url)
    const spaceId = searchParams.get('spaceId')
    if (!spaceId) return NextResponse.json({ error: 'spaceId required' }, { status: 400 })

    // Verify the caller owns this space before returning its invitations
    const ownerCheck = await requireSpaceOwner(spaceId, auth.user.id)
    if (ownerCheck instanceof NextResponse) return ownerCheck

    const { data, error } = await supabaseAdmin.from('invitations').select('*').eq('space_id', spaceId).order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: 'Failed to load invitations' }, { status: 500 })
    return NextResponse.json({ invitations: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
