'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Space, Testimonial } from '@/lib/supabase'
import { formatDate, truncate, PLANS } from '@/lib/utils'
import type { Profile } from '@/lib/supabase'
import { ArrowLeft, Copy, ExternalLink, Star, CheckCircle, XCircle, Archive, Sparkles, Send, Loader2, Code2, Mail, TrendingUp, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import EmbedWizard from '@/components/EmbedWizard'
import { calculateProofScore } from '@/lib/proofScore'
import ProofScoreRing from '@/components/ProofScoreRing'

export default function SpaceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [space, setSpace] = useState<Space | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'pending' | 'approved' | 'archived'>('all')
  const [polishing, setPolishing] = useState<string | null>(null)
  const [copied, setCopied] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [sendingInvite, setSendingInvite] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [showEmbed, setShowEmbed] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [brandColor, setBrandColor] = useState('#d4751f')
  const [colorInput, setColorInput] = useState('#d4751f')
  const [savingColor, setSavingColor] = useState(false)
  const [colorSaved, setColorSaved] = useState(false)
  const [ratingRequired, setRatingRequired] = useState(false)
  const [autoApprove, setAutoApprove] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      const [{ data: sp }, { data: te }, { data: prof }] = await Promise.all([
        supabase.from('spaces').select('*').eq('id', id).single(),
        supabase.from('testimonials').select('*').eq('space_id', id).order('created_at', { ascending: false }),
        session ? supabase.from('profiles').select('*').eq('id', session.user.id).single() : Promise.resolve({ data: null }),
      ])
      setSpace(sp)
      setTestimonials(te || [])
      setProfile(prof)
      if (sp?.theme_color) { setBrandColor(sp.theme_color); setColorInput(sp.theme_color) }
      if (sp) { setRatingRequired(sp.rating_required ?? false); setAutoApprove(sp.auto_approve ?? false) }
      setLoading(false)
    }
    load()
  }, [id])

  async function updateStatus(tid: string, status: Testimonial['status']) {
    await supabase.from('testimonials').update({ status }).eq('id', tid)
    setTestimonials(prev => prev.map(t => t.id === tid ? { ...t, status } : t))
  }

  async function polishWithAI(t: Testimonial) {
    if (!t.content) return
    setPolishing(t.id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/testimonials/polish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ content: t.content, name: t.submitter_name, role: t.submitter_role }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to polish testimonial'); setPolishing(null); return }
      await supabase.from('testimonials').update({ ai_enhanced_content: data.polished }).eq('id', t.id)
      setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, ai_enhanced_content: data.polished } : x))
    } catch (e) { console.error(e) }
    setPolishing(null)
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    setSendingInvite(true)
    await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spaceId: id, email: inviteEmail, name: inviteName }),
    })
    setInviteSent(true)
    setSendingInvite(false)
    setInviteEmail('')
    setInviteName('')
    setTimeout(() => setInviteSent(false), 3000)
  }

  async function deleteTestimonial(tid: string, name: string) {
    const previous = testimonials
    setTestimonials(prev => prev.filter(t => t.id !== tid))
    toast(`Testimonial from ${name} deleted`, {
      action: {
        label: 'Undo',
        onClick: () => setTestimonials(previous),
      },
      duration: 5000,
      onDismiss: async () => { await fetch(`/api/testimonials?id=${tid}`, { method: 'DELETE' }) },
      onAutoClose: async () => { await fetch(`/api/testimonials?id=${tid}`, { method: 'DELETE' }) },
    })
  }

  async function saveSettings() {
    setSavingSettings(true)
    await supabase.from('spaces').update({ rating_required: ratingRequired, auto_approve: autoApprove }).eq('id', id)
    setSpace(prev => prev ? { ...prev, rating_required: ratingRequired, auto_approve: autoApprove } : prev)
    setSavingSettings(false)
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 2000)
  }

  async function saveBrandColor() {
    setSavingColor(true)
    await supabase.from('spaces').update({ theme_color: brandColor }).eq('id', id)
    setSpace(prev => prev ? { ...prev, theme_color: brandColor } : prev)
    setSavingColor(false)
    setColorSaved(true)
    setTimeout(() => setColorSaved(false), 2000)
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const filtered = testimonials.filter(t => tab === 'all' ? true : t.status === tab)
  const collectUrl = space ? `${typeof window !== 'undefined' ? window.location.origin : ''}/collect/${space.slug}` : ''
  const wallUrl = space ? `${typeof window !== 'undefined' ? window.location.origin : ''}/wall/${space.slug}` : ''
  const embedCode = space ? `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed.js" data-space="${space.slug}" async></script>` : ''

  if (loading) return <div className="dash-page"><div className="skeleton" style={{ height: 200 }} /></div>
  if (!space) return <div className="dash-page">Space not found.</div>

  return (
    <div className="dash-page" style={{ maxWidth: 1000 }}>
      {/* Header */}
      <Link href="/dashboard/spaces" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        <ArrowLeft size={15} /> All spaces
      </Link>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{space.name}</h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>{testimonials.length} testimonials · {testimonials.filter(t => t.status === 'pending').length} pending</p>
        </div>
        <div className="space-header-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setShowInvite(!showInvite)} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}><Mail size={14} /> Invite</button>
          <button onClick={() => setShowEmbed(!showEmbed)} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}><Code2 size={14} /> Embed</button>
          <Link href={collectUrl} target="_blank" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}><ExternalLink size={14} /> Collect</Link>
          <Link href={wallUrl} target="_blank" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}><ExternalLink size={14} /> Wall</Link>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Collection link', value: collectUrl, key: 'collect' },
          { label: 'Wall page', value: wallUrl, key: 'wall' },
        ].map(({ label, value, key }) => (
          <div key={key} style={{ background: 'var(--paper)', border: '1px solid #eceae6', borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', fontWeight: 600, marginBottom: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
            </div>
            <button onClick={() => copyText(value, key)} className="btn btn-ghost" style={{ padding: '0.35rem 0.5rem', flexShrink: 0 }}>
              <Copy size={14} /> {copied === key ? '✓' : ''}
            </button>
          </div>
        ))}
      </div>

      {/* Brand color */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'white' }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)', marginBottom: '0.2rem' }}>Brand color</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '1.25rem' }}>Used in your embed widget, collect page, and wall page.</div>

        {/* Preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', padding: '0.85rem 1rem', background: 'var(--paper)', borderRadius: 10, border: '1px solid #eceae6' }}>
          <div style={{ width: 48, height: 48, borderRadius: 10, background: brandColor, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginBottom: '0.15rem' }}>Selected color</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>{brandColor.toUpperCase()}</div>
          </div>
        </div>

        {/* Preset swatches */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Presets</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {[
              '#d4751f','#e85d2f','#c0392b','#e74c8b','#9b59b6','#7c5cbf',
              '#3498db','#1a5fa8','#0891b2','#1a7a7a','#2e7d4f','#27ae60',
              '#f39c12','#e67e22','#1a1713','#64748b',
            ].map(c => (
              <button key={c} type="button" onClick={() => { setBrandColor(c); setColorInput(c) }}
                title={c}
                style={{ width: 30, height: 30, borderRadius: 6, background: c, border: brandColor === c ? '3px solid var(--ink)' : '2px solid transparent', cursor: 'pointer', flexShrink: 0, transition: 'transform 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              />
            ))}
          </div>
        </div>

        {/* Custom input row */}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {/* Native color picker */}
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Color picker</div>
            <input type="color" value={brandColor} onChange={e => { setBrandColor(e.target.value); setColorInput(e.target.value) }}
              style={{ width: 48, height: 36, borderRadius: 8, border: '1px solid #d5d1c9', cursor: 'pointer', padding: 2 }} />
          </div>

          {/* Hex code input */}
          <div style={{ flex: '1 1 140px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paste hex code</div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                className="input"
                value={colorInput}
                onChange={e => setColorInput(e.target.value)}
                onBlur={() => {
                  const val = colorInput.startsWith('#') ? colorInput : '#' + colorInput
                  if (/^#[0-9a-fA-F]{6}$/.test(val)) { setBrandColor(val); setColorInput(val) }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const val = colorInput.startsWith('#') ? colorInput : '#' + colorInput
                    if (/^#[0-9a-fA-F]{6}$/.test(val)) { setBrandColor(val); setColorInput(val) }
                  }
                }}
                placeholder="#000000"
                maxLength={7}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', width: '100%' }}
              />
            </div>
          </div>

          {/* Random generator */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Generate</div>
            <button type="button" className="btn btn-secondary" style={{ fontSize: '0.82rem' }}
              onClick={() => {
                const palettes = [
                  ['#e63946','#457b9d','#2a9d8f','#e9c46a','#f4a261'],
                  ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981'],
                  ['#0ea5e9','#14b8a6','#84cc16','#f97316','#ef4444'],
                  ['#1d4ed8','#7c3aed','#be185d','#b45309','#047857'],
                  ['#334155','#0f766e','#b45309','#9333ea','#dc2626'],
                ]
                const flat = palettes.flat().filter(c => c !== brandColor)
                const pick = flat[Math.floor(Math.random() * flat.length)]
                setBrandColor(pick); setColorInput(pick)
              }}
            >🎨 Suggest</button>
          </div>
        </div>

        <button onClick={saveBrandColor} className="btn btn-primary" disabled={savingColor} style={{ fontSize: '0.875rem' }}>
          {colorSaved ? '✓ Color saved!' : savingColor ? 'Saving…' : 'Save brand color'}
        </button>
      </div>

      {/* Collection settings */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'white' }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)', marginBottom: '0.2rem' }}>Collection settings</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '1.25rem' }}>Control how submissions are handled for this space.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={ratingRequired} onChange={e => setRatingRequired(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--brand)', cursor: 'pointer', marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ink)' }}>⭐ Rating required</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: '0.15rem' }}>Submitters must choose a star rating before they can submit.</div>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={autoApprove} onChange={e => setAutoApprove(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--brand)', cursor: 'pointer', marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ink)' }}>✅ Auto-approve submissions</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: '0.15rem' }}>New testimonials go straight to approved without manual review.</div>
            </div>
          </label>
        </div>
        <button onClick={saveSettings} className="btn btn-primary" disabled={savingSettings} style={{ fontSize: '0.875rem' }}>
          {settingsSaved ? '✓ Saved!' : savingSettings ? 'Saving…' : 'Save settings'}
        </button>
      </div>

      {/* Proof Score™ */}
      {(() => {
        const ps = calculateProofScore(testimonials)
        return (
          <div className="card" style={{ marginBottom: '1.5rem', background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
              <TrendingUp size={16} color="var(--brand)" />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>Proof Score™</span>
              <span style={{ fontSize: '0.72rem', background: 'var(--brand-light)', color: 'var(--brand)', padding: '0.15rem 0.5rem', borderRadius: 100, fontWeight: 700, letterSpacing: '0.03em' }}>BETA</span>
              <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '0.9rem', color: ps.color }}>{ps.gradeEmoji} {ps.grade}</span>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {/* Ring */}
              <div style={{ flexShrink: 0, textAlign: 'center' }}>
                <ProofScoreRing score={ps.total} color={ps.color} size={96} />
                <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', marginTop: '0.35rem' }}>out of 100</div>
              </div>

              {/* Dimension bars */}
              <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {ps.dimensions.map(dim => (
                  <div key={dim.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', width: 68, color: 'var(--ink-muted)', flexShrink: 0 }}>{dim.icon} {dim.label}</span>
                    <div style={{ flex: 1, height: 6, background: '#f0ece6', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        borderRadius: 3,
                        background: ps.color,
                        width: `${(dim.score / dim.max) * 100}%`,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', width: 36, textAlign: 'right', flexShrink: 0 }}>{dim.score}/{dim.max}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            {ps.tips.length > 0 && (
              <div style={{ marginTop: '1.25rem', borderTop: '1px solid #f0ece6', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  💡 Tips to improve
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {ps.tips.map((tip, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--ink)', background: 'var(--paper)', padding: '0.5rem 0.75rem', borderRadius: 8 }}>
                      <span style={{ flexShrink: 0 }}>{tip.icon}</span>
                      <span>{tip.text}</span>
                      <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '0.72rem', fontWeight: 700, color: ps.color, background: ps.color + '18', padding: '0.15rem 0.5rem', borderRadius: 100 }}>+{tip.impact} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* Invite panel */}
      {showInvite && (
        <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--paper)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Send email invitation</h3>
          <form onSubmit={sendInvite} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 180px' }}>
              <label className="label" style={{ fontSize: '0.78rem' }}>Name</label>
              <input className="input" value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Customer name" style={{ fontSize: '0.875rem' }} />
            </div>
            <div style={{ flex: '2 1 220px' }}>
              <label className="label" style={{ fontSize: '0.78rem' }}>Email *</label>
              <input className="input" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="customer@example.com" required style={{ fontSize: '0.875rem' }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={sendingInvite} style={{ fontSize: '0.875rem', padding: '0.6rem 1.1rem' }}>
              {sendingInvite ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : inviteSent ? '✓ Sent!' : <><Send size={14} /> Send</>}
            </button>
          </form>
          <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '0.6rem' }}>* In production, this sends a personalised email with a collection link. For now it creates an invitation record you can share manually.</p>
        </div>
      )}

      {/* Embed wizard modal */}
      <EmbedWizard
        open={showEmbed}
        onClose={() => setShowEmbed(false)}
        embedCode={embedCode}
        spaceSlug={space.slug}
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', borderBottom: '1px solid #eceae6', paddingBottom: '-1px' }}>
        {(['all', 'pending', 'approved', 'archived'] as const).map(t => {
          const count = t === 'all' ? testimonials.length : testimonials.filter(x => x.status === t).length
          return (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--brand)' : '2px solid transparent', cursor: 'pointer', fontSize: '0.875rem', fontWeight: tab === t ? 600 : 400, color: tab === t ? 'var(--brand)' : 'var(--ink-muted)', textTransform: 'capitalize', marginBottom: -1 }}>
              {t} {count > 0 && <span className="badge badge-gray" style={{ fontSize: '0.65rem', marginLeft: 4 }}>{count}</span>}
            </button>
          )
        })}
      </div>

      {/* Testimonials */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
          <p>No {tab === 'all' ? '' : tab} testimonials yet.</p>
          {tab === 'all' && <p style={{ fontSize: '0.85rem' }}>Share your collection link to start receiving testimonials.</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(t => (
            <div key={t.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand)', flexShrink: 0 }}>
                    {t.submitter_name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--ink)' }}>{t.submitter_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                      {[t.submitter_role, t.submitter_company].filter(Boolean).join(' · ')}
                      {t.submitter_email && ` · ${t.submitter_email}`}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {t.rating && (
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < t.rating! ? '#e8963a' : 'none'} color={i < t.rating! ? '#e8963a' : '#d5d1c9'} />)}
                    </div>
                  )}
                  <span className={`badge ${t.status === 'approved' ? 'badge-green' : t.status === 'archived' ? 'badge-red' : 'badge-amber'}`} style={{ fontSize: '0.68rem' }}>{t.status}</span>
                  <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>{t.type}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-subtle)' }}>{formatDate(t.created_at)}</span>
                </div>
              </div>

              {/* Content */}
              {(t.video_url || t.content || t.image_url || t.answers) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {t.video_url && (
                    <video src={t.video_url} controls style={{ width: '100%', maxHeight: 280, borderRadius: 8, background: '#1a1713', display: 'block' }} />
                  )}
                  {t.image_url && (
                    <img src={t.image_url} alt="Attached" style={{ maxWidth: '100%', maxHeight: 260, borderRadius: 8, objectFit: 'cover', display: 'block' }} />
                  )}
                  {t.content && (
                    <>
                      <p style={{ fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.65, margin: 0 }}>{t.content}</p>
                      {t.ai_enhanced_content && (
                        <div style={{ background: 'var(--brand-light)', borderRadius: 8, padding: '0.75rem 1rem', borderLeft: '3px solid var(--brand)' }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: 4 }}><Sparkles size={11} /> AI-polished version</div>
                          <p style={{ fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.65, margin: 0 }}>{t.ai_enhanced_content}</p>
                        </div>
                      )}
                    </>
                  )}
                  {t.answers && Object.keys(t.answers).length > 0 && (
                    <div style={{ background: 'var(--paper)', borderRadius: 8, padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Custom answers</div>
                      {Object.entries(t.answers).map(([q, a]) => (
                        <div key={q}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: '0.15rem' }}>{q}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--ink)', lineHeight: 1.55 }}>{a}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.25rem', borderTop: '1px solid #f5ede0' }}>
                {t.status !== 'approved' && (
                  <button onClick={() => updateStatus(t.id, 'approved')} className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', color: '#2e7d4f' }}>
                    <CheckCircle size={12} /> Approve
                  </button>
                )}
                {t.status !== 'archived' && (
                  <button onClick={() => updateStatus(t.id, 'archived')} className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', color: '#c0392b' }}>
                    <Archive size={12} /> Archive
                  </button>
                )}
                {t.status !== 'pending' && (
                  <button onClick={() => updateStatus(t.id, 'pending')} className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                    Reset to pending
                  </button>
                )}
                <button onClick={() => deleteTestimonial(t.id, t.submitter_name)} className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', color: '#c0392b', marginLeft: 'auto' }}>
                  <Trash2 size={12} /> Delete
                </button>
                {t.content && !t.ai_enhanced_content && (() => {
                  const canAI = PLANS[(profile?.plan || 'free') as keyof typeof PLANS].ai
                  return canAI ? (
                    <button onClick={() => polishWithAI(t)} disabled={polishing === t.id} className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', color: 'var(--brand)' }}>
                      {polishing === t.id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={12} />}
                      {polishing === t.id ? 'Polishing…' : 'Polish with AI'}
                    </button>
                  ) : (
                    <Link href="/dashboard/settings?tab=billing" className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', color: 'var(--ink-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Sparkles size={12} /> Polish with AI <span style={{ fontSize: '0.68rem', background: 'var(--brand-light)', color: 'var(--brand)', padding: '0.1rem 0.4rem', borderRadius: 4, fontWeight: 700 }}>Starter+</span>
                    </Link>
                  )
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
