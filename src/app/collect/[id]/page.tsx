'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Space } from '@/lib/supabase'
import { PLANS } from '@/lib/utils'
import { Star, Send, Video, FileText, Loader2, CheckCircle2, Quote, ImagePlus, X } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'

type CoachTip = { type: 'warning' | 'success' | 'info'; message: string }

const TIP_STYLES: Record<CoachTip['type'], { bg: string; border: string; color: string; icon: string }> = {
  warning: { bg: '#fef9e7', border: '#f9e79f', color: '#7d6608', icon: '⚠️' },
  success: { bg: '#eafaf1', border: '#a9dfbf', color: '#1e8449', icon: '✓' },
  info:    { bg: '#eaf4fb', border: '#a9cce3', color: '#1a5276', icon: '💡' },
}

export default function CollectPage() {
  const { id: slug } = useParams<{ id: string }>()
  const t = useTranslations('collect')
  const [space, setSpace] = useState<Space | null>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'text' | 'video'>('text')
  const [step, setStep] = useState<'choose' | 'form' | 'done'>('choose')
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [form, setForm] = useState({ name: '', email: '', role: '', company: '', content: '' })
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [honeypot, setHoneypot] = useState('')
  const [recording, setRecording] = useState(false)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [removeBranding, setRemoveBranding] = useState(false)
  const [coachingEnabled, setCoachingEnabled] = useState(false)
  const [coachTips, setCoachTips] = useState<CoachTip[]>([])
  const [coachLoading, setCoachLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  useEffect(() => {
    async function load() {
      const { data: sp } = await supabase.from('spaces').select('*').eq('slug', slug).single()
      if (!sp) { setLoading(false); return }
      setSpace(sp)
      const { data: prof } = await supabase.from('profiles').select('plan').eq('id', sp.user_id).single()
      const plan = (prof?.plan || 'free') as keyof typeof PLANS
      setRemoveBranding(PLANS[plan].removeBranding)
      setCoachingEnabled(PLANS[plan].coach)
      setLoading(false)
    }
    load()
  }, [slug])

  // Debounced AI coaching — fires 800ms after the user stops typing
  useEffect(() => {
    if (!coachingEnabled || !space || mode !== 'text') return
    const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length
    if (wordCount < 4) { setCoachTips([]); return }

    const timer = setTimeout(async () => {
      setCoachLoading(true)
      try {
        const res = await fetch('/api/testimonials/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: form.content, spaceId: space.id, name: form.name, role: form.role }),
        })
        if (res.ok) {
          const { tips } = await res.json()
          setCoachTips(tips || [])
        }
      } catch { /* fail silently */ }
      setCoachLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [form.content, form.name, form.role, space, coachingEnabled, mode])

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() }
    chunksRef.current = []
    const mr = new MediaRecorder(stream)
    mr.ondataavailable = e => chunksRef.current.push(e.data)
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      setVideoBlob(blob)
      stream.getTracks().forEach(t => t.stop())
      if (videoRef.current) { videoRef.current.srcObject = null; videoRef.current.src = URL.createObjectURL(blob) }
    }
    mediaRecorderRef.current = mr
    mr.start()
    setRecording(true)
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!space) return
    if (space.rating_required && !rating) {
      toast.error('Please select a star rating before submitting.')
      return
    }
    setSubmitting(true)

    let videoUrl = null
    if (mode === 'video' && videoBlob) {
      const fd = new FormData()
      fd.append('video', new File([videoBlob], `${Date.now()}.webm`, { type: 'video/webm' }))
      fd.append('spaceId', space.id)
      const uploadRes = await fetch('/api/videos/upload', { method: 'POST', body: fd })
      if (uploadRes.ok) {
        const { url } = await uploadRes.json()
        videoUrl = url
      } else {
        const { error } = await uploadRes.json()
        toast.error(error || 'Video upload failed. Please try again.')
        setSubmitting(false)
        return
      }
    }

    let imageUrl = null
    if (imageFile) {
      const fd = new FormData()
      fd.append('image', imageFile)
      fd.append('spaceId', space.id)
      const uploadRes = await fetch('/api/images/upload', { method: 'POST', body: fd })
      if (uploadRes.ok) {
        const { url } = await uploadRes.json()
        imageUrl = url
      } else {
        const { error } = await uploadRes.json()
        toast.error(error || 'Image upload failed. Please try again.')
        setSubmitting(false)
        return
      }
    }

    const res = await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        space_id: space.id,
        type: mode,
        submitter_name: form.name,
        submitter_email: form.email,
        submitter_role: form.role,
        submitter_company: form.company,
        content: mode === 'text' ? form.content : null,
        video_url: videoUrl,
        image_url: imageUrl,
        rating: rating || null,
        answers: Object.keys(answers).length > 0 ? answers : null,
        _hp: honeypot,
      }),
    })
    setSubmitting(false)
    if (res.ok) {
      setStep('done')
    } else {
      const { error } = await res.json()
      toast.error(error || 'Failed to submit testimonial. Please try again.')
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
        <Loader2 size={32} color="var(--brand)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (!space) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)', textAlign: 'center' }}>
        <div><div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div><h2>{t('not_found_title')}</h2><p style={{ color: 'var(--ink-muted)' }}>{t('not_found_desc')}</p></div>
      </div>
    )
  }

  const brandColor = space.theme_color || '#d4751f'
  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length
  const wordCountColor = wordCount >= 60 && wordCount <= 80 ? '#1e8449' : wordCount >= 40 ? '#7d6608' : 'var(--ink-subtle)'

  const wordSuffix = wordCount >= 60 && wordCount <= 80
    ? ' ' + t('perfect_length')
    : wordCount > 0 && wordCount < 60
      ? ' ' + t('aim_for_more', { n: 60 - wordCount })
      : wordCount > 80
        ? ' ' + t('consider_trimming')
        : ''

  if (step === 'done') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 460 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: brandColor + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle2 size={36} color={brandColor} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{t('done_title')}</h2>
          <p style={{ color: 'var(--ink-muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>{t('done_desc')}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', padding: 'clamp(1.5rem, 5vw, 3rem) 1.25rem' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: brandColor, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Quote size={26} color="white" />
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem', color: 'var(--ink)' }}>{space.header_title}</h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '1rem', lineHeight: 1.6, maxWidth: 440, margin: '0 auto' }}>{space.header_message}</p>
        </div>

        {/* Choose mode (if both enabled) */}
        {step === 'choose' && space.collect_text && space.collect_video && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { m: 'text' as const, icon: FileText, label: t('mode_text_label'), desc: t('mode_text_desc') },
              { m: 'video' as const, icon: Video, label: t('mode_video_label'), desc: t('mode_video_desc') },
            ].map(({ m, icon: Icon, label, desc }) => (
              <button key={m} onClick={() => { setMode(m); setStep('form') }}
                style={{ background: 'white', border: `2px solid ${mode === m ? brandColor : '#eceae6'}`, borderRadius: 14, padding: '1.5rem 1.25rem', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: brandColor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                  <Icon size={20} color={brandColor} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.3rem', color: 'var(--ink)' }}>{label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', lineHeight: 1.4 }}>{desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Form */}
        {(step === 'form' || (!space.collect_video && step === 'choose') || (!space.collect_text && step === 'choose')) && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Info */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--ink-muted)', fontWeight: 600, margin: 0 }}>{t('your_info')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="label">{t('full_name')} *</label>
                  <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" required />
                </div>
                <div>
                  <label className="label">{t('role')} <span style={{ color: 'var(--ink-subtle)', fontWeight: 400 }}>{t('optional')}</span></label>
                  <input className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="CEO, Developer…" />
                </div>
                <div>
                  <label className="label">{t('company')} <span style={{ color: 'var(--ink-subtle)', fontWeight: 400 }}>{t('optional')}</span></label>
                  <input className="input" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Acme Inc." />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="label">{t('email')} <span style={{ color: 'var(--ink-subtle)', fontWeight: 400 }}>{t('optional')}</span></label>
                  <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@example.com" />
                </div>
              </div>
            </div>

            {/* Honeypot — hidden from humans, traps bots */}
            <input
              type="text"
              value={honeypot}
              onChange={e => setHoneypot(e.target.value)}
              tabIndex={-1}
              aria-hidden="true"
              autoComplete="off"
              style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
            />

            {/* Rating */}
            <div className="card">
              <label className="label" style={{ marginBottom: '0.75rem' }}>
                {t('rating_label')}
                {space.rating_required && <span style={{ color: '#c0392b', marginLeft: 4 }}>*</span>}
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button"
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(n)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                    <Star size={28} fill={(hoverRating || rating) >= n ? '#e8963a' : 'none'} color={(hoverRating || rating) >= n ? '#e8963a' : '#d5d1c9'} />
                  </button>
                ))}
              </div>
              {space.rating_required && !rating && (
                <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '0.4rem' }}>A rating is required for this space.</p>
              )}
            </div>

            {/* Custom questions */}
            {space.questions && space.questions.length > 0 && (
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--ink-muted)', fontWeight: 600, margin: 0 }}>A few questions</h3>
                {space.questions.map((q, i) => (
                  <div key={i}>
                    <label className="label" style={{ marginBottom: '0.4rem' }}>{q}</label>
                    <textarea
                      className="input"
                      rows={2}
                      style={{ resize: 'vertical' }}
                      value={answers[q] || ''}
                      onChange={e => setAnswers(prev => ({ ...prev, [q]: e.target.value }))}
                      placeholder="Your answer…"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Text testimonial + AI coach */}
            {(!space.collect_video || mode === 'text') && (
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <label className="label">{t('testimonial_label')} *</label>
                <textarea
                  className="input"
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder={t('testimonial_placeholder')}
                  rows={5}
                  style={{ resize: 'vertical' }}
                  required
                />

                {/* Word count */}
                {wordCount > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <div style={{ flex: 1, height: 3, background: '#eceae6', borderRadius: 2, marginRight: '0.75rem', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 2,
                        background: wordCount >= 60 && wordCount <= 80 ? '#2e7d4f' : wordCount >= 40 ? '#e8963a' : '#d5d1c9',
                        width: `${Math.min((wordCount / 80) * 100, 100)}%`,
                        transition: 'width 0.3s ease, background 0.3s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: wordCountColor, whiteSpace: 'nowrap', fontWeight: wordCount >= 60 && wordCount <= 80 ? 600 : 400 }}>
                      {t('word_count', { count: wordCount })}{wordSuffix}
                    </span>
                  </div>
                )}

                {/* AI coaching tips */}
                {coachingEnabled && (coachLoading || coachTips.length > 0) && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {coachLoading && coachTips.length === 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--ink-subtle)' }}>
                        <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> {t('analysing')}
                      </div>
                    )}
                    {coachTips.map((tip, i) => {
                      const s = TIP_STYLES[tip.type]
                      return (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                          padding: '0.55rem 0.75rem', borderRadius: '8px',
                          fontSize: '0.82rem', lineHeight: 1.45,
                          background: s.bg, border: `1px solid ${s.border}`, color: s.color,
                        }}>
                          <span style={{ flexShrink: 0, fontSize: '0.8rem' }}>{s.icon}</span>
                          <span>{tip.message}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Image upload */}
            <div className="card">
              <label className="label" style={{ marginBottom: '0.6rem' }}>
                Attach an image <span style={{ color: 'var(--ink-subtle)', fontWeight: 400 }}>(optional)</span>
              </label>
              {imagePreview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, display: 'block' }} />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null) }}
                    style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={13} color="white" />
                  </button>
                </div>
              ) : (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', padding: '0.75rem 1rem', border: '1.5px dashed #d5d1c9', borderRadius: 10, color: 'var(--ink-muted)', fontSize: '0.875rem', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = brandColor)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#d5d1c9')}>
                  <ImagePlus size={18} color={brandColor} />
                  Click to upload a screenshot or photo
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setImageFile(file)
                      setImagePreview(URL.createObjectURL(file))
                    }} />
                </label>
              )}
              <p style={{ fontSize: '0.72rem', color: 'var(--ink-subtle)', marginTop: '0.4rem' }}>JPEG, PNG, WebP or GIF · max 10 MB</p>
            </div>

            {/* Video */}
            {mode === 'video' && space.collect_video && (
              <div className="card">
                <label className="label" style={{ marginBottom: '0.75rem' }}>{t('video_label')}</label>
                <video ref={videoRef} style={{ width: '100%', borderRadius: 8, background: '#1a1713', maxHeight: 300 }} controls={!recording} muted={recording} />
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  {!recording && !videoBlob && (
                    <button type="button" onClick={startRecording} className="btn btn-primary" style={{ background: brandColor, borderColor: brandColor }}>
                      <Video size={15} /> {t('start_recording')}
                    </button>
                  )}
                  {recording && (
                    <button type="button" onClick={stopRecording} className="btn btn-secondary" style={{ color: '#c0392b', borderColor: '#c0392b' }}>
                      ⏹ {t('stop_recording')}
                    </button>
                  )}
                  {videoBlob && (
                    <button type="button" onClick={() => { setVideoBlob(null); if (videoRef.current) videoRef.current.src = '' }} className="btn btn-ghost" style={{ color: '#c0392b' }}>
                      {t('re_record')}
                    </button>
                  )}
                </div>
                {recording && <p style={{ fontSize: '0.8rem', color: '#c0392b', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: 4 }}>{t('recording_indicator')}</p>}
              </div>
            )}

            <button type="submit" disabled={submitting || (mode === 'video' && !videoBlob && space.collect_video)}
              className="btn btn-primary" style={{ justifyContent: 'center', padding: '0.85rem', fontSize: '1rem', background: brandColor, borderColor: brandColor }}>
              {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t('submitting')}</> : <><Send size={16} /> {t('submit')}</>}
            </button>
          </form>
        )}

        {/* Branding + language switcher */}
        <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          {!removeBranding && (
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-subtle)' }}>
              {t('powered_by')} <strong style={{ color: 'var(--ink-muted)' }}>vouchly</strong>
            </span>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  )
}
