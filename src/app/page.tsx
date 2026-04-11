import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  Star,
  Zap,
  ArrowRight,
  Quote,
  Video,
  Wand2,
  Palette,
  Mail,
  Link2,
  Code2,
  BarChart3,
  Send,
  Sparkles,
  LayoutGrid,
  MessageSquarePlus,
  AlignLeft,
  Monitor,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import PricingSection from '@/components/PricingSection'
import { getAllPosts } from '@/lib/blog'

const ICON_STROKE = 1.5
const ICON_SIZE = 20

function IconTile({ Icon }: { Icon: LucideIcon }) {
  return (
    <div
      style={{
        flexShrink: 0,
        width: 40,
        height: 40,
        borderRadius: 10,
        background: 'var(--brand-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--brand)',
      }}
    >
      <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden />
    </div>
  )
}

export default async function Home() {
  const t = await getTranslations('home')
  const tn = await getTranslations('nav')

  const testimonials = [
    { name: t('t1_name'), role: t('t1_role'), text: t('t1_text'), rating: 5 },
    { name: t('t2_name'), role: t('t2_role'), text: t('t2_text'), rating: 5 },
    { name: t('t3_name'), role: t('t3_role'), text: t('t3_text'), rating: 5 },
  ]

  const features: { Icon: LucideIcon; title: string; desc: string }[] = [
    { Icon: Video, title: t('feat1_title'), desc: t('feat1_desc') },
    { Icon: Wand2, title: t('feat2_title'), desc: t('feat2_desc') },
    { Icon: Palette, title: t('feat3_title'), desc: t('feat3_desc') },
    { Icon: Star, title: t('feat4_title'), desc: t('feat4_desc') },
    { Icon: Mail, title: t('feat5_title'), desc: t('feat5_desc') },
    { Icon: Link2, title: t('feat6_title'), desc: t('feat6_desc') },
    { Icon: Code2, title: t('feat7_title'), desc: t('feat7_desc') },
    { Icon: BarChart3, title: t('feat8_title'), desc: t('feat8_desc') },
  ]

  const steps: { step: string; Icon: LucideIcon; title: string; desc: string }[] = [
    { step: '01', Icon: Send, title: t('step1_title'), desc: t('step1_desc') },
    { step: '02', Icon: Sparkles, title: t('step2_title'), desc: t('step2_desc') },
    { step: '03', Icon: LayoutGrid, title: t('step3_title'), desc: t('step3_desc') },
  ]

  const problems: { Icon: LucideIcon; problem: string; fix: string }[] = [
    { Icon: MessageSquarePlus, problem: 'Asking for testimonials feels awkward', fix: 'A beautiful branded form does the asking for you' },
    { Icon: AlignLeft, problem: 'The ones you get are too vague to convert', fix: 'AI rewrites them into compelling, specific stories' },
    { Icon: Monitor, problem: 'Nowhere to display them that looks good', fix: 'One script tag creates a stunning wall on your site' },
  ]

  const blogPosts = getAllPosts().slice(0, 3)

  const plans = [
    {
      name: t('plan_free_name'), monthlyPrice: '$0', annualMonthly: '$0', annualTotal: '$0', annualSavings: '$0', period: t('per_month'),
      features: [t('plan_free_f1'), t('plan_free_f2'), t('plan_free_f3'), t('plan_free_f4'), t('plan_free_f5')],
      cta: t('plan_free_cta'), href: '/auth/signup', featured: false, isFree: true,
    },
    {
      name: t('plan_starter_name'), monthlyPrice: '$19', annualMonthly: '$17.10', annualTotal: '$205.20', annualSavings: '$22.80', period: t('per_month'),
      features: [t('plan_starter_f1'), t('plan_starter_f2'), t('plan_starter_f3'), t('plan_starter_f4'), t('plan_starter_f5'), t('plan_starter_f6'), t('plan_starter_f7')],
      cta: t('plan_starter_cta'), href: '/auth/signup?plan=starter', featured: false, isFree: false,
    },
    {
      name: t('plan_pro_name'), monthlyPrice: '$39', annualMonthly: '$35.10', annualTotal: '$421.20', annualSavings: '$46.80', period: t('per_month'),
      features: [t('plan_pro_f1'), t('plan_pro_f2'), t('plan_pro_f3'), t('plan_pro_f4'), t('plan_pro_f5'), t('plan_pro_f6'), t('plan_pro_f7')],
      cta: t('plan_pro_cta'), href: '/auth/signup?plan=pro', featured: true, isFree: false,
    },
  ]

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #eceae6', background: 'rgba(253,248,240,0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, background: 'var(--brand)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Quote size={16} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--ink)' }}>vouchly</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="nav-secondary-links">
              <LanguageSwitcher />
            </span>
            <Link href="#pricing" className="nav-secondary-links" style={{ color: 'var(--ink-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>{tn('pricing')}</Link>
            <Link href="/auth/login" className="btn btn-secondary nav-secondary-links" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>{tn('login')}</Link>
            <Link href="/auth/signup" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>{tn('get_started')}</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(2.5rem, 8vw, 5rem) 1.25rem clamp(2rem, 6vw, 4rem)', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--brand-light)', color: '#7a3815', padding: '0.35rem 0.9rem', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          <Zap size={13} /> {t('hero_badge')}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 7vw, 4.5rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.03em', color: 'var(--ink)' }}>
          {t('hero_headline1')}<br />
          <span style={{ color: 'var(--brand)' }}>{t('hero_headline2')}</span>
        </h1>
        <p style={{ fontSize: 'clamp(1rem, 3vw, 1.15rem)', color: 'var(--ink-muted)', maxWidth: 540, margin: '0 auto clamp(1.5rem, 5vw, 2.5rem)', lineHeight: 1.7 }}>
          {t('hero_sub')}
        </p>
        <div className="hero-cta-row" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/signup" className="btn btn-primary hero-cta-btn" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
            {t('cta_primary')} <ArrowRight size={16} />
          </Link>
          <Link href="#how-it-works" className="btn btn-secondary hero-cta-btn" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>{t('cta_secondary')}</Link>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--ink-subtle)' }}>{t('footnote')}</p>
      </section>

      {/* Social proof bar */}
      <div style={{ background: 'white', borderTop: '1px solid #eceae6', borderBottom: '1px solid #eceae6', padding: '1.25rem 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem 2.5rem', padding: '0 1.25rem', flexWrap: 'wrap' }}>
          {[
            [t('stat1_value'), t('stat1_label')],
            [t('stat2_value'), t('stat2_label')],
            [t('stat3_value'), t('stat3_label')],
            [t('stat4_value'), t('stat4_label')],
          ].map(([stat, label]) => (
            <div key={stat} style={{ textAlign: 'center', minWidth: '5rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 4vw, 1.6rem)', fontWeight: 700, color: 'var(--brand)' }}>{stat}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Problem section */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(2.5rem, 8vw, 4rem) 1.25rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem', lineHeight: 1.25 }}>
          You have happy customers.<br />
          <span style={{ color: 'var(--ink-muted)', fontWeight: 500 }}>But no one else knows it.</span>
        </h2>
        <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', color: 'var(--ink-muted)', lineHeight: 1.75, marginBottom: '2rem' }}>
          92% of buyers read reviews before they buy. If your site has no testimonials — or weak ones like "great service, 5 stars" — you're invisible to the customers who need convincing most.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {problems.map(({ Icon, problem, fix }) => (
            <div key={problem} style={{ background: 'white', border: '1px solid #eceae6', borderRadius: 'var(--radius-lg)', padding: '1.25rem', textAlign: 'left' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <IconTile Icon={Icon} />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '0.6rem', lineHeight: 1.5 }}>{problem}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--brand)', fontWeight: 600, lineHeight: 1.5 }}>→ {fix}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(2.5rem, 8vw, 5rem) 1.25rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', marginBottom: 'clamp(1.5rem, 4vw, 3rem)' }}>{t('steps_title')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'clamp(1rem, 3vw, 2rem)' }}>
          {steps.map(({ step, Icon, title, desc }) => (
            <div key={step} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 700, color: '#f5ede0', lineHeight: 1 }}>{step}</div>
              <div style={{ marginBottom: '0.75rem' }}>
                <IconTile Icon={Icon} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{title}</h3>
              <p style={{ color: 'var(--ink-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ background: 'white', borderTop: '1px solid #eceae6', borderBottom: '1px solid #eceae6', padding: 'clamp(2.5rem, 8vw, 5rem) 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.25rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', marginBottom: 'clamp(1.5rem, 4vw, 3rem)' }}>{t('features_title')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'clamp(0.75rem, 2vw, 1.5rem)' }}>
            {features.map(({ Icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: '1rem', padding: '1.25rem', border: '1px solid #eceae6', borderRadius: 'var(--radius-lg)' }}>
                <IconTile Icon={Icon} />
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
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(2.5rem, 8vw, 5rem) 1.25rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', marginBottom: 'clamp(1.5rem, 4vw, 3rem)' }}>{t('social_title')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'clamp(1rem, 2vw, 1.5rem)' }}>
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
      <PricingSection
        plans={plans}
        title={t('pricing_title')}
        subtitle={t('pricing_sub')}
        mostPopularLabel={t('most_popular')}
      />

      {/* From the Blog */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(2.5rem, 8vw, 5rem) 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)', gap: '1rem', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', margin: 0 }}>From the blog</h2>
          <Link href="/blog" style={{ fontSize: '0.875rem', color: 'var(--brand)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            All articles <ArrowRight size={13} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(1rem, 2vw, 1.5rem)' }}>
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
              <article className="card card-hover" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '0.6rem', cursor: 'pointer' }}>
                <span style={{ alignSelf: 'flex-start', background: 'var(--brand-light)', color: '#7a3815', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 100 }}>
                  {post.category}
                </span>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.35, margin: 0 }}>
                  {post.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', lineHeight: 1.6, margin: 0, flex: 1 }}>
                  {post.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #f5ede0' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-subtle)' }}>
                    {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-subtle)' }}>{post.readingTime}</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(2.5rem, 8vw, 5rem) 1.25rem', textAlign: 'center' }}>
        <div style={{ background: 'var(--brand)', borderRadius: 'var(--radius-xl)', padding: 'clamp(2rem, 6vw, 4rem) 2rem', color: 'white' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', marginBottom: '1rem', color: 'white' }}>{t('final_title')}</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto 2rem' }}>{t('final_sub')}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: 'var(--brand)', fontWeight: 700, fontSize: '1rem', padding: '0.85rem 2.25rem', borderRadius: 'var(--radius)', textDecoration: 'none' }}>
              {t('final_cta')} <ArrowRight size={16} />
            </Link>
            <Link href="#pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: 'white', fontWeight: 600, fontSize: '0.95rem', padding: '0.85rem 1.75rem', borderRadius: 'var(--radius)', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.4)' }}>
              View pricing
            </Link>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginTop: '1.25rem' }}>Free forever · No credit card · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #eceae6', padding: '2rem 1.25rem', textAlign: 'center' }}>
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
