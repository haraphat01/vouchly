import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

/**
 * Extracts and validates the Bearer token from the Authorization header.
 * Returns the authenticated user or a 401 response.
 *
 * Usage in a route:
 *   const result = await requireAuth(req)
 *   if (result instanceof NextResponse) return result
 *   const { user } = result
 */
export async function requireAuth(req: NextRequest): Promise<{ user: User } | NextResponse> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '').trim()
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return { user }
}

/**
 * Verifies the authenticated user owns the given space.
 * Returns the space or a 403/404 response.
 */
export async function requireSpaceOwner(spaceId: string, userId: string): Promise<{ space: { id: string; user_id: string } } | NextResponse> {
  const { data: space } = await supabaseAdmin
    .from('spaces')
    .select('id, user_id')
    .eq('id', spaceId)
    .single()

  if (!space) {
    return NextResponse.json({ error: 'Space not found' }, { status: 404 })
  }
  if (space.user_id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return { space }
}

/**
 * Verifies the authenticated user owns the space that contains the given testimonial.
 * Returns the testimonial's space_id or a 403/404 response.
 */
export async function requireTestimonialOwner(testimonialId: string, userId: string): Promise<{ spaceId: string } | NextResponse> {
  const { data: testimonial } = await supabaseAdmin
    .from('testimonials')
    .select('id, space_id')
    .eq('id', testimonialId)
    .single()

  if (!testimonial) {
    return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
  }

  const ownerCheck = await requireSpaceOwner(testimonial.space_id, userId)
  if (ownerCheck instanceof NextResponse) return ownerCheck

  return { spaceId: testimonial.space_id }
}
