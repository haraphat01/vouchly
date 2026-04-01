import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'
import { requireAuth } from '@/lib/apiAuth'

// Called from the verify page after the user confirms their email.
// Requires a valid session token so arbitrary callers cannot send emails.
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (auth instanceof NextResponse) return auth

    const { email, name } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    // Only allow sending to the authenticated user's own email
    if (auth.user.email !== email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await sendWelcomeEmail(email, name || email.split('@')[0])
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Welcome email error:', err)
    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 })
  }
}
