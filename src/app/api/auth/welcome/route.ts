import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
    await sendWelcomeEmail(email, name || email.split('@')[0])
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Welcome email error:', err)
    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 })
  }
}
