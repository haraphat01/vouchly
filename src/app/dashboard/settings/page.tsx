'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/supabase'
import { PLANS } from '@/lib/utils'
import { Loader2, CheckCircle2, User, CreditCard, Zap } from 'lucide-react'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState('')
  const [tab, setTab] = useState<'profile' | 'billing'>('profile')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      supabase.from('profiles').select('*').eq('id', session.user.id).single()
        .then(({ data }) => { setProfile(data); setName(data?.full_name || ''); setLoading(false) })
    })
    const params = new URLSearchParams(window.location.search)
    if (params.get('tab') === 'billing') setTab('billing')
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('profiles').update({ full_name: name }).eq('id', profile!.id)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleUpgrade(plan: 'starter' | 'pro') {
    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  if (loading) return <div style={{ padding: '3rem' }}><div className="skeleton" style={{ height: 200 }} /></div>

  return (
    <div style={{ padding: '2.5rem', maxWidth: 680 }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Settings</h1>
      <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>Manage your account and subscription.</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem', borderBottom: '1px solid #eceae6' }}>
        {[['profile', User, 'Profile'], ['billing', CreditCard, 'Billing']].map(([key, Icon, label]) => (
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
            <h2 style={{ fontSize: '1rem', marginBottom: 0 }}>Personal info</h2>
            <div>
              <label className="label">Full name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" value={profile?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: '0.3rem' }}>Email cannot be changed here. Contact support to update it.</p>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
            {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : saved ? <><CheckCircle2 size={14} /> Saved!</> : 'Save changes'}
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
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>Current plan: <span style={{ color: 'var(--brand)' }}>{PLANS[profile?.plan || 'free'].name}</span></div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>${PLANS[profile?.plan || 'free'].price}/month</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                ['Testimonials', PLANS[profile?.plan || 'free'].testimonials === -1 ? 'Unlimited' : `${PLANS[profile?.plan || 'free'].testimonials} max`],
                ['Spaces', PLANS[profile?.plan || 'free'].spaces === -1 ? 'Unlimited' : `${PLANS[profile?.plan || 'free'].spaces} max`],
                ['AI rewriter', PLANS[profile?.plan || 'free'].ai ? '✓ Included' : '✗ Not included'],
                ['AI Testimonial Coach', PLANS[profile?.plan || 'free'].coach ? '✓ Included' : '✗ Not included'],
                ['Video testimonials', PLANS[profile?.plan || 'free'].video ? '✓ Included' : '✗ Not included'],
                ['Remove branding', PLANS[profile?.plan || 'free'].removeBranding ? '✓ Included' : '✗ Not included'],
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
              <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Upgrade your plan</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(profile?.plan === 'free' ? ['starter', 'pro'] : ['pro']).map(planKey => {
                  const plan = PLANS[planKey as keyof typeof PLANS]
                  return (
                    <div key={planKey} className="card" style={{ border: planKey === 'pro' ? '2px solid var(--brand)' : '1px solid #eceae6', position: 'relative' }}>
                      {planKey === 'pro' && <div style={{ position: 'absolute', top: -12, right: 20, background: 'var(--brand)', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: 100 }}>Most popular</div>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{plan.name}</h3>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700 }}>${plan.price}</span>
                          <span style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>/month</span>
                        </div>
                        <button onClick={() => handleUpgrade(planKey as 'starter' | 'pro')} className={`btn ${planKey === 'pro' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.875rem' }}>
                          Upgrade to {plan.name}
                        </button>
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {[
                          plan.testimonials === -1 ? 'Unlimited testimonials' : `${plan.testimonials} testimonials`,
                          plan.spaces === -1 ? 'Unlimited spaces' : `${plan.spaces} spaces`,
                          plan.ai && 'AI rewriter',
                          plan.coach && 'AI Testimonial Coach',
                          plan.video && 'Video testimonials',
                          plan.removeBranding && 'Remove branding',
                          plan.customDomain && 'Custom domain',
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
              To cancel or manage your subscription, contact support at <strong>support@vouchly.app</strong>. You can also manage billing through the Stripe customer portal.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
