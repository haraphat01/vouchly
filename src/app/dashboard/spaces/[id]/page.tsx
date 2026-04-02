'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatDate, truncate, PLANS } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Star,
  CheckCircle,
  XCircle,
  Archive,
  Sparkles,
  Send,
  Loader2,
  Code2,
  Mail,
  Gauge,
  Lightbulb,
  Trash2,
  Pencil,
  QrCode,
  Share2,
  Link2,
  Instagram,
  Music2,
  MessageCircle,
  Linkedin,
  Facebook,
  Twitter,
  Printer,
  Mic,
  Youtube,
} from 'lucide-react'
import { toast } from 'sonner'
import QRCode from 'react-qr-code'
import EmbedWizard from '@/components/EmbedWizard'
import { calculateProofScore } from '@/lib/proofScore'
import ProofScoreRing from '@/components/ProofScoreRing'
import { ProofDimensionIcon, ProofGradeIcon, ProofTipIcon } from '@/components/ProofScoreIcons'
import { useSpace, useUpdateSpace } from '@/hooks/useSpaces'
import { useTestimonials, useUpdateTestimonialStatus, useDeleteTestimonial, usePolishTestimonial, useEditTestimonial } from '@/hooks/useTestimonials'
import { useProfile } from '@/hooks/useProfile'

export default function SpaceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [tab, setTab] = useState<'all' | 'pending' | 'approved' | 'archived'>('all')
  const [copied, setCopied] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [sendingInvite, setSendingInvite] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [showEmbed, setShowEmbed] = useState(false)
  const [pageTab, setPageTab] = useState<'testimonials' | 'settings' | 'growth' | 'analytics'>('testimonials')
  const [customSource, setCustomSource] = useState('')
  const [brandColor, setBrandColor] = useState('#d4751f')
  const [colorInput, setColorInput] = useState('#d4751f')
  const [savingColor, setSavingColor] = useState(false)
  const [colorSaved, setColorSaved] = useState(false)
  const [ratingRequired, setRatingRequired] = useState(false)
  const [autoApprove, setAutoApprove] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editAiContent, setEditAiContent] = useState('')

  const { data: space, isLoading: spaceLoading } = useSpace(id)
  const { data: testimonials = [], isLoading: testimonialsLoading } = useTestimonials(id)
  const { data: profile } = useProfile()

  const updateSpace = useUpdateSpace()
  const updateStatus = useUpdateTestimonialStatus()
  const deleteTestimonialMutation = useDeleteTestimonial()
  const polishMutation = usePolishTestimonial()
  const editMutation = useEditTestimonial()

  // Sync local color/settings state when space loads
  useEffect(() => {
    if (space?.theme_color) { setBrandColor(space.theme_color); setColorInput(space.theme_color) }
    if (space) { setRatingRequired(space.rating_required ?? false); setAutoApprove(space.auto_approve ?? false) }
  }, [space?.id])

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    setSendingInvite(true)
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
      body: JSON.stringify({ spaceId: id, email: inviteEmail, name: inviteName }),
    })
    setInviteSent(true)
    setSendingInvite(false)
    setInviteEmail('')
    setInviteName('')
    setTimeout(() => setInviteSent(false), 3000)
  }

  async function deleteTestimonial(tid: string, name: string) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    deleteTestimonialMutation.mutate({ id: tid, spaceId: id, token: session.access_token }, {
      onSuccess: () => {
        toast(`Testimonial from ${name} deleted`)
      },
    })
  }

  async function saveSettings() {
    setSavingSettings(true)
    await updateSpace.mutateAsync({ id, updates: { rating_required: ratingRequired, auto_approve: autoApprove } })
    setSavingSettings(false)
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 2000)
  }

  async function saveBrandColor() {
    setSavingColor(true)
    await updateSpace.mutateAsync({ id, updates: { theme_color: brandColor } })
    setSavingColor(false)
    setColorSaved(true)
    setTimeout(() => setColorSaved(false), 2000)
  }

  async function polishWithAI(t: import('@/lib/supabase').Testimonial) {
    if (!t.content) return
    const { data: { session } } = await supabase.auth.getSession()
    polishMutation.mutate({ testimonial: t, spaceId: id, token: session?.access_token || '' }, {
      onError: (err) => toast.error(err.message || 'Failed to polish testimonial'),
    })
  }

  function startEditing(t: import('@/lib/supabase').Testimonial) {
    setEditingId(t.id)
    setEditContent(t.content || '')
    setEditAiContent(t.ai_enhanced_content || '')
  }

  async function saveEdit(t: import('@/lib/supabase').Testimonial) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    editMutation.mutate({
      id: t.id, spaceId: id, token: session.access_token,
      ...(editContent !== t.content && { content: editContent }),
      ...(editAiContent !== t.ai_enhanced_content && { aiContent: editAiContent }),
    }, {
      onSuccess: () => { setEditingId(null); toast('Testimonial saved') },
      onError: (err) => toast.error(err.message || 'Failed to save'),
    })
  }

  function downloadQR() {
    const svg = document.getElementById('space-qr-code')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${space?.slug}-qr.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const filtered = testimonials.filter(t => tab === 'all' ? true : t.status === tab)
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const collectUrl = space ? `${origin}/collect/${space.slug}` : ''
  const wallUrl = space ? `${origin}/wall/${space.slug}` : ''
  const embedCode = space ? `<script src="${origin}/embed.js" data-space="${space.slug}" async></script>` : ''

  if (spaceLoading || testimonialsLoading) return <div className="dash-page"><div className="skeleton" style={{ height: 200 }} /></div>
  if (!space) return <div className="dash-page">Space not found.</div>

  const PAGE_TABS = [
    { key: 'testimonials', label: 'Testimonials', count: testimonials.filter(t => t.status === 'pending').length },
    { key: 'settings', label: 'Settings' },
    { key: 'growth', label: 'Growth' },
    { key: 'analytics', label: 'Analytics' },
  ] as const

  return (
    <div className="dash-page" style={{ maxWidth: 1000 }}>
      {/* Header */}
      <Link href="/dashboard/spaces" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        <ArrowLeft size={15} /> All spaces
      </Link>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{space.name}</h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>{testimonials.length} testimonials · {testimonials.filter(t => t.status === 'pending').length} pending review</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href={collectUrl} target="_blank" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}><ExternalLink size={14} /> Collect</Link>
          <Link href={wallUrl} target="_blank" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}><ExternalLink size={14} /> Wall</Link>
        </div>
      </div>

      {/* Page tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '1.75rem', borderBottom: '1px solid #eceae6' }}>
        {PAGE_TABS.map((tab) => (
          <button key={tab.key} onClick={() => setPageTab(tab.key as typeof pageTab)}
            style={{ padding: '0.6rem 1.1rem', background: 'none', border: 'none', borderBottom: pageTab === tab.key ? '2px solid var(--brand)' : '2px solid transparent', cursor: 'pointer', fontSize: '0.9rem', fontWeight: pageTab === tab.key ? 700 : 400, color: pageTab === tab.key ? 'var(--brand)' : 'var(--ink-muted)', marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            {tab.label}
            {'count' in tab && tab.count ? <span style={{ fontSize: '0.65rem', background: '#e8963a', color: 'white', borderRadius: 100, padding: '0.1rem 0.45rem', fontWeight: 700 }}>{tab.count}</span> : null}
          </button>
        ))}
      </div>

      {/* ── TESTIMONIALS TAB ── */}
      {pageTab === 'testimonials' && (
        <>
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

          {/* Status filter tabs */}
          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', borderBottom: '1px solid #eceae6' }}>
            {(['all', 'pending', 'approved', 'archived'] as const).map(t => {
              const count = t === 'all' ? testimonials.length : testimonials.filter(x => x.status === t).length
              return (
                <button key={t} onClick={() => setTab(t)} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--brand)' : '2px solid transparent', cursor: 'pointer', fontSize: '0.875rem', fontWeight: tab === t ? 600 : 400, color: tab === t ? 'var(--brand)' : 'var(--ink-muted)', textTransform: 'capitalize', marginBottom: -1 }}>
                  {t} {count > 0 && <span className="badge badge-gray" style={{ fontSize: '0.65rem', marginLeft: 4 }}>{count}</span>}
                </button>
              )
            })}
          </div>

          {/* Testimonials list */}
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
                      {t.video_url && <video src={t.video_url} controls style={{ width: '100%', maxHeight: 280, borderRadius: 8, background: '#1a1713', display: 'block' }} />}
                      {t.image_url && <img src={t.image_url} alt="Attached" style={{ maxWidth: '100%', maxHeight: 260, borderRadius: 8, objectFit: 'cover', display: 'block' }} />}
                      {t.content && (
                        <>
                          {editingId === t.id ? (
                            <textarea
                              value={editContent}
                              onChange={e => setEditContent(e.target.value)}
                              rows={4}
                              style={{ width: '100%', fontSize: '0.9rem', lineHeight: 1.65, padding: '0.6rem 0.75rem', borderRadius: 8, border: '1.5px solid var(--brand)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                            />
                          ) : (
                            <p style={{ fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.65, margin: 0 }}>{t.content}</p>
                          )}
                          {(t.ai_enhanced_content || (editingId === t.id && editAiContent)) && (
                            <div style={{ background: 'var(--brand-light)', borderRadius: 8, padding: '0.75rem 1rem', borderLeft: '3px solid var(--brand)' }}>
                              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: 4 }}><Sparkles size={11} /> AI-polished version</div>
                              {editingId === t.id ? (
                                <textarea
                                  value={editAiContent}
                                  onChange={e => setEditAiContent(e.target.value)}
                                  rows={4}
                                  style={{ width: '100%', fontSize: '0.9rem', lineHeight: 1.65, padding: '0.6rem 0.75rem', borderRadius: 8, border: '1.5px solid var(--brand)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', background: 'white', boxSizing: 'border-box' }}
                                />
                              ) : (
                                <p style={{ fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.65, margin: 0 }}>{t.ai_enhanced_content}</p>
                              )}
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
                      <button onClick={() => updateStatus.mutate({ id: t.id, spaceId: id, status: 'approved' })} className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', color: '#2e7d4f' }}>
                        <CheckCircle size={12} /> Approve
                      </button>
                    )}
                    {t.status !== 'archived' && (
                      <button onClick={() => updateStatus.mutate({ id: t.id, spaceId: id, status: 'archived' })} className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', color: '#c0392b' }}>
                        <Archive size={12} /> Archive
                      </button>
                    )}
                    {t.status !== 'pending' && (
                      <button onClick={() => updateStatus.mutate({ id: t.id, spaceId: id, status: 'pending' })} className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                        Reset to pending
                      </button>
                    )}
                    {t.status === 'approved' && (
                      <button onClick={() => copyText(`${typeof window !== 'undefined' ? window.location.origin : ''}/share/${t.id}`, `share-${t.id}`)}
                        className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', color: 'var(--brand)' }}>
                        <Share2 size={12} /> {copied === `share-${t.id}` ? '✓ Link copied!' : 'Share'}
                      </button>
                    )}
                    {t.type === 'text' && editingId !== t.id && (
                      <button onClick={() => startEditing(t)} className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                        <Pencil size={12} /> Edit
                      </button>
                    )}
                    {editingId === t.id && (
                      <>
                        <button onClick={() => saveEdit(t)} disabled={editMutation.isPending} className="btn btn-primary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                          {editMutation.isPending ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : null} Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                          Cancel
                        </button>
                      </>
                    )}
                    <button onClick={() => deleteTestimonial(t.id, t.submitter_name)} className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', color: '#c0392b', marginLeft: 'auto' }}>
                      <Trash2 size={12} /> Delete
                    </button>
                    {t.content && !t.ai_enhanced_content && (() => {
                      const canAI = PLANS[(profile?.plan || 'free') as keyof typeof PLANS].ai
                      return canAI ? (
                        <button onClick={() => polishWithAI(t)} disabled={polishMutation.isPending && polishMutation.variables?.testimonial.id === t.id} className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', color: 'var(--brand)' }}>
                          {polishMutation.isPending && polishMutation.variables?.testimonial.id === t.id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={12} />}
                          {polishMutation.isPending && polishMutation.variables?.testimonial.id === t.id ? 'Polishing…' : 'Polish with AI'}
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
        </>
      )}

      {/* ── SETTINGS TAB ── */}
      {pageTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Brand color */}
          <div className="card" style={{ background: 'white' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)', marginBottom: '0.2rem' }}>Brand color</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '1.25rem' }}>Used in your embed widget, collect page, and wall page.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', padding: '0.85rem 1rem', background: 'var(--paper)', borderRadius: 10, border: '1px solid #eceae6' }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: brandColor, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginBottom: '0.15rem' }}>Selected color</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>{brandColor.toUpperCase()}</div>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Presets</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['#d4751f','#e85d2f','#c0392b','#e74c8b','#9b59b6','#7c5cbf','#3498db','#1a5fa8','#0891b2','#1a7a7a','#2e7d4f','#27ae60','#f39c12','#e67e22','#1a1713','#64748b'].map(c => (
                  <button key={c} type="button" onClick={() => { setBrandColor(c); setColorInput(c) }} title={c}
                    style={{ width: 30, height: 30, borderRadius: 6, background: c, border: brandColor === c ? '3px solid var(--ink)' : '2px solid transparent', cursor: 'pointer', flexShrink: 0, transition: 'transform 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Color picker</div>
                <input type="color" value={brandColor} onChange={e => { setBrandColor(e.target.value); setColorInput(e.target.value) }}
                  style={{ width: 48, height: 36, borderRadius: 8, border: '1px solid #d5d1c9', cursor: 'pointer', padding: 2 }} />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paste hex code</div>
                <input className="input" value={colorInput} onChange={e => setColorInput(e.target.value)}
                  onBlur={() => { const val = colorInput.startsWith('#') ? colorInput : '#' + colorInput; if (/^#[0-9a-fA-F]{6}$/.test(val)) { setBrandColor(val); setColorInput(val) } }}
                  onKeyDown={e => { if (e.key === 'Enter') { const val = colorInput.startsWith('#') ? colorInput : '#' + colorInput; if (/^#[0-9a-fA-F]{6}$/.test(val)) { setBrandColor(val); setColorInput(val) } } }}
                  placeholder="#000000" maxLength={7} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', width: '100%' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Generate</div>
                <button type="button" className="btn btn-secondary" style={{ fontSize: '0.82rem' }} onClick={() => {
                  const flat = ['#e63946','#457b9d','#2a9d8f','#e9c46a','#f4a261','#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#0ea5e9','#14b8a6','#84cc16','#f97316','#ef4444'].filter(c => c !== brandColor)
                  const pick = flat[Math.floor(Math.random() * flat.length)]
                  setBrandColor(pick); setColorInput(pick)
                }}>🎨 Suggest</button>
              </div>
            </div>
            <button onClick={saveBrandColor} className="btn btn-primary" disabled={savingColor} style={{ fontSize: '0.875rem' }}>
              {colorSaved ? '✓ Color saved!' : savingColor ? 'Saving…' : 'Save brand color'}
            </button>
          </div>

          {/* Collection settings */}
          <div className="card" style={{ background: 'white' }}>
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
        </div>
      )}

      {/* ── GROWTH TAB ── */}
      {pageTab === 'growth' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Invite */}
          <div className="card" style={{ background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
              <Mail size={15} color="var(--brand)" />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)' }}>Send invitation</div>
            </div>
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
          </div>

          {/* Embed */}
          <div className="card" style={{ background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}>
              <Code2 size={15} color="var(--brand)" />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)' }}>Embed on your website</div>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: '1rem' }}>Add a live testimonial widget to any website with one line of code.</p>
            <button onClick={() => setShowEmbed(true)} className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
              <Code2 size={14} /> Open embed guide
            </button>
          </div>

          {/* Campaign links */}
          <div className="card" style={{ background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
              <Link2 size={15} color="var(--brand)" />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)' }}>Campaign links</div>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: '1rem' }}>Share trackable links to see which channel drives the most testimonials.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {([
                { label: 'Instagram', ref: 'instagram', Icon: Instagram },
                { label: 'TikTok', ref: 'tiktok', Icon: Music2 },
                { label: 'Email', ref: 'email', Icon: Mail },
                { label: 'WhatsApp', ref: 'whatsapp', Icon: MessageCircle },
                { label: 'LinkedIn', ref: 'linkedin', Icon: Linkedin },
                { label: 'Facebook', ref: 'facebook', Icon: Facebook },
                { label: 'Twitter / X', ref: 'twitter', Icon: Twitter },
                { label: 'Flyer / Print', ref: 'print', Icon: Printer },
                { label: 'Podcast', ref: 'podcast', Icon: Mic },
                { label: 'YouTube', ref: 'youtube', Icon: Youtube },
              ] satisfies { label: string; ref: string; Icon: LucideIcon }[]).map(({ label, Icon, ref }) => {
                const url = `${collectUrl}?ref=${ref}`
                const key = `campaign-${ref}`
                return (
                  <div key={ref} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--paper)', border: '1px solid #eceae6', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'var(--brand-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: 'var(--brand)',
                      }}
                    >
                      <Icon size={16} strokeWidth={1.5} aria-hidden />
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)', width: 90, flexShrink: 0 }}>{label}</span>
                    <span style={{ flex: 1, fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</span>
                    <button onClick={() => copyText(url, key)} className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', flexShrink: 0, fontSize: '0.75rem' }}>
                      <Copy size={12} /> {copied === key ? '✓' : 'Copy'}
                    </button>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input className="input" value={customSource} onChange={e => setCustomSource(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="custom-source" style={{ flex: 1, fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }} />
              <button onClick={() => { if (customSource) copyText(`${collectUrl}?ref=${customSource}`, 'campaign-custom') }}
                className="btn btn-primary" style={{ fontSize: '0.82rem', flexShrink: 0 }}>
                <Copy size={13} /> {copied === 'campaign-custom' ? '✓ Copied!' : 'Copy link'}
              </button>
            </div>
            {customSource && <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>{collectUrl}?ref={customSource}</p>}
          </div>

          {/* QR Code */}
          <div className="card" style={{ background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
              <QrCode size={15} color="var(--brand)" />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)' }}>QR Code</div>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: '1.25rem' }}>Print or display in-store, on packaging, or in receipts. Scanning opens your collection page.</p>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ background: 'var(--paper)', padding: '1rem', borderRadius: 12, border: '1px solid #eceae6', display: 'inline-block' }}>
                <QRCode id="space-qr-code" value={collectUrl} size={160} fgColor="#1a1713" bgColor="white" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{collectUrl}</div>
                <button onClick={downloadQR} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>⬇ Download SVG</button>
                <button onClick={() => copyText(collectUrl, 'qr-url')} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                  <Copy size={13} /> {copied === 'qr-url' ? '✓ Copied!' : 'Copy link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {pageTab === 'analytics' && (() => {
        const ps = calculateProofScore(testimonials)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              {[
                { label: 'Total', value: testimonials.length },
                { label: 'Approved', value: testimonials.filter(t => t.status === 'approved').length },
                { label: 'Pending', value: testimonials.filter(t => t.status === 'pending').length },
                { label: 'With rating', value: testimonials.filter(t => t.rating).length },
                { label: 'With video', value: testimonials.filter(t => t.video_url).length },
                {
                  label: 'Avg rating',
                  value: testimonials.filter(t => t.rating).length
                    ? (testimonials.reduce((a, t) => a + (t.rating || 0), 0) / testimonials.filter(t => t.rating).length).toFixed(1)
                    : null,
                },
              ].map(({ label, value }) => (
                <div key={label} className="card" style={{ background: 'white', textAlign: 'center', padding: '1rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    {value === null ? '—' : (
                      <>
                        {value}
                        {label === 'Avg rating' && (
                          <Star size={15} strokeWidth={1.5} color="#e8963a" fill="#e8963a" style={{ flexShrink: 0 }} aria-hidden />
                        )}
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '0.2rem' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Proof Score */}
            <div className="card" style={{ background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                <Gauge size={16} strokeWidth={1.5} color="var(--brand)" aria-hidden />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>Proof Score™</span>
                <span style={{ fontSize: '0.72rem', background: 'var(--brand-light)', color: 'var(--brand)', padding: '0.15rem 0.5rem', borderRadius: 100, fontWeight: 700, letterSpacing: '0.03em' }}>BETA</span>
                <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.9rem', color: ps.color }}>
                  <ProofGradeIcon name={ps.gradeIcon} size={16} color={ps.color} />
                  {ps.grade}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, textAlign: 'center' }}>
                  <ProofScoreRing score={ps.total} color={ps.color} size={96} />
                  <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', marginTop: '0.35rem' }}>out of 100</div>
                </div>
                <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {ps.dimensions.map(dim => (
                    <div key={dim.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', minWidth: 92, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', flexShrink: 0 }}>
                        <ProofDimensionIcon name={dim.icon} size={14} />
                        {dim.label}
                      </span>
                      <div style={{ flex: 1, height: 6, background: '#f0ece6', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 3, background: ps.color, width: `${(dim.score / dim.max) * 100}%`, transition: 'width 0.6s ease' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', width: 36, textAlign: 'right', flexShrink: 0 }}>{dim.score}/{dim.max}</span>
                    </div>
                  ))}
                </div>
              </div>
              {ps.tips.length > 0 && (
                <div style={{ marginTop: '1.25rem', borderTop: '1px solid #f0ece6', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lightbulb size={14} strokeWidth={1.5} aria-hidden style={{ flexShrink: 0, color: 'var(--ink-muted)' }} />
                    Tips to improve
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {ps.tips.map((tip, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--ink)', background: 'var(--paper)', padding: '0.5rem 0.75rem', borderRadius: 8 }}>
                        <span style={{ flexShrink: 0, paddingTop: 2 }}>
                          <ProofTipIcon name={tip.icon} size={15} />
                        </span>
                        <span>{tip.text}</span>
                        <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '0.72rem', fontWeight: 700, color: ps.color, background: ps.color + '18', padding: '0.15rem 0.5rem', borderRadius: 100 }}>+{tip.impact} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* Embed wizard modal — available from any tab */}
      <EmbedWizard open={showEmbed} onClose={() => setShowEmbed(false)} embedCode={embedCode} spaceSlug={space.slug} />
    </div>
  )
}
