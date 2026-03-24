import Link from 'next/link'
import { Star, Zap, ArrowRight, CheckCircle2, Quote } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default async function Home() {
  const t = await getTranslations('home')
  const tn = await getTranslations('nav')

  const testimonials = [
    { name: t('t1_name'), role: t('t1_role'), text: t('t1_text'), rating: 5 },
    { name: t('t2_name'), role: t('t2_role'), text: t('t2_text'), rating: 5 },
    { name: t('t3_name'), role: t('t3_role'), text: t('t3_text'), rating: 5 },
  ]

  const features = [
    { icon: '🎥', title: t('feat1_title'), desc: t('feat1_desc') },
    { icon: '🤖', title: t('feat2_title'), desc: t('feat2_desc') },
    { icon: '🎨', title: t('feat3_title'), desc: t('feat3_desc') },
    { icon: '⭐', title: t('feat4_title'), desc: t('feat4_desc') },
    { icon: '📧', title: t('feat5_title'), desc: t('feat5_desc') },
    { icon: '🔗', title: t('feat6_title'), desc: t('feat6_desc') },
    { icon: '💻', title: t('feat7_title'), desc: t('feat7_desc') },
    { icon: '📊', title: t('feat8_title'), desc: t('feat8_desc') },
  ]

  const steps = [
    { step: '01', icon: '📬', title: t('step1_title'), desc: t('step1_desc') },
    { step: '02', icon: '✨', title: t('step2_title'), desc: t('step2_desc') },
    { step: '03', icon: '🚀', title: t('step3_title'), desc: t('step3_desc') },
  ]

  const plans = [
    {
      name: t('plan_free_name'), price: '$0', period: t('per_month'),
      features: [t('plan_free_f1'), t('plan_free_f2'), t('plan_free_f3'), t('plan_free_f4'), t('plan_free_f5')],
      cta: t('plan_free_cta'), href: '/auth/signup', featured: false,
    },
    {
      name: t('plan_starter_name'), price: '$19', period: t('per_month'),
      features: [t('plan_starter_f1'), t('plan_starter_f2'), t('plan_starter_f3'), t('plan_starter_f4'), t('plan_starter_f5'), t('plan_starter_f6'), t('plan_starter_f7')],
      cta: t('plan_starter_cta'), href: '/auth/signup?plan=starter', featured: false,
    },
    {
      name: t('plan_pro_name'), price: '$39', period: t('per_month'),
      features: [t('plan_pro_f1'), t('plan_pro_f2'), t('plan_pro_f3'), t('plan_pro_f4'), t('plan_pro_f5'), t('plan_pro_f6'), t('plan_pro_f7')],
      cta: t('plan_pro_cta'), href: '/auth/signup?plan=pro', featured: true,
    },
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
            <LanguageSwitcher />
            <Link href="#pricing" style={{ color: 'var(--ink-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>{tn('pricing')}</Link>
            <Link href="/auth/login" className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>{tn('login')}</Link>
            <Link href="/auth/signup" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>{tn('get_started')}</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 1.5rem 4rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--brand-light)', color: '#7a3815', padding: '0.35rem 0.9rem', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          <Zap size={13} /> {t('hero_badge')}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em', color: 'var(--ink)' }}>
          {t('hero_headline1')}<br />
          <span style={{ color: 'var(--brand)' }}>{t('hero_headline2')}</span>
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--ink-muted)', maxWidth: 540, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          {t('hero_sub')}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/signup" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
            {t('cta_primary')} <ArrowRight size={16} />
          </Link>
          <Link href="#how-it-works" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>{t('cta_secondary')}</Link>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--ink-subtle)' }}>{t('footnote')}</p>
      </section>

      {/* Social proof bar */}
      <div style={{ background: 'white', borderTop: '1px solid #eceae6', borderBottom: '1px solid #eceae6', padding: '1.2rem 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', padding: '0 1.5rem', flexWrap: 'wrap' }}>
          {[
            [t('stat1_value'), t('stat1_label')],
            [t('stat2_value'), t('stat2_label')],
            [t('stat3_value'), t('stat3_label')],
            [t('stat4_value'), t('stat4_label')],
          ].map(([stat, label]) => (
            <div key={stat} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--brand)' }}>{stat}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section id="how-it-works" style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 1.5rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '3rem' }}>{t('steps_title')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {steps.map(({ step, icon, title, desc }) => (
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
          <h2 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '3rem' }}>{t('features_title')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {features.map(({ icon, title, desc }) => (
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
        <h2 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '3rem' }}>{t('social_title')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {testimonials.map((t_) => (
            <div key={t_.name} className="testimonial-card card-hover">
              <div style={{ display: 'flex', gap: 2, marginBottom: '1rem', marginTop: '1rem' }}>
                {[...Array(t_.rating)].map((_, i) => <Star key={i} size={14} fill="#e8963a" color="#e8963a" />)}
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--ink)', lineHeight: 1.7, marginBottom: '1.25rem' }}>{t_.text}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand)' }}>
                  {t_.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)' }}>{t_.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{t_.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ background: 'white', borderTop: '1px solid #eceae6', padding: '5rem 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '0.75rem' }}>{t('pricing_title')}</h2>
          <p style={{ textAlign: 'center', color: 'var(--ink-muted)', marginBottom: '3rem' }}>{t('pricing_sub')}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
            {plans.map((plan) => (
              <div key={plan.name} style={{ border: plan.featured ? '2px solid var(--brand)' : '1px solid #eceae6', borderRadius: 'var(--radius-xl)', padding: '2rem', position: 'relative', background: plan.featured ? 'var(--paper)' : 'white' }}>
                {plan.featured && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--brand)', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.9rem', borderRadius: 100 }}>{t('most_popular')}</div>}
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

      {/* Final CTA */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{t('final_title')}</h2>
        <p style={{ color: 'var(--ink-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>{t('final_sub')}</p>
        <Link href="/auth/signup" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '0.85rem 2.5rem' }}>
          {t('final_cta')} <ArrowRight size={16} />
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
        <p style={{ fontSize: '0.8rem', color: 'var(--ink-subtle)' }}>© {new Date().getFullYear()} vouchly. {t('footer_copy')}</p>
      </footer>
    </div>
  )
}
