'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Space, Testimonial } from '@/lib/supabase'
import { formatDate, truncate } from '@/lib/utils'
import { ArrowLeft, Copy, ExternalLink, Star, CheckCircle, XCircle, Archive, Sparkles, Send, Loader2, Code2, Mail } from 'lucide-react'

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

  useEffect(() => {
    async function load() {
      const [{ data: sp }, { data: te }] = await Promise.all([
        supabase.from('spaces').select('*').eq('id', id).single(),
        supabase.from('testimonials').select('*').eq('space_id', id).order('created_at', { ascending: false }),
      ])
      setSpace(sp)
      setTestimonials(te || [])
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
      const res = await fetch('/api/testimonials/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: t.content, name: t.submitter_name, role: t.submitter_role }),
      })
      const { polished } = await res.json()
      await supabase.from('testimonials').update({ ai_enhanced_content: polished }).eq('id', t.id)
      setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, ai_enhanced_content: polished } : x))
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

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const filtered = testimonials.filter(t => tab === 'all' ? true : t.status === tab)
  const collectUrl = space ? `${typeof window !== 'undefined' ? window.location.origin : ''}/collect/${space.slug}` : ''
  const wallUrl = space ? `${typeof window !== 'undefined' ? window.location.origin : ''}/wall/${space.slug}` : ''
  const embedCode = space ? `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed.js" data-space="${space.slug}" async></script>` : ''

  if (loading) return <div style={{ padding: '3rem' }}><div className="skeleton" style={{ height: 200 }} /></div>
  if (!space) return <div style={{ padding: '3rem' }}>Space not found.</div>

  return (
    <div style={{ padding: '2.5rem', maxWidth: 1000 }}>
      {/* Header */}
      <Link href="/dashboard/spaces" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-muted)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        <ArrowLeft size={15} /> All spaces
      </Link>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{space.name}</h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>{testimonials.length} testimonials · {testimonials.filter(t => t.status === 'pending').length} pending</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setShowInvite(!showInvite)} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}><Mail size={14} /> Invite</button>
          <button onClick={() => setShowEmbed(!showEmbed)} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}><Code2 size={14} /> Embed</button>
          <Link href={collectUrl} target="_blank" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}><ExternalLink size={14} /> Collection page</Link>
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

      {/* Embed panel */}
      {showEmbed && (
        <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--paper)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Embed widget</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '0.75rem' }}>Paste this single line anywhere on your website to show your testimonial wall:</p>
          <div style={{ background: '#1a1713', borderRadius: 8, padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#faecd8', flex: 1, wordBreak: 'break-all' }}>{embedCode}</code>
            <button onClick={() => copyText(embedCode, 'embed')} className="btn btn-ghost" style={{ color: '#faecd8', padding: '0.35rem 0.5rem', flexShrink: 0 }}>
              <Copy size={14} /> {copied === 'embed' ? '✓' : ''}
            </button>
          </div>
        </div>
      )}

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
              {t.content && (
                <div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.65, margin: 0 }}>{t.content}</p>
                  {t.ai_enhanced_content && (
                    <div style={{ marginTop: '0.75rem', background: 'var(--brand-light)', borderRadius: 8, padding: '0.75rem 1rem', borderLeft: '3px solid var(--brand)' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: 4 }}><Sparkles size={11} /> AI-polished version</div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.65, margin: 0 }}>{t.ai_enhanced_content}</p>
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
                {t.content && !t.ai_enhanced_content && (
                  <button onClick={() => polishWithAI(t)} disabled={polishing === t.id} className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', color: 'var(--brand)' }}>
                    {polishing === t.id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={12} />}
                    {polishing === t.id ? 'Polishing…' : 'Polish with AI'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
