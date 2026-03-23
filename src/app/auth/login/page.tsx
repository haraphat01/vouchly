'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Quote, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
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
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Welcome back</h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem' }}>Sign in to your account</p>
        </div>

        <div className="card">
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                <label className="label" style={{ marginBottom: 0 }}>Password</label>
                <Link href="/auth/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--brand)', textDecoration: 'none' }}>Forgot password?</Link>
              </div>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <p style={{ color: '#c0392b', fontSize: '0.85rem', background: '#ffe4e4', padding: '0.6rem 0.9rem', borderRadius: 8 }}>{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.25rem', justifyContent: 'center' }}>
              {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Signing in…</> : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
          Don't have an account?{' '}
          <Link href="/auth/signup" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
