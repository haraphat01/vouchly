import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { PLANS } from '@/lib/utils'

function isAdmin(req: NextRequest) {
  const adminCookie = req.cookies.get('admin_token')?.value
  const secret = process.env.ADMIN_SECRET
  return !!(secret && adminCookie === secret)
}

export async function GET(req: NextRequest) {
  try {
    if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const [profilesRes, spacesRes, testimonialsRes] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select('id, email, full_name, plan, stripe_customer_id, stripe_subscription_id, created_at')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('spaces')
        .select('id, user_id, name, slug, is_active, created_at')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('testimonials')
        .select('id, space_id, submitter_name, content, type, status, rating, created_at')
        .order('created_at', { ascending: false }),
    ])

    const profiles = profilesRes.data || []
    const spaces = spacesRes.data || []
    const testimonials = testimonialsRes.data || []

    // Build lookup maps
    const profileMap: Record<string, typeof profiles[0]> = {}
    for (const p of profiles) profileMap[p.id] = p

    const spaceMap: Record<string, typeof spaces[0]> = {}
    const spaceToUser: Record<string, string> = {}
    const spacesByUser: Record<string, number> = {}
    for (const s of spaces) {
      spaceMap[s.id] = s
      spaceToUser[s.id] = s.user_id
      spacesByUser[s.user_id] = (spacesByUser[s.user_id] || 0) + 1
    }

    const testimonialsByUser: Record<string, number> = {}
    const testimonialsBySpace: Record<string, number> = {}
    const pendingByUser: Record<string, number> = {}
    for (const t of testimonials) {
      const uid = spaceToUser[t.space_id]
      testimonialsBySpace[t.space_id] = (testimonialsBySpace[t.space_id] || 0) + 1
      if (!uid) continue
      testimonialsByUser[uid] = (testimonialsByUser[uid] || 0) + 1
      if (t.status === 'pending') pendingByUser[uid] = (pendingByUser[uid] || 0) + 1
    }

    // Overview
    const planCounts = { free: 0, starter: 0, pro: 0 }
    let mrr = 0
    for (const p of profiles) {
      const plan = (p.plan || 'free') as keyof typeof planCounts
      if (plan in planCounts) planCounts[plan]++
      mrr += PLANS[plan as keyof typeof PLANS]?.price || 0
    }

    const overview = {
      totalUsers: profiles.length,
      totalSpaces: spaces.length,
      totalTestimonials: testimonials.length,
      pendingTestimonials: testimonials.filter(t => t.status === 'pending').length,
      mrr,
      planCounts,
      videoTestimonials: testimonials.filter(t => t.type === 'video').length,
    }

    // Users list
    const users = profiles.map(p => ({
      id: p.id,
      email: p.email,
      full_name: p.full_name || null,
      plan: p.plan || 'free',
      spaceCount: spacesByUser[p.id] || 0,
      testimonialCount: testimonialsByUser[p.id] || 0,
      pendingCount: pendingByUser[p.id] || 0,
      hasBilling: !!(p.stripe_subscription_id),
      createdAt: p.created_at,
    }))

    // Spaces list
    const spacesList = spaces.map(s => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      is_active: s.is_active,
      ownerId: s.user_id,
      ownerEmail: profileMap[s.user_id]?.email || '—',
      ownerName: profileMap[s.user_id]?.full_name || null,
      testimonialCount: testimonialsBySpace[s.id] || 0,
      createdAt: s.created_at,
    }))

    // Testimonials list
    const testimonialsList = testimonials.map(t => {
      const space = spaceMap[t.space_id]
      const owner = space ? profileMap[space.user_id] : null
      return {
        id: t.id,
        space_id: t.space_id,
        spaceName: space?.name || '—',
        spaceSlug: space?.slug || '',
        ownerEmail: owner?.email || '—',
        submitter_name: t.submitter_name,
        content: t.content || null,
        type: t.type,
        status: t.status,
        rating: t.rating || null,
        createdAt: t.created_at,
      }
    })

    // Recent testimonials for overview tab (last 10)
    const recentTestimonials = testimonialsList.slice(0, 10)

    return NextResponse.json({ overview, users, spacesList, testimonialsList, recentTestimonials })
  } catch (err) {
    console.error('Admin stats error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
