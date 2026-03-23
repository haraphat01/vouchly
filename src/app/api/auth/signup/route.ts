import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendVerificationEmail, sendWelcomeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Create user in Supabase Auth (email confirmation disabled — we handle it)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: name },
      email_confirm: false, // we send our own verification
    })

    if (error) {
      if (error.message.includes('already registered')) {
        return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Generate email verification link via Supabase Admin
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify` },
    })

    if (linkError || !linkData?.properties?.action_link) {
      console.error('Failed to generate verify link:', linkError)
      // Still create the account but skip verification email
      return NextResponse.json({ success: true, requiresVerification: false })
    }

    // Send verification email via Resend
    const { error: emailError } = await sendVerificationEmail(
      email,
      name || email.split('@')[0],
      linkData.properties.action_link,
    )

    if (emailError) {
      console.error('Failed to send verification email:', emailError)
    }

    return NextResponse.json({ success: true, requiresVerification: true })
  } catch (err) {
    console.error('Signup error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
