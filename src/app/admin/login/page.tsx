'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Invalid password.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#1a1713',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: '#fdf8f0', borderRadius: 20, padding: '52px 60px',
        width: 420, boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: '#d4751f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💬</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#1a1713' }}>vouchly admin</div>
            <div style={{ fontSize: 13, color: '#7a7367' }}>Restricted access</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#7a7367', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Admin password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                border: '1.5px solid #eceae6', fontSize: 16, outline: 'none',
                background: 'white', boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{ background: '#ffe4e4', color: '#c0392b', borderRadius: 8, padding: '10px 14px', fontSize: 14 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#d4751f', color: 'white', border: 'none',
              borderRadius: 10, padding: '14px', fontSize: 16, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
