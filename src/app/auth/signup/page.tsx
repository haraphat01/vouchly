'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Quote, Loader2, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function SignupPage() {
  const t = useTranslations('auth')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error || 'Something went wrong. Please try again.')
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Mail size={32} color="var(--brand)" />
          </div>
          <h2 style={{ fontSize: '1.9rem', marginBottom: '0.75rem' }}>{t('check_inbox_title')}</h2>
          <p style={{ color: 'var(--ink-muted)', lineHeight: 1.7, fontSize: '1rem', marginBottom: '1.5rem' }}>
            {t.rich('check_inbox_desc', {
              email,
              strong: (chunks) => <strong style={{ color: 'var(--ink)' }}>{chunks}</strong>,
            })}
          </p>
          <div style={{ background: 'white', border: '1px solid #eceae6', borderRadius: 12, padding: '1.25rem', fontSize: '0.85rem', color: 'var(--ink-muted)', textAlign: 'left' }}>
            <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: '0.4rem' }}>{t('didnt_get_it')}</strong>
            {t('check_spam')}{' '}
            <button onClick={() => setDone(false)} style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontWeight: 600, padding: 0, fontSize: 'inherit' }}>
              {t('try_again')}
            </button>.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <LanguageSwitcher />
          </div>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: '2rem' }}>
            <div style={{ width: 36, height: 36, background: 'var(--brand)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Quote size={18} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', color: 'var(--ink)' }}>vouchly</span>
          </Link>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{t('signup_title')}</h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem' }}>{t('signup_sub')}</p>
        </div>
        <div className="card">
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label className="label">{t('full_name')}</label>
              <input className="input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" required />
            </div>
            <div>
              <label className="label">{t('email')}</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="label">{t('password')}</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('password_hint')} minLength={8} required />
            </div>
            {error && <p style={{ color: '#c0392b', fontSize: '0.85rem', background: '#ffe4e4', padding: '0.6rem 0.9rem', borderRadius: 8 }}>{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.25rem', justifyContent: 'center' }}>
              {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t('creating_account')}</> : t('create_free_account')}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
          {t('already_have_account')}{' '}
          <Link href="/auth/login" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>{t('sign_in_link')}</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--ink-subtle)' }}>
          {t('terms_notice')}
        </p>
      </div>
    </div>
  )
}
