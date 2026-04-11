import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-04-10',
})

const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter_placeholder',
  pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_placeholder',
  'starter-annual': process.env.STRIPE_STARTER_ANNUAL_PRICE_ID || 'price_starter_annual_placeholder',
  'pro-annual': process.env.STRIPE_PRO_ANNUAL_PRICE_ID || 'price_pro_annual_placeholder',
}

export async function POST(req: NextRequest) {
  try {
    const { plan, interval = 'monthly' } = await req.json()
    const priceKey = interval === 'annual' ? `${plan}-annual` : plan

    if (!PRICE_IDS[priceKey]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Resolve the logged-in user from the Bearer token
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    let customerEmail: string | undefined
    let userId: string | undefined

    if (token) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(token)
      if (user) {
        customerEmail = user.email ?? undefined
        userId = user.id
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: PRICE_IDS[priceKey], quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing`,
      customer_email: customerEmail,
      metadata: { plan, interval, user_id: userId ?? '' },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
