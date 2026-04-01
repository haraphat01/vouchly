'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('auth')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function verify() {
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type') as 'signup' | 'recovery' | null

      if (!token_hash || !type) {
        const hash = window.location.hash
        if (hash) {
          const params = new URLSearchParams(hash.slice(1))
          const access_token = params.get('access_token')
          if (access_token) {
            setStatus('success')
            setMessage(t('verify_success_desc'))
            try {
              const { data: { user } } = await supabase.auth.getUser()
              if (user) {
                const { data: { session } } = await supabase.auth.getSession()
                await fetch('/api/auth/welcome', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
                  body: JSON.stringify({ email: user.email, name: user.user_metadata?.full_name }),
                })
              }
            } catch {}
            setTimeout(() => router.push('/dashboard'), 2000)
            return
          }
        }
        setStatus('error')
        setMessage(t('verify_invalid_link'))
        return
      }

      const { error } = await supabase.auth.verifyOtp({ token_hash, type })

      if (error) {
        setStatus('error')
        setMessage(error.message || t('verify_invalid_link'))
        return
      }

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await fetch('/api/auth/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, name: user.user_metadata?.full_name }),
          })
        }
      } catch {}

      setStatus('success')
      setMessage(t('verify_success_desc'))
      setTimeout(() => router.push('/dashboard'), 2000)
    }

    verify()
  }, [router, searchParams, t])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        {status === 'loading' && (
          <>
            <Loader2 size={48} color="var(--brand)" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t('verify_loading_title')}</h2>
            <p style={{ color: 'var(--ink-muted)' }}>{t('verify_loading_sub')}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 size={56} color="#2e7d4f" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{t('verify_success_title')}</h2>
            <p style={{ color: 'var(--ink-muted)', lineHeight: 1.6 }}>{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={56} color="#c0392b" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{t('verify_error_title')}</h2>
            <p style={{ color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>{message}</p>
            <Link href="/auth/login" className="btn btn-primary">{t('go_to_login')}</Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={48} color="var(--brand)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
