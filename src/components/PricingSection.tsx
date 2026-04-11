'use client'
import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

type Plan = {
  name: string
  monthlyPrice: string
  annualMonthly: string
  annualTotal: string
  annualSavings: string
  period: string
  features: string[]
  cta: string
  href: string
  featured: boolean
  isFree: boolean
}

type Props = {
  plans: Plan[]
  title: string
  subtitle: string
  mostPopularLabel: string
}

export default function PricingSection({ plans, title, subtitle, mostPopularLabel }: Props) {
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly')

  return (
    <section id="pricing" style={{ background: 'white', borderTop: '1px solid #eceae6', padding: 'clamp(2.5rem, 8vw, 5rem) 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.25rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', marginBottom: '0.75rem' }}>{title}</h2>
        <p style={{ textAlign: 'center', color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>{subtitle}</p>

        {/* Billing interval toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'clamp(1.5rem, 4vw, 3rem)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', background: '#f5ede0', borderRadius: 100, padding: '0.25rem', gap: '0.15rem' }}>
            {(['monthly', 'annual'] as const).map(iv => (
              <button key={iv} onClick={() => setInterval(iv)}
                style={{ padding: '0.4rem 1.1rem', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.15s', background: interval === iv ? 'white' : 'transparent', color: interval === iv ? 'var(--ink)' : 'var(--ink-muted)', boxShadow: interval === iv ? '0 1px 4px rgba(0,0,0,0.12)' : 'none' }}>
                {iv === 'monthly' ? 'Monthly' : 'Annual'}
                {iv === 'annual' && (
                  <span style={{ marginLeft: 6, background: '#2e7d4f', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: 100 }}>−10%</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
          {plans.map((plan) => {
            const isAnnual = interval === 'annual' && !plan.isFree
            const price = isAnnual ? plan.annualMonthly : plan.monthlyPrice
            return (
              <div key={plan.name} style={{ border: plan.featured ? '2px solid var(--brand)' : '1px solid #eceae6', borderRadius: 'var(--radius-xl)', padding: 'clamp(1.25rem, 4vw, 2rem)', position: 'relative', background: plan.featured ? 'var(--paper)' : 'white' }}>
                {plan.featured && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--brand)', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.9rem', borderRadius: 100, whiteSpace: 'nowrap' }}>
                    {mostPopularLabel}
                  </div>
                )}
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{plan.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: isAnnual ? '0.25rem' : '1.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--ink)' }}>{price}</span>
                  <span style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>{plan.period}</span>
                </div>
                {isAnnual && (
                  <p style={{ fontSize: '0.78rem', color: '#2e7d4f', fontWeight: 600, marginBottom: '1.5rem' }}>
                    {plan.annualTotal}/year · Save {plan.annualSavings}
                  </p>
                )}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'var(--ink)' }}>
                      <CheckCircle2 size={15} color="var(--brand)" style={{ flexShrink: 0 }} /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.isFree ? plan.href : `${plan.href}&interval=${interval}`}
                  className={`btn ${plan.featured ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {plan.cta}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
