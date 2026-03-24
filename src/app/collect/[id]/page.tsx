'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Space } from '@/lib/supabase'
import { PLANS } from '@/lib/utils'
import { Star, Send, Video, FileText, Loader2, CheckCircle2, Quote } from 'lucide-react'

export default function CollectPage() {
  const { id: slug } = useParams<{ id: string }>()
  const [space, setSpace] = useState<Space | null>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'text' | 'video'>('text')
  const [step, setStep] = useState<'choose' | 'form' | 'done'>('choose')
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [form, setForm] = useState({ name: '', email: '', role: '', company: '', content: '' })
  const [recording, setRecording] = useState(false)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [removeBranding, setRemoveBranding] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  useEffect(() => {
    async function load() {
      const { data: sp } = await supabase.from('spaces').select('*').eq('slug', slug).single()
      if (!sp) { setLoading(false); return }
      setSpace(sp)
      const { data: prof } = await supabase.from('profiles').select('plan').eq('id', sp.user_id).single()
      setRemoveBranding(PLANS[(prof?.plan || 'free') as keyof typeof PLANS].removeBranding)
      setLoading(false)
    }
    load()
  }, [slug])

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
    setSubmitting(true)
    let videoUrl = null
    if (mode === 'video' && videoBlob) {
      const file = new File([videoBlob], `${Date.now()}.webm`, { type: 'video/webm' })
      const { data } = await supabase.storage.from('videos').upload(`${space.id}/${file.name}`, file)
      if (data) {
        const { data: urlData } = supabase.storage.from('videos').getPublicUrl(data.path)
        videoUrl = urlData.publicUrl
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
        rating: rating || null,
      }),
    })
    setSubmitting(false)
    if (res.ok) {
      setStep('done')
    } else {
      const { error } = await res.json()
      alert(error || 'Failed to submit testimonial. Please try again.')
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
        <div><div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div><h2>Space not found</h2><p style={{ color: 'var(--ink-muted)' }}>This collection page doesn't exist or has been disabled.</p></div>
      </div>
    )
  }

  const brandColor = space.theme_color || '#d4751f'

  if (step === 'done') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 460 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: brandColor + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle2 size={36} color={brandColor} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Thank you! 🎉</h2>
          <p style={{ color: 'var(--ink-muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>Your testimonial has been submitted successfully. We'll review it shortly — your words genuinely help others.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', padding: '3rem 1.5rem' }}>
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
              { m: 'text' as const, icon: FileText, label: 'Write a testimonial', desc: 'Share your experience in your own words' },
              { m: 'video' as const, icon: Video, label: 'Record a video', desc: 'A short video testimonial (more impactful!)' },
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
              <h3 style={{ fontSize: '0.95rem', color: 'var(--ink-muted)', fontWeight: 600, margin: 0 }}>Your info</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="label">Full name *</label>
                  <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" required />
                </div>
                <div>
                  <label className="label">Role <span style={{ color: 'var(--ink-subtle)', fontWeight: 400 }}>(optional)</span></label>
                  <input className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="CEO, Developer…" />
                </div>
                <div>
                  <label className="label">Company <span style={{ color: 'var(--ink-subtle)', fontWeight: 400 }}>(optional)</span></label>
                  <input className="input" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Acme Inc." />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="label">Email <span style={{ color: 'var(--ink-subtle)', fontWeight: 400 }}>(optional)</span></label>
                  <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@example.com" />
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="card">
              <label className="label" style={{ marginBottom: '0.75rem' }}>Overall rating</label>
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
            </div>

            {/* Text or Video */}
            {(!space.collect_video || mode === 'text') && (
              <div className="card">
                <label className="label">Your testimonial *</label>
                <textarea className="input" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Share your honest experience. What problem did we solve? What results have you seen? Be as specific as you like."
                  rows={5} style={{ resize: 'vertical' }} required />
                <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: '0.4rem' }}>Tip: Specific results and concrete details make the most compelling testimonials.</p>
              </div>
            )}

            {mode === 'video' && space.collect_video && (
              <div className="card">
                <label className="label" style={{ marginBottom: '0.75rem' }}>Video testimonial</label>
                <video ref={videoRef} style={{ width: '100%', borderRadius: 8, background: '#1a1713', maxHeight: 300 }} controls={!recording} muted={recording} />
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  {!recording && !videoBlob && (
                    <button type="button" onClick={startRecording} className="btn btn-primary" style={{ background: brandColor, borderColor: brandColor }}>
                      <Video size={15} /> Start recording
                    </button>
                  )}
                  {recording && (
                    <button type="button" onClick={stopRecording} className="btn btn-secondary" style={{ color: '#c0392b', borderColor: '#c0392b' }}>
                      ⏹ Stop recording
                    </button>
                  )}
                  {videoBlob && (
                    <button type="button" onClick={() => { setVideoBlob(null); if (videoRef.current) videoRef.current.src = '' }} className="btn btn-ghost" style={{ color: '#c0392b' }}>
                      Re-record
                    </button>
                  )}
                </div>
                {recording && <p style={{ fontSize: '0.8rem', color: '#c0392b', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: 4 }}>🔴 Recording…</p>}
              </div>
            )}

            <button type="submit" disabled={submitting || (mode === 'video' && !videoBlob && space.collect_video)}
              className="btn btn-primary" style={{ justifyContent: 'center', padding: '0.85rem', fontSize: '1rem', background: brandColor, borderColor: brandColor }}>
              {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</> : <><Send size={16} /> Submit testimonial</>}
            </button>
          </form>
        )}

        {/* Branding */}
        {!removeBranding && (
          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: 'var(--ink-subtle)' }}>
            Powered by <strong style={{ color: 'var(--ink-muted)' }}>vouchly</strong>
          </div>
        )}
      </div>
    </div>
  )
}
