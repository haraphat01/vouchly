# Vouchly — Testimonial Collector SaaS

A full-featured SaaS for collecting, polishing, and displaying customer testimonials. Built with Next.js 14, Supabase, Resend, OpenAI, and Stripe.

---

## Features

- **Text & Video Testimonials** — Customers submit via branded collection page; video recorded in-browser
- **AI Rewriter** — OpenAI GPT-4o-mini polishes raw feedback into compelling testimonials
- **Testimonial Wall** — Beautiful public wall with masonry layout and star-rating filter
- **Embed Widget** — One `<script>` tag embeds an auto-updating grid on any website
- **Email Invitations** — Send personalised collection links to customers via Resend
- **Dashboard** — Approve, archive, feature testimonials across multiple spaces
- **3-tier Pricing** — Free / Starter ($19) / Pro ($39) via Stripe subscriptions

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database & Auth | Supabase (Postgres + Auth) |
| **Email** | **Resend** (all transactional emails) |
| AI | OpenAI GPT-4o-mini |
| Payments | Stripe |
| Styling | Tailwind CSS + Custom CSS |
| Hosting | Vercel (recommended) |

---

## Email Flows (all powered by Resend)

| Trigger | Email sent |
|---|---|
| User signs up | Verification email with confirmation link |
| User verifies email | Welcome email with onboarding steps |
| User requests password reset | Password reset link (expires 1 hour) |
| Owner sends invite to customer | Personalised collection invitation |
| Customer submits testimonial | Notification email to space owner |
| Owner approves testimonial | "Your testimonial is live" email to submitter |
| User upgrades plan | Plan upgrade confirmation with features list |
| Stripe cancels subscription | Cancellation notice with access end date |

All emails use a branded HTML template with ProofPulse styling — no plain-text emails.

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in all values:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=ProofPulse <noreply@yourdomain.com>
RESEND_REPLY_TO=support@yourdomain.com

# OpenAI
OPENAI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_STARTER_PRICE_ID=
STRIPE_PRO_PRICE_ID=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase-schema.sql` in the SQL Editor
3. In Storage → create a **public** bucket named `videos`
4. **Disable Supabase's built-in email** — go to Authentication → Email Templates and disable "Confirm signup". We send our own emails via Resend.

### 4. Set up Resend

1. Create an account at [resend.com](https://resend.com)
2. Add and verify your sending domain (e.g. `yourdomain.com`)
3. Create an API key under API Keys
4. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in your `.env.local`

> **Important:** Your `RESEND_FROM_EMAIL` must use a domain you've verified in Resend. During development you can use `onboarding@resend.dev` to send to your own email only.

### 5. Set up Stripe

1. Create two recurring products in Stripe:
   - **Starter** — $19/month
   - **Pro** — $39/month
2. Copy their Price IDs into `.env.local`
3. Add a webhook endpoint pointing to `https://yourapp.com/api/billing/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`

### 6. Run locally

```bash
npm run dev
```

---

## Deployment (Vercel)

```bash
npm i -g vercel
vercel --prod
```

Add all environment variables in Vercel → Settings → Environment Variables.

Update your Stripe webhook URL and `NEXT_PUBLIC_APP_URL` to your production domain.

---

## Project Structure

```
src/
  lib/
    supabase.ts          # Supabase client + types
    email.ts             # Resend client + all email templates
    utils.ts             # Helpers, plan definitions

  app/
    page.tsx             # Landing page
    auth/
      login/             # Login page
      signup/            # Signup page (calls custom API, shows check-email screen)
      verify/            # Email verification callback
      forgot-password/   # Request password reset
      reset-password/    # Set new password
    dashboard/
      layout.tsx         # Sidebar layout
      page.tsx           # Overview stats
      spaces/
        page.tsx         # All spaces
        new/             # Create space
        [id]/            # Manage space + testimonials
      settings/          # Profile + billing
    collect/[id]/        # Public collection form
    wall/[id]/           # Public testimonial wall
    api/
      auth/
        signup/          # Create user + send verification via Resend
        forgot-password/ # Generate reset link + send via Resend
        welcome/         # Send welcome email post-verification
      testimonials/
        route.ts         # CRUD + owner notification + submitter approval email
        polish/          # AI rewrite
      spaces/            # Spaces CRUD
      invitations/       # Create invite + send email via Resend
      billing/
        checkout/        # Stripe checkout session
        webhook/         # Stripe events + send upgrade/cancel emails
      embed/             # Public widget API

public/
  embed.js               # Drop-in embed widget

supabase-schema.sql      # Full database schema + RLS policies
```

---

## Embed Widget

```html
<script
  src="https://yourapp.com/embed.js"
  data-space="your-space-slug"
  data-limit="6"
  async
></script>
```

---

## Pricing & Revenue Model

| Plan | Price | Users needed for $5K/mo |
|---|---|---|
| Free | $0 | — |
| Starter | $19/mo | 263 |
| Pro | $39/mo | 128 |

---

Built by Pencil Digitals ❤️ for small businesses.
