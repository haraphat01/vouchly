import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20',
})

const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter_placeholder',
  pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_placeholder',
}

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json()

    if (!PRICE_IDS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get current user from auth header or cookie
    const authHeader = req.headers.get('Authorization')
    // In a real app, extract user from session
    // For now we'll use a placeholder customer

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing`,
      metadata: { plan },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
