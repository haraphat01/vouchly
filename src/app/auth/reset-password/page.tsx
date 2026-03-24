'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Quote, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function ResetPasswordPage() {
  const router = useRouter()
  const t = useTranslations('auth')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError(t('passwords_no_match')); return }
    if (password.length < 8) { setError(t('password_too_short')); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2500)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: '2rem' }}>
            <div style={{ width: 36, height: 36, background: 'var(--brand)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Quote size={18} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', color: 'var(--ink)' }}>vouchly</span>
          </Link>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{t('reset_title')}</h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem' }}>{t('reset_sub')}</p>
        </div>

        {done ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <CheckCircle2 size={44} color="#2e7d4f" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{t('password_updated_title')}</h2>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>{t('password_updated_redirect')}</p>
          </div>
        ) : (
          <div className="card">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label className="label">{t('new_password')}</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={t('password_placeholder')} minLength={8} required style={{ paddingRight: '2.75rem' }} />
                  <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', display: 'flex', alignItems: 'center' }}>
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">{t('confirm_password')}</label>
                <input className="input" type={show ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={t('confirm_placeholder')} required />
              </div>
              {error && <p style={{ color: '#c0392b', fontSize: '0.85rem', background: '#ffe4e4', padding: '0.6rem 0.9rem', borderRadius: 8 }}>{error}</p>}
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center' }}>
                {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> {t('updating')}</> : t('set_new_password')}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
