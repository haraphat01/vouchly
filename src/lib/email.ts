import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.RESEND_FROM_EMAIL || 'vouchly <noreply@vouchly.app>'
const REPLY_TO = process.env.RESEND_REPLY_TO || 'support@vouchly.app'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// ─── Base email layout ────────────────────────────────────────────────────────
function baseLayout(content: string, previewText = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>vouchly</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fdf8f0; font-family: Georgia, 'Times New Roman', serif; color: #1a1713; -webkit-font-smoothing: antialiased; }
    a { color: #d4751f; }
    .wrapper { background: #fdf8f0; padding: 40px 16px; }
    .container { background: #ffffff; border: 1px solid #eceae6; border-radius: 16px; max-width: 560px; margin: 0 auto; overflow: hidden; }
    .header { background: #1a1713; padding: 28px 40px; display: flex; align-items: center; }
    .logo-mark { background: #d4751f; width: 32px; height: 32px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; vertical-align: middle; }
    .logo-text { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 700; color: #ffffff; vertical-align: middle; }
    .body { padding: 40px; }
    h1 { font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; color: #1a1713; line-height: 1.25; margin-bottom: 16px; }
    h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 600; color: #1a1713; margin-bottom: 12px; }
    p { font-size: 15px; line-height: 1.7; color: #504a42; margin-bottom: 20px; }
    .btn { display: inline-block; background: #d4751f; color: #ffffff !important; font-family: Georgia, serif; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px; margin: 8px 0 24px; }
    .btn:hover { background: #b85c14; }
    .btn-secondary { background: transparent; color: #d4751f !important; border: 1.5px solid #d4751f; padding: 12px 28px; }
    .divider { border: none; border-top: 1px solid #eceae6; margin: 28px 0; }
    .callout { background: #faecd8; border-left: 3px solid #d4751f; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 20px 0; }
    .callout p { color: #7a3815; margin: 0; font-size: 14px; }
    .meta { font-size: 13px; color: #7a7367; margin-bottom: 8px; }
    .code-box { background: #1a1713; border-radius: 8px; padding: 14px 18px; margin: 16px 0; }
    .code-box code { color: #faecd8; font-family: monospace; font-size: 13px; word-break: break-all; }
    .footer { background: #f5ede0; padding: 24px 40px; border-top: 1px solid #eceae6; }
    .footer p { font-size: 12px; color: #96906b; margin: 0; line-height: 1.6; }
    .footer a { color: #7a7367; }
    .stat-row { display: flex; gap: 16px; margin: 20px 0; }
    .stat-box { flex: 1; background: #fdf8f0; border: 1px solid #eceae6; border-radius: 10px; padding: 14px; text-align: center; }
    .stat-num { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 700; color: #d4751f; }
    .stat-label { font-size: 12px; color: #7a7367; margin-top: 2px; }
    .testimonial-preview { background: #fdf8f0; border: 1px solid #eceae6; border-radius: 10px; padding: 18px; margin: 16px 0; position: relative; }
    .testimonial-preview::before { content: '"'; position: absolute; top: 8px; left: 14px; font-size: 40px; line-height: 1; color: #faecd8; font-family: Georgia, serif; }
    .testimonial-text { font-size: 14px; color: #504a42; line-height: 1.65; padding-top: 8px; margin-bottom: 12px; font-style: italic; }
    .testimonial-author { font-size: 13px; font-weight: 600; color: #1a1713; }
    .testimonial-role { font-size: 12px; color: #7a7367; }
    .stars { color: #e8963a; font-size: 14px; margin-bottom: 6px; }
    @media (max-width: 480px) {
      .body { padding: 28px 24px; }
      .footer { padding: 20px 24px; }
      .stat-row { flex-direction: column; }
    }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>` : ''}
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <span class="logo-mark">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4C2 3.4 2.4 3 3 3h10c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V4z" stroke="white" stroke-width="1.2"/><path d="M5 6.5h6M5 9h4" stroke="white" stroke-width="1.2" stroke-linecap="round"/></svg>
        </span>
        <span class="logo-text">vouchly</span>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} vouchly · <a href="${APP_URL}">vouchly.app</a> · <a href="${APP_URL}/unsubscribe">Unsubscribe</a></p>
        <p style="margin-top:6px">You're receiving this because you have an account with vouchly.</p>
      </div>
    </div>
  </div>
</body>
</html>`
}

// ─── Email: Verify email address ──────────────────────────────────────────────
export async function sendVerificationEmail(to: string, name: string, verifyUrl: string) {
  return resend.emails.send({
    from: FROM,
    reply_to: REPLY_TO,
    to,
    subject: 'Verify your vouchly email',
    html: baseLayout(`
      <h1>Confirm your email address</h1>
      <p>Hi ${name || 'there'},</p>
      <p>Thanks for signing up for vouchly! Click the button below to verify your email and activate your account.</p>
      <a href="${verifyUrl}" class="btn">Verify email address</a>
      <p class="meta">This link expires in 24 hours.</p>
      <hr class="divider" />
      <p style="font-size:13px;color:#7a7367">If you didn't create a vouchly account, you can safely ignore this email. If the button doesn't work, copy this link into your browser:</p>
      <div class="code-box"><code>${verifyUrl}</code></div>
    `, 'Verify your vouchly email address to get started'),
  })
}

// ─── Email: Welcome (post-verification) ──────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: FROM,
    reply_to: REPLY_TO,
    to,
    subject: 'Welcome to vouchly 🎉',
    html: baseLayout(`
      <h1>You're in. Let's collect some testimonials.</h1>
      <p>Hi ${name || 'there'},</p>
      <p>Your vouchly account is active. Here's how to get your first testimonial in the next 10 minutes:</p>
      <div class="callout"><p><strong>Step 1:</strong> Create a Space for your product or service.</p></div>
      <div class="callout"><p><strong>Step 2:</strong> Share your collection link with a customer.</p></div>
      <div class="callout"><p><strong>Step 3:</strong> Approve and embed their testimonial on your site.</p></div>
      <a href="${APP_URL}/dashboard/spaces/new" class="btn">Create your first space →</a>
      <hr class="divider" />
      <p style="font-size:13px;color:#7a7367">Have questions? Just reply to this email — we read every message.</p>
    `, 'Your vouchly account is ready. Create your first space.'),
  })
}

// ─── Email: Password reset ────────────────────────────────────────────────────
export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  return resend.emails.send({
    from: FROM,
    reply_to: REPLY_TO,
    to,
    subject: 'Reset your vouchly password',
    html: baseLayout(`
      <h1>Reset your password</h1>
      <p>Hi ${name || 'there'},</p>
      <p>We received a request to reset the password for your vouchly account. Click the button below to choose a new password.</p>
      <a href="${resetUrl}" class="btn">Reset password</a>
      <p class="meta">This link expires in 1 hour.</p>
      <hr class="divider" />
      <div class="callout"><p>If you didn't request a password reset, please ignore this email. Your password will not change.</p></div>
      <p style="font-size:13px;color:#7a7367">If the button doesn't work, copy this link:</p>
      <div class="code-box"><code>${resetUrl}</code></div>
    `, 'Reset your vouchly password — link expires in 1 hour'),
  })
}

// ─── Email: Magic link / OTP login ───────────────────────────────────────────
export async function sendMagicLinkEmail(to: string, name: string, magicUrl: string) {
  return resend.emails.send({
    from: FROM,
    reply_to: REPLY_TO,
    to,
    subject: 'Your vouchly sign-in link',
    html: baseLayout(`
      <h1>Sign in to vouchly</h1>
      <p>Hi ${name || 'there'},</p>
      <p>Click the button below to sign in instantly — no password needed.</p>
      <a href="${magicUrl}" class="btn">Sign in to vouchly</a>
      <p class="meta">This link expires in 15 minutes and can only be used once.</p>
      <hr class="divider" />
      <div class="callout"><p>If you didn't request this link, you can safely ignore this email.</p></div>
    `, 'Your one-click sign-in link for vouchly'),
  })
}

// ─── Email: Testimonial invitation ───────────────────────────────────────────
export async function sendTestimonialInviteEmail(
  to: string,
  recipientName: string,
  spaceName: string,
  collectUrl: string,
  customMessage?: string,
) {
  return resend.emails.send({
    from: FROM,
    reply_to: REPLY_TO,
    to,
    subject: `${spaceName} would love your feedback`,
    html: baseLayout(`
      <h1>Would you share your experience?</h1>
      <p>Hi ${recipientName || 'there'},</p>
      ${customMessage
        ? `<p>${customMessage}</p>`
        : `<p>The team at <strong>${spaceName}</strong> would love to hear about your experience with their product. It only takes 2 minutes and means a lot to them.</p>`
      }
      <a href="${collectUrl}" class="btn">Leave a testimonial →</a>
      <hr class="divider" />
      <p style="font-size:13px;color:#7a7367">You can write a short text review or record a quick video — whichever is easier for you. Your honest feedback is genuinely appreciated.</p>
      <p style="font-size:12px;color:#b8b3a8;margin-top:20px">This invitation was sent on behalf of ${spaceName}. If you don't want to receive future requests, simply ignore this email.</p>
    `, `${spaceName} would love to hear about your experience`),
  })
}

// ─── Email: New testimonial received (notify space owner) ────────────────────
export async function sendNewTestimonialNotification(
  ownerEmail: string,
  ownerName: string,
  spaceName: string,
  testimonial: {
    submitter_name: string
    submitter_role?: string
    content?: string
    rating?: number
    type: string
  },
  reviewUrl: string,
) {
  const stars = testimonial.rating
    ? '★'.repeat(testimonial.rating) + '☆'.repeat(5 - testimonial.rating)
    : ''

  return resend.emails.send({
    from: FROM,
    reply_to: REPLY_TO,
    to: ownerEmail,
    subject: `New testimonial from ${testimonial.submitter_name} — ${spaceName}`,
    html: baseLayout(`
      <h1>You have a new testimonial 🎉</h1>
      <p>Hi ${ownerName || 'there'},</p>
      <p><strong>${testimonial.submitter_name}</strong>${testimonial.submitter_role ? ` (${testimonial.submitter_role})` : ''} just submitted a ${testimonial.type} testimonial for <strong>${spaceName}</strong>.</p>
      ${testimonial.content ? `
      <div class="testimonial-preview">
        ${stars ? `<div class="stars">${stars}</div>` : ''}
        <p class="testimonial-text">${testimonial.content.slice(0, 300)}${testimonial.content.length > 300 ? '…' : ''}</p>
        <div class="testimonial-author">${testimonial.submitter_name}</div>
        ${testimonial.submitter_role ? `<div class="testimonial-role">${testimonial.submitter_role}</div>` : ''}
      </div>` : `<p class="meta">Type: ${testimonial.type} testimonial</p>`}
      <a href="${reviewUrl}" class="btn">Review &amp; approve →</a>
      <hr class="divider" />
      <p style="font-size:13px;color:#7a7367">Approve it to publish it on your testimonial wall and embed widget. You can also use the AI rewriter to polish the text before publishing.</p>
    `, `New ${testimonial.type} testimonial from ${testimonial.submitter_name}`),
  })
}

// ─── Email: Testimonial approved (notify submitter) ──────────────────────────
export async function sendTestimonialApprovedEmail(
  to: string,
  submitterName: string,
  spaceName: string,
  wallUrl: string,
) {
  return resend.emails.send({
    from: FROM,
    reply_to: REPLY_TO,
    to,
    subject: `Your testimonial for ${spaceName} is live`,
    html: baseLayout(`
      <h1>Your testimonial is live ✨</h1>
      <p>Hi ${submitterName || 'there'},</p>
      <p>Thank you so much for sharing your experience with <strong>${spaceName}</strong>. Your testimonial has been approved and is now live on their testimonial wall.</p>
      <a href="${wallUrl}" class="btn">See it on the wall →</a>
      <hr class="divider" />
      <p style="font-size:13px;color:#7a7367">Your words help others make better decisions. We genuinely appreciate you taking the time.</p>
    `, `Your testimonial for ${spaceName} is now live`),
  })
}

// ─── Email: Plan upgrade confirmation ────────────────────────────────────────
export async function sendUpgradeConfirmationEmail(
  to: string,
  name: string,
  plan: 'starter' | 'pro',
  price: number,
) {
  const features: Record<string, string[]> = {
    starter: ['Unlimited testimonials', '3 spaces', 'AI rewriter', 'No vouchly branding', 'Email invitations'],
    pro: ['Everything in Starter', 'Video testimonials', 'Unlimited spaces', 'Custom domain', 'Priority support'],
  }
  return resend.emails.send({
    from: FROM,
    reply_to: REPLY_TO,
    to,
    subject: `Welcome to vouchly ${plan.charAt(0).toUpperCase() + plan.slice(1)} 🚀`,
    html: baseLayout(`
      <h1>You're now on the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan</h1>
      <p>Hi ${name || 'there'},</p>
      <p>Your upgrade was successful! You're now on <strong>vouchly ${plan.charAt(0).toUpperCase() + plan.slice(1)}</strong> at <strong>$${price}/month</strong>.</p>
      <h2>What's unlocked</h2>
      ${features[plan].map(f => `<div class="callout"><p>✓ <strong>${f}</strong></p></div>`).join('')}
      <a href="${APP_URL}/dashboard" class="btn">Go to your dashboard →</a>
      <hr class="divider" />
      <p style="font-size:13px;color:#7a7367">You'll be billed $${price} monthly. To cancel, go to Settings → Billing or reply to this email.</p>
    `, `Your vouchly ${plan} plan is active — here's what you've unlocked`),
  })
}

// ─── Email: Subscription cancellation ────────────────────────────────────────
export async function sendCancellationEmail(to: string, name: string, endDate: string) {
  return resend.emails.send({
    from: FROM,
    reply_to: REPLY_TO,
    to,
    subject: 'Your vouchly subscription has been cancelled',
    html: baseLayout(`
      <h1>Subscription cancelled</h1>
      <p>Hi ${name || 'there'},</p>
      <p>Your vouchly subscription has been cancelled. You'll retain access to your paid features until <strong>${endDate}</strong>, after which your account will revert to the Free plan.</p>
      <div class="callout"><p>Your testimonials and spaces are safe — they won't be deleted.</p></div>
      <a href="${APP_URL}/dashboard/settings?tab=billing" class="btn btn-secondary">Reactivate plan</a>
      <hr class="divider" />
      <p style="font-size:13px;color:#7a7367">We'd love to know why you cancelled so we can improve. Just reply to this email — we read every message.</p>
    `, 'Your vouchly subscription has been cancelled'),
  })
}
