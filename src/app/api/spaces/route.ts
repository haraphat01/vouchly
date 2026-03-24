import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { PLANS } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('spaces')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ spaces: data })
}

export async function POST(req: NextRequest) {
  try {
    // Verify auth
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check space limit against plan
    const { data: profile } = await supabaseAdmin.from('profiles').select('plan').eq('id', user.id).single()
    const plan = (profile?.plan || 'free') as keyof typeof PLANS
    const planConfig = PLANS[plan]

    if (planConfig.spaces !== -1) {
      const { count } = await supabaseAdmin.from('spaces').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
      if ((count || 0) >= planConfig.spaces) {
        return NextResponse.json(
          { error: `Your ${planConfig.name} plan allows ${planConfig.spaces} space${planConfig.spaces !== 1 ? 's' : ''}. Upgrade to create more.` },
          { status: 403 },
        )
      }
    }

    const body = await req.json()
    const { data, error } = await supabaseAdmin.from('spaces').insert({ ...body, user_id: user.id }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ space: data })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { data, error } = await supabaseAdmin.from('spaces').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ space: data })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
