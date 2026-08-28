'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/supabase'
import { generateSlug, PLANS } from '@/lib/utils'
import { ArrowLeft, Loader2, Plus, X, Lock } from 'lucide-react'
import { toast } from 'sonner'

export default function NewSpacePage() {
  const t = useTranslations('dashboard.spaces_new')
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
    rating_required: false,
    auto_approve: false,
    questions: ['What problem were you trying to solve before using us?', 'What specific result or outcome have you seen?'],
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
        rating_required: form.rating_required,
        auto_approve: form.auto_approve,
        questions: form.questions,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error || t('create_failed'))
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
          <ArrowLeft size={15} /> {t('back_to_spaces')}
        </Link>
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Lock size={24} color="var(--brand)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{t('limit_title')}</h2>
          <p style={{ color: 'var(--ink-muted)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
            {t.rich('limit_desc1', { b: (chunks) => <strong>{chunks}</strong>, plan: planConfig.name, count: planConfig.spaces })}
          </p>
          <p style={{ color: 'var(--ink-muted)', marginBottom: '2rem', lineHeight: 1.6, fontSize: '0.9rem' }}>
            {profile?.plan === 'free' ? t('limit_desc2_free') : t('limit_desc2_paid')}
          </p>
          <Link href="/dashboard/settings?tab=billing" className="btn btn-primary" style={{ justifyContent: 'center' }}>
            {t('upgrade_cta')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="dash-page" style={{ maxWidth: 680 }}>
      <Link href="/dashboard/spaces" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
        <ArrowLeft size={15} /> {t('back_to_spaces')}
      </Link>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{t('title')}</h1>
      <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>{t('subtitle')}</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Basic info */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: 0 }}>{t('section_basic')}</h2>
          <div>
            <label className="label">{t('name_label')}</label>
            <input className="input" value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder={t('name_placeholder')} required />
          </div>
          <div>
            <label className="label">{t('slug_label')}</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #d5d1c9', borderRadius: 10, overflow: 'hidden', background: 'white' }}>
              <span style={{ padding: '0.65rem 0.75rem', background: 'var(--paper)', color: 'var(--ink-muted)', fontSize: '0.85rem', borderRight: '1px solid #d5d1c9', whiteSpace: 'nowrap' }}>
                /collect/
              </span>
              <input style={{ flex: 1, border: 'none', outline: 'none', padding: '0.65rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--ink)' }}
                value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))} required />
            </div>
          </div>
          <div>
            <label className="label">{t('description_label')} <span style={{ color: 'var(--ink-subtle)', fontWeight: 400 }}>{t('description_optional')}</span></label>
            <textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder={t('description_placeholder')} rows={2} style={{ resize: 'vertical' }} />
          </div>
        </div>

        {/* Collection form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: 0 }}>{t('section_form')}</h2>
          <div>
            <label className="label">{t('headline_label')}</label>
            <input className="input" value={form.header_title} onChange={e => setForm(f => ({ ...f, header_title: e.target.value }))} />
          </div>
          <div>
            <label className="label">{t('message_label')}</label>
            <textarea className="input" value={form.header_message} onChange={e => setForm(f => ({ ...f, header_message: e.target.value }))} rows={2} style={{ resize: 'vertical' }} />
          </div>
          <div>
            <label className="label">{t('accept_label')}</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Text testimonials — always available */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={form.collect_text}
                  onChange={e => setForm(f => ({ ...f, collect_text: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: 'var(--brand)', cursor: 'pointer' }} />
                💬 {t('text_checkbox')}
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={form.rating_required}
                  onChange={e => setForm(f => ({ ...f, rating_required: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: 'var(--brand)', cursor: 'pointer' }} />
                ⭐ {t('rating_checkbox')}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={form.auto_approve}
                  onChange={e => setForm(f => ({ ...f, auto_approve: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: 'var(--brand)', cursor: 'pointer' }} />
                ✅ {t('auto_approve_checkbox')}
              </label>

              {/* Video testimonials — Pro only */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', cursor: canVideo ? 'pointer' : 'default', opacity: canVideo ? 1 : 0.5 }}>
                <input type="checkbox"
                  checked={canVideo ? form.collect_video : false}
                  disabled={!canVideo}
                  onChange={e => canVideo && setForm(f => ({ ...f, collect_video: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: 'var(--brand)', cursor: canVideo ? 'pointer' : 'not-allowed' }} />
                🎥 {t('video_checkbox')}
                {!canVideo && (
                  <Link href="/dashboard/settings?tab=billing" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', color: 'var(--brand)', textDecoration: 'none', fontWeight: 600 }}>
                    <Lock size={11} /> {t('pro_badge')}
                  </Link>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{t('section_questions')}</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', margin: 0 }}>{t.rich('questions_desc', { b: (chunks) => <strong>{chunks}</strong> })}</p>
          </div>
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
              placeholder={t('question_placeholder')} style={{ flex: 1 }} />
            <button type="button" onClick={addQuestion} className="btn btn-secondary"><Plus size={14} /></button>
          </div>
        </div>

        {/* Appearance */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: 0 }}>{t('section_appearance')}</h2>
          <div>
            <label className="label">{t('accent_color_label')}</label>
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

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/dashboard/spaces" className="btn btn-secondary">{t('cancel')}</Link>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
            {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> {t('creating')}</> : t('create')}
          </button>
        </div>
      </form>
    </div>
  )
}
