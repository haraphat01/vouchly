import Link from 'next/link'
import { Star, Zap, Code2, ArrowRight, CheckCircle2, Quote } from 'lucide-react'

export default function Home() {
  const testimonials = [
    { name: 'Amara Osei', role: 'Founder, BuildFast', text: 'vouchly transformed how we collect social proof. The AI rewriter is magic — raw feedback becomes polished gold.', rating: 5 },
    { name: 'Lucas Ferreira', role: 'Marketing Lead, Pixelworks', text: 'Set it up in 20 minutes, had our first testimonial wall live before lunch. Incredible product.', rating: 5 },
    { name: 'Priya Sharma', role: 'Solo developer', text: 'I\'ve tried 4 testimonial tools. This is the only one where I didn\'t need to read a 40-page docs just to embed something.', rating: 5 },
  ]

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #eceae6', background: 'rgba(253,248,240,0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, background: 'var(--brand)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Quote size={16} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--ink)' }}>vouchly</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="#pricing" style={{ color: 'var(--ink-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Pricing</Link>
            <Link href="/auth/login" className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>Log in</Link>
            <Link href="/auth/signup" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 1.5rem 4rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--brand-light)', color: '#7a3815', padding: '0.35rem 0.9rem', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          <Zap size={13} /> AI-powered testimonial collector
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em', color: 'var(--ink)' }}>
          Turn customer love into<br />
          <span style={{ color: 'var(--brand)' }}>revenue-driving proof</span>
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--ink-muted)', maxWidth: 540, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Collect text and video testimonials, let AI polish the rough edges, then embed a beautiful wall anywhere — in one script tag.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/signup" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
            Start free — no card needed <ArrowRight size={16} />
          </Link>
          <Link href="#how-it-works" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>See how it works</Link>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--ink-subtle)' }}>Free plan includes 5 testimonials. No credit card required.</p>
      </section>

      {/* Social proof bar */}
      <div style={{ background: 'white', borderTop: '1px solid #eceae6', borderBottom: '1px solid #eceae6', padding: '1.2rem 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', padding: '0 1.5rem', flexWrap: 'wrap' }}>
          {[['1,200+', 'Businesses using vouchly'], ['48,000+', 'Testimonials collected'], ['4.9★', 'Average rating from users'], ['< 5 min', 'Time to first testimonial']].map(([stat, label]) => (
            <div key={stat} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--brand)' }}>{stat}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section id="how-it-works" style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 1.5rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '3rem' }}>Three steps to social proof</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {[
            { step: '01', icon: '📬', title: 'Collect', desc: 'Send your customers a beautiful branded form. Collect text or video testimonials in seconds.' },
            { step: '02', icon: '✨', title: 'AI Polish', desc: 'Our AI rewrites raw feedback into compelling, professional testimonials. You review and approve.' },
            { step: '03', icon: '🚀', title: 'Embed', desc: 'Add one script tag to your website. Your testimonial wall appears, automatically updated.' },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 700, color: '#f5ede0', lineHeight: 1 }}>{step}</div>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{icon}</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{title}</h3>
              <p style={{ color: 'var(--ink-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ background: 'white', borderTop: '1px solid #eceae6', borderBottom: '1px solid #eceae6', padding: '5rem 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '3rem' }}>Everything you need to build trust</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '🎥', title: 'Video testimonials', desc: 'Let customers record directly in the browser. No app needed.' },
              { icon: '🤖', title: 'AI rewriter', desc: 'Transforms "product is great lol" into a compelling testimonial.' },
              { icon: '🎨', title: 'Branded forms', desc: 'Customise colors, logo, and questions to match your brand.' },
              { icon: '⭐', title: 'Star ratings', desc: 'Collect 1–5 star ratings alongside testimonials.' },
              { icon: '📧', title: 'Email invites', desc: 'Send personalised collection links directly to customers.' },
              { icon: '🔗', title: 'Import reviews', desc: 'Pull in existing Google and Trustpilot reviews.' },
              { icon: '💻', title: 'One-line embed', desc: 'One script tag. Works on any website or platform.' },
              { icon: '📊', title: 'Analytics', desc: 'Track views, clicks, and conversion impact of your wall.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: '1rem', padding: '1.25rem', border: '1px solid #eceae6', borderRadius: 'var(--radius-lg)' }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{icon}</span>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', lineHeight: 1.5 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample testimonials */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 1.5rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '3rem' }}>What our customers say</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {testimonials.map((t) => (
            <div key={t.name} className="testimonial-card card-hover">
              <div style={{ display: 'flex', gap: 2, marginBottom: '1rem', marginTop: '1rem' }}>
                {[...Array(t.rating)].map((_, i) => <Star key={i} size={14} fill="#e8963a" color="#e8963a" />)}
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--ink)', lineHeight: 1.7, marginBottom: '1.25rem' }}>{t.text}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand)' }}>
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)' }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ background: 'white', borderTop: '1px solid #eceae6', padding: '5rem 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '0.75rem' }}>Simple, honest pricing</h2>
          <p style={{ textAlign: 'center', color: 'var(--ink-muted)', marginBottom: '3rem' }}>Start free. Scale when you're ready.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
            {[
              { name: 'Free', price: '$0', period: '/month', features: ['5 testimonials', '1 space', 'Text only', 'Embed widget (with branding)', 'Public wall'], cta: 'Start free', href: '/auth/signup', featured: false },
              { name: 'Starter', price: '$19', period: '/month', features: ['Unlimited testimonials', '3 spaces', 'AI rewriter', 'No branding on widget', 'Email invitations', 'Import Google reviews'], cta: 'Get Starter', href: '/auth/signup?plan=starter', featured: false },
              { name: 'Pro', price: '$39', period: '/month', features: ['Everything in Starter', 'Video testimonials', 'Unlimited spaces', 'Custom domain', 'Priority support', 'Analytics dashboard'], cta: 'Get Pro', href: '/auth/signup?plan=pro', featured: true },
            ].map((plan) => (
              <div key={plan.name} style={{ border: plan.featured ? '2px solid var(--brand)' : '1px solid #eceae6', borderRadius: 'var(--radius-xl)', padding: '2rem', position: 'relative', background: plan.featured ? 'var(--paper)' : 'white' }}>
                {plan.featured && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--brand)', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.9rem', borderRadius: 100 }}>Most popular</div>}
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{plan.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: '1.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--ink)' }}>{plan.price}</span>
                  <span style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>{plan.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'var(--ink)' }}>
                      <CheckCircle2 size={15} color="var(--brand)" style={{ flexShrink: 0 }} /> {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`btn ${plan.featured ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%', justifyContent: 'center' }}>{plan.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Ready to collect your first testimonial?</h2>
        <p style={{ color: 'var(--ink-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>Join 1,200+ businesses building trust with vouchly.</p>
        <Link href="/auth/signup" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '0.85rem 2.5rem' }}>
          Get started for free <ArrowRight size={16} />
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #eceae6', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: '0.75rem' }}>
          <div style={{ width: 24, height: 24, background: 'var(--brand)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Quote size={12} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ink)' }}>vouchly</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--ink-subtle)' }}>© {new Date().getFullYear()} vouchly. Built to help you grow.</p>
      </footer>
    </div>
  )
}
