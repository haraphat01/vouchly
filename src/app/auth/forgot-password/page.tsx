'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Quote, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function ForgotPasswordPage() {
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    if (res.ok) {
      setDone(true)
    } else {
      const { error: msg } = await res.json()
      setError(msg || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
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
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{t('forgot_title')}</h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem' }}>{t('forgot_sub')}</p>
        </div>

        {done ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <CheckCircle2 size={44} color="#2e7d4f" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{t('reset_sent_title')}</h2>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {t.rich('reset_sent_desc', {
                email,
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </p>
          </div>
        ) : (
          <div className="card">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label className="label">{t('email_address')}</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              {error && <p style={{ color: '#c0392b', fontSize: '0.85rem', background: '#ffe4e4', padding: '0.6rem 0.9rem', borderRadius: 8 }}>{error}</p>}
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center' }}>
                {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> {t('sending')}</> : t('send_reset_link')}
              </button>
            </form>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
          <Link href="/auth/login" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={13} /> {t('back_to_login')}
          </Link>
        </p>
      </div>
    </div>
  )
}
