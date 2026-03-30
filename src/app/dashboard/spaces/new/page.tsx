'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/supabase'
import { generateSlug, PLANS } from '@/lib/utils'
import { ArrowLeft, Loader2, Plus, X, Lock } from 'lucide-react'

export default function NewSpacePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [spaceCount, setSpaceCount] = useState(0)
  const [planLoading, setPlanLoading] = useState(true)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    header_title: 'Share your experience',
    header_message: 'How has our product or service helped you? Your feedback means the world to us.',
    theme_color: '#d4751f',
    collect_text: true,
    collect_video: false,
    questions: ['What is your name?', 'What do you love most about our product?'],
  })
  const [newQuestion, setNewQuestion] = useState('')

  useEffect(() => {
    async function loadPlan() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth/login'); return }
      const [{ data: prof }, { count }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('spaces').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id),
      ])
      setProfile(prof)
      setSpaceCount(count || 0)
      setPlanLoading(false)
    }
    loadPlan()
  }, [router])

  function handleNameChange(name: string) {
    setForm(f => ({ ...f, name, slug: generateSlug(name) }))
  }

  function addQuestion() {
    if (!newQuestion.trim()) return
    setForm(f => ({ ...f, questions: [...f.questions, newQuestion.trim()] }))
    setNewQuestion('')
  }

  function removeQuestion(i: number) {
    setForm(f => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth/login'); return }
    const res = await fetch('/api/spaces', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        name: form.name,
        slug: form.slug,
        description: form.description,
        header_title: form.header_title,
        header_message: form.header_message,
        theme_color: form.theme_color,
        collect_text: form.collect_text,
        collect_video: form.collect_video,
        questions: form.questions,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to create space')
      setLoading(false)
    } else {
      router.push('/dashboard/spaces')
    }
  }

  if (planLoading) {
    return (
      <div className="dash-page">
        <div className="skeleton" style={{ height: 200 }} />
      </div>
    )
  }

  const planConfig = PLANS[(profile?.plan || 'free') as keyof typeof PLANS]
  const atSpaceLimit = planConfig.spaces !== -1 && spaceCount >= planConfig.spaces
  const canVideo = planConfig.video

  // Show upgrade wall if at space limit
  if (atSpaceLimit) {
    return (
      <div className="dash-page" style={{ maxWidth: 680 }}>
        <Link href="/dashboard/spaces" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
          <ArrowLeft size={15} /> Back to spaces
        </Link>
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Lock size={24} color="var(--brand)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Space limit reached</h2>
          <p style={{ color: 'var(--ink-muted)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
            Your <strong>{planConfig.name}</strong> plan includes <strong>{planConfig.spaces} space{planConfig.spaces !== 1 ? 's' : ''}</strong>. You've used all of them.
          </p>
          <p style={{ color: 'var(--ink-muted)', marginBottom: '2rem', lineHeight: 1.6, fontSize: '0.9rem' }}>
            Upgrade to {profile?.plan === 'free' ? 'Starter (3 spaces) or Pro (unlimited)' : 'Pro for unlimited spaces'} to create more.
          </p>
          <Link href="/dashboard/settings?tab=billing" className="btn btn-primary" style={{ justifyContent: 'center' }}>
            Upgrade your plan
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="dash-page" style={{ maxWidth: 680 }}>
      <Link href="/dashboard/spaces" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
        <ArrowLeft size={15} /> Back to spaces
      </Link>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Create a space</h1>
      <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>A space is a branded collection page for a product or service.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Basic info */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: 0 }}>Basic info</h2>
          <div>
            <label className="label">Space name *</label>
            <input className="input" value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Acme SaaS, My Agency, Course Pro" required />
          </div>
          <div>
            <label className="label">URL slug *</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #d5d1c9', borderRadius: 10, overflow: 'hidden', background: 'white' }}>
              <span style={{ padding: '0.65rem 0.75rem', background: 'var(--paper)', color: 'var(--ink-muted)', fontSize: '0.85rem', borderRight: '1px solid #d5d1c9', whiteSpace: 'nowrap' }}>
                /collect/
              </span>
              <input style={{ flex: 1, border: 'none', outline: 'none', padding: '0.65rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--ink)' }}
                value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))} required />
            </div>
          </div>
          <div>
            <label className="label">Description <span style={{ color: 'var(--ink-subtle)', fontWeight: 400 }}>(optional)</span></label>
            <textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of your product/service" rows={2} style={{ resize: 'vertical' }} />
          </div>
        </div>

        {/* Collection form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: 0 }}>Collection form</h2>
          <div>
            <label className="label">Headline</label>
            <input className="input" value={form.header_title} onChange={e => setForm(f => ({ ...f, header_title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea className="input" value={form.header_message} onChange={e => setForm(f => ({ ...f, header_message: e.target.value }))} rows={2} style={{ resize: 'vertical' }} />
          </div>
          <div>
            <label className="label">Accept</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Text testimonials — always available */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={form.collect_text}
                  onChange={e => setForm(f => ({ ...f, collect_text: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: 'var(--brand)', cursor: 'pointer' }} />
                💬 Text testimonials
              </label>

              {/* Video testimonials — Pro only */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', cursor: canVideo ? 'pointer' : 'default', opacity: canVideo ? 1 : 0.5 }}>
                <input type="checkbox"
                  checked={canVideo ? form.collect_video : false}
                  disabled={!canVideo}
                  onChange={e => canVideo && setForm(f => ({ ...f, collect_video: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: 'var(--brand)', cursor: canVideo ? 'pointer' : 'not-allowed' }} />
                🎥 Video testimonials
                {!canVideo && (
                  <Link href="/dashboard/settings?tab=billing" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', color: 'var(--brand)', textDecoration: 'none', fontWeight: 600 }}>
                    <Lock size={11} /> Pro
                  </Link>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: 0 }}>Questions to ask submitters</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {form.questions.map((q, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--paper)', border: '1px solid #eceae6', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
                <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--ink)' }}>{q}</span>
                <button type="button" onClick={() => removeQuestion(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', padding: 2 }}><X size={14} /></button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input className="input" value={newQuestion} onChange={e => setNewQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addQuestion())}
              placeholder="Add a question…" style={{ flex: 1 }} />
            <button type="button" onClick={addQuestion} className="btn btn-secondary"><Plus size={14} /></button>
          </div>
        </div>

        {/* Appearance */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: 0 }}>Appearance</h2>
          <div>
            <label className="label">Accent color</label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {['#d4751f', '#2e7d4f', '#1a5fa8', '#7c5cbf', '#c0392b', '#1a7a7a'].map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, theme_color: c }))}
                  style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: form.theme_color === c ? '3px solid var(--ink)' : '2px solid transparent', cursor: 'pointer' }} />
              ))}
              <input type="color" value={form.theme_color} onChange={e => setForm(f => ({ ...f, theme_color: e.target.value }))}
                style={{ width: 36, height: 30, borderRadius: 6, border: '1px solid #d5d1c9', cursor: 'pointer', padding: 2 }} />
            </div>
          </div>
        </div>

        {error && <p style={{ color: '#c0392b', fontSize: '0.85rem', background: '#ffe4e4', padding: '0.7rem 1rem', borderRadius: 8 }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/dashboard/spaces" className="btn btn-secondary">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
            {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Creating…</> : 'Create space'}
          </button>
        </div>
      </form>
    </div>
  )
}
