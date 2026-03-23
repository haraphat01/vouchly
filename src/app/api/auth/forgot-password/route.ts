import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    // Look up user name for personalisation
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    const user = users?.users?.find(u => u.email === email)
    const name = (user?.user_metadata?.full_name as string) || email.split('@')[0]

    // Generate reset link via Supabase Admin
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password` },
    })

    // Always return success to prevent email enumeration
    if (error || !data?.properties?.action_link) {
      console.error('Generate reset link error:', error)
      return NextResponse.json({ success: true })
    }

    await sendPasswordResetEmail(email, name, data.properties.action_link)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Forgot password error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
