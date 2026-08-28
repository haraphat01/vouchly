'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { PLANS } from '@/lib/utils'
import { Loader2, CheckCircle2, User, CreditCard, Zap } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { useQueryClient } from '@tanstack/react-query'

export default function SettingsPage() {
  const t = useTranslations('dashboard.settings_page')
  const { data: profile, isLoading } = useProfile()
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState('')
  const [tab, setTab] = useState<'profile' | 'billing'>('profile')
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly')

  useEffect(() => {
    if (profile?.full_name) setName(profile.full_name)
  }, [profile])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('tab') === 'billing') setTab('billing')
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({ full_name: name }).eq('id', profile.id)
    queryClient.invalidateQueries({ queryKey: ['profile'] })
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleUpgrade(plan: 'starter' | 'pro') {
    const { data: { session: authSession } } = await supabase.auth.getSession()
    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authSession?.access_token ? { 'Authorization': `Bearer ${authSession.access_token}` } : {}),
      },
      body: JSON.stringify({ plan, interval: billingInterval }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  if (isLoading) return <div className="dash-page"><div className="skeleton" style={{ height: 200 }} /></div>

  function planName(key: string) {
    return key === 'pro' ? t('plan_name_pro') : key === 'starter' ? t('plan_name_starter') : t('plan_name_free')
  }

  return (
    <div className="dash-page" style={{ maxWidth: 680 }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{t('title')}</h1>
      <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>{t('subtitle')}</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem', borderBottom: '1px solid #eceae6' }}>
        {[['profile', User, t('tab_profile')], ['billing', CreditCard, t('tab_billing')]].map(([key, Icon, label]) => (
          <button key={key as string} onClick={() => setTab(key as 'profile' | 'billing')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: tab === key ? '2px solid var(--brand)' : '2px solid transparent', cursor: 'pointer', fontSize: '0.875rem', fontWeight: tab === key ? 600 : 400, color: tab === key ? 'var(--brand)' : 'var(--ink-muted)', marginBottom: -1 }}>
            {/* @ts-ignore */}
            <Icon size={14} /> {label as string}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1rem', marginBottom: 0 }}>{t('personal_info')}</h2>
            <div>
              <label className="label">{t('full_name_label')}</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder={t('name_placeholder')} />
            </div>
            <div>
              <label className="label">{t('email_label')}</label>
              <input className="input" value={profile?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: '0.3rem' }}>{t('email_note')}</p>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
            {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> {t('saving')}</> : saved ? <><CheckCircle2 size={14} /> {t('saved')}</> : t('save_changes')}
          </button>
        </form>
      )}

      {tab === 'billing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Current plan */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="var(--brand)" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{t('current_plan')} <span style={{ color: 'var(--brand)' }}>{planName(profile?.plan || 'free')}</span></div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>${PLANS[profile?.plan || 'free'].price}{t('per_month')}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                [t('feature_testimonials'), PLANS[profile?.plan || 'free'].testimonials === -1 ? t('unlimited') : `${PLANS[profile?.plan || 'free'].testimonials} ${t('max_suffix')}`],
                [t('feature_spaces'), PLANS[profile?.plan || 'free'].spaces === -1 ? t('unlimited') : `${PLANS[profile?.plan || 'free'].spaces} ${t('max_suffix')}`],
                [t('feature_ai'), PLANS[profile?.plan || 'free'].ai ? `✓ ${t('included')}` : `✗ ${t('not_included')}`],
                [t('feature_coach'), PLANS[profile?.plan || 'free'].coach ? `✓ ${t('included')}` : `✗ ${t('not_included')}`],
                [t('feature_video'), PLANS[profile?.plan || 'free'].video ? `✓ ${t('included')}` : `✗ ${t('not_included')}`],
                [t('feature_branding'), PLANS[profile?.plan || 'free'].removeBranding ? `✓ ${t('included')}` : `✗ ${t('not_included')}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.3rem 0', borderBottom: '1px solid #f5ede0' }}>
                  <span style={{ color: 'var(--ink-muted)' }}>{k}</span>
                  <span style={{ color: (v as string).startsWith('✓') ? '#2e7d4f' : (v as string).startsWith('✗') ? '#c0392b' : 'var(--ink)', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade plans */}
          {profile?.plan !== 'pro' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h2 style={{ fontSize: '1rem', margin: 0 }}>{t('upgrade_plan_title')}</h2>
                {/* Billing interval toggle */}
                <div style={{ display: 'inline-flex', alignItems: 'center', background: '#f5ede0', borderRadius: 100, padding: '0.2rem', gap: '0.15rem' }}>
                  {(['monthly', 'annual'] as const).map(iv => (
                    <button key={iv} onClick={() => setBillingInterval(iv)}
                      style={{ padding: '0.3rem 0.85rem', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s', background: billingInterval === iv ? 'white' : 'transparent', color: billingInterval === iv ? 'var(--ink)' : 'var(--ink-muted)', boxShadow: billingInterval === iv ? '0 1px 3px rgba(0,0,0,0.12)' : 'none' }}>
                      {iv === 'monthly' ? t('monthly') : t('annual')}
                      {iv === 'annual' && <span style={{ marginLeft: 5, background: '#2e7d4f', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: 100 }}>{t('save_badge')}</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(profile?.plan === 'free' ? ['starter', 'pro'] : ['pro']).map(planKey => {
                  const plan = PLANS[planKey as keyof typeof PLANS]
                  const isAnnual = billingInterval === 'annual'
                  const displayPrice = isAnnual ? plan.annualMonthly : plan.price
                  return (
                    <div key={planKey} className="card" style={{ border: planKey === 'pro' ? '2px solid var(--brand)' : '1px solid #eceae6', position: 'relative' }}>
                      {planKey === 'pro' && <div style={{ position: 'absolute', top: -12, right: 20, background: 'var(--brand)', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: 100 }}>{t('most_popular')}</div>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{planName(planKey)}</h3>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700 }}>${displayPrice}</span>
                            <span style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>{t('per_month')}</span>
                          </div>
                          {isAnnual && (
                            <div style={{ fontSize: '0.75rem', color: '#2e7d4f', fontWeight: 600 }}>
                              {t('per_year_save', { price: plan.annualPrice, amount: Math.round((plan.price * 12 - plan.annualPrice) * 100) / 100 })}
                            </div>
                          )}
                        </div>
                        <button onClick={() => handleUpgrade(planKey as 'starter' | 'pro')} className={`btn ${planKey === 'pro' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.875rem' }}>
                          {t('upgrade_to', { plan: planName(planKey) })}
                        </button>
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {[
                          plan.testimonials === -1 ? t('feature_unlimited_testimonials') : t('feature_n_testimonials', { count: plan.testimonials }),
                          plan.spaces === -1 ? t('feature_unlimited_spaces') : t('feature_n_spaces', { count: plan.spaces }),
                          plan.ai && t('feature_ai'),
                          plan.coach && t('feature_coach'),
                          plan.video && t('feature_video'),
                          plan.removeBranding && t('feature_branding'),
                          plan.customDomain && t('feature_custom_domain'),
                        ].filter(Boolean).map(f => (
                          <li key={f as string} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--ink)' }}>
                            <CheckCircle2 size={13} color="var(--brand)" /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {profile?.plan !== 'free' && (
            <div style={{ padding: '1rem', background: 'var(--paper)', border: '1px solid #eceae6', borderRadius: 10, fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
              {t.rich('cancel_note', { b: (chunks) => <strong>{chunks}</strong>, email: 'support@vouchly.tech' })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
