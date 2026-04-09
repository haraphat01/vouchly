import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function isAdmin(req: NextRequest) {
  const adminCookie = req.cookies.get('admin_token')?.value
  const secret = process.env.ADMIN_SECRET
  return !!(secret && adminCookie === secret)
}

// ── PATCH — update user plan, space active status, or testimonial status ──
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { type, id, ...fields } = await req.json()
  if (!type || !id) return NextResponse.json({ error: 'type and id required' }, { status: 400 })

  try {
    if (type === 'user') {
      const allowed: Record<string, unknown> = {}
      if (fields.plan !== undefined) allowed.plan = fields.plan
      const { error } = await supabaseAdmin.from('profiles').update(allowed).eq('id', id)
      if (error) return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    if (type === 'space') {
      const allowed: Record<string, unknown> = {}
      if (fields.is_active !== undefined) allowed.is_active = fields.is_active
      if (fields.name !== undefined) allowed.name = fields.name
      const { error } = await supabaseAdmin.from('spaces').update(allowed).eq('id', id)
      if (error) return NextResponse.json({ error: 'Failed to update space' }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    if (type === 'testimonial') {
      const allowed: Record<string, unknown> = {}
      if (fields.status !== undefined) allowed.status = fields.status
      const { error } = await supabaseAdmin.from('testimonials').update(allowed).eq('id', id)
      if (error) return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── DELETE — delete user (cascade), space (cascade), or testimonial ──
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const id = searchParams.get('id')
  if (!type || !id) return NextResponse.json({ error: 'type and id required' }, { status: 400 })

  try {
    if (type === 'testimonial') {
      await supabaseAdmin.from('testimonials').delete().eq('id', id)
      return NextResponse.json({ ok: true })
    }

    if (type === 'space') {
      // Delete storage files in both buckets
      for (const bucket of ['images', 'videos'] as const) {
        const { data: files } = await supabaseAdmin.storage.from(bucket).list(id)
        if (files && files.length > 0) {
          await supabaseAdmin.storage.from(bucket).remove(files.map(f => `${id}/${f.name}`))
        }
      }
      await supabaseAdmin.from('testimonials').delete().eq('space_id', id)
      await supabaseAdmin.from('spaces').delete().eq('id', id)
      return NextResponse.json({ ok: true })
    }

    if (type === 'user') {
      // Get all user's spaces
      const { data: userSpaces } = await supabaseAdmin.from('spaces').select('id').eq('user_id', id)
      for (const space of userSpaces || []) {
        // Delete storage for each space
        for (const bucket of ['images', 'videos'] as const) {
          const { data: files } = await supabaseAdmin.storage.from(bucket).list(space.id)
          if (files && files.length > 0) {
            await supabaseAdmin.storage.from(bucket).remove(files.map(f => `${space.id}/${f.name}`))
          }
        }
        await supabaseAdmin.from('testimonials').delete().eq('space_id', space.id)
      }
      await supabaseAdmin.from('spaces').delete().eq('user_id', id)
      await supabaseAdmin.from('profiles').delete().eq('id', id)
      await supabaseAdmin.auth.admin.deleteUser(id)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
