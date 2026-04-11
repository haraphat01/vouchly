import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { sendUpgradeConfirmationEmail, sendCancellationEmail } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', { apiVersion: '2024-04-10' })

const PLAN_PRICES: Record<string, { plan: 'starter' | 'pro'; price: number }> = {
  [process.env.STRIPE_STARTER_PRICE_ID || 'price_starter']: { plan: 'starter', price: 19 },
  [process.env.STRIPE_PRO_PRICE_ID || 'price_pro']: { plan: 'pro', price: 39 },
  [process.env.STRIPE_STARTER_ANNUAL_PRICE_ID || 'price_starter_annual']: { plan: 'starter', price: 205.20 },
  [process.env.STRIPE_PRO_ANNUAL_PRICE_ID || 'price_pro_annual']: { plan: 'pro', price: 421.20 },
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || '')
  } catch (err) {
    console.error('Webhook signature failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const priceId = (session as any).line_items?.data?.[0]?.price?.id
        const planInfo = priceId ? PLAN_PRICES[priceId] : null
        const plan = (session.metadata?.plan as 'starter' | 'pro') || planInfo?.plan
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const customerEmail = session.customer_details?.email
        const customerName = session.customer_details?.name

        if (customerEmail && plan) {
          await supabaseAdmin.from('profiles').update({
            plan, stripe_customer_id: customerId, stripe_subscription_id: subscriptionId,
          }).eq('email', customerEmail)

          const price = PLAN_PRICES[Object.keys(PLAN_PRICES).find(k => PLAN_PRICES[k].plan === plan) || '']?.price
            || (plan === 'pro' ? 39 : 19)

          await sendUpgradeConfirmationEmail(customerEmail, customerName || customerEmail.split('@')[0], plan, price)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const endDate = new Date(subscription.current_period_end * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

        const { data: profile } = await supabaseAdmin.from('profiles').select('email, full_name').eq('stripe_customer_id', customerId).single()
        await supabaseAdmin.from('profiles').update({ plan: 'free', stripe_subscription_id: null }).eq('stripe_customer_id', customerId)

        if (profile?.email) {
          await sendCancellationEmail(profile.email, profile.full_name || profile.email.split('@')[0], endDate)
        }
        break
      }
    }
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
