'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Space, Testimonial } from '@/lib/supabase'
import { formatDate, PLANS } from '@/lib/utils'
import { Star, Quote, ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { calculateProofScore } from '@/lib/proofScore'

export default function WallPage() {
  const { id: slug } = useParams<{ id: string }>()
  const t = useTranslations('wall')
  const [space, setSpace] = useState<Space | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<number | null>(null)
  const [removeBranding, setRemoveBranding] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: sp } = await supabase.from('spaces').select('*').eq('slug', slug).single()
      if (!sp) { setLoading(false); return }
      setSpace(sp)
      const [{ data: te }, { data: prof }] = await Promise.all([
        supabase.from('testimonials').select('*').eq('space_id', sp.id).eq('status', 'approved').order('created_at', { ascending: false }),
        supabase.from('profiles').select('plan').eq('id', sp.user_id).single(),
      ])
      setTestimonials(te || [])
      setRemoveBranding(PLANS[(prof?.plan || 'free') as keyof typeof PLANS].removeBranding)
      setLoading(false)
    }
    load()
  }, [slug])

  const filtered = filter ? testimonials.filter(t => t.rating === filter) : testimonials
  const avgRating = testimonials.filter(t => t.rating).reduce((a, t) => a + (t.rating || 0), 0) / (testimonials.filter(t => t.rating).length || 1)
  const brandColor = space?.theme_color || '#d4751f'

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', maxWidth: 900, width: '100%', padding: '2rem' }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 160 }} />)}
        </div>
      </div>
    )
  }

  if (!space) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)', textAlign: 'center' }}>
        <div><div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div><h2>{t('not_found_title')}</h2></div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ width: 60, height: 60, borderRadius: 15, background: brandColor, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Quote size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{t('title', { name: space.name })}</h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            {testimonials.filter(te => te.rating).length > 0 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #eceae6', borderRadius: 100, padding: '0.45rem 1.1rem' }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < Math.round(avgRating) ? '#e8963a' : 'none'} color={i < Math.round(avgRating) ? '#e8963a' : '#d5d1c9'} />)}
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{avgRating.toFixed(1)}</span>
                <span style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>{t('reviews_from', { count: testimonials.filter(te => te.rating).length })}</span>
              </div>
            )}
            {(() => {
              const ps = calculateProofScore(testimonials)
              if (ps.total < 10) return null
              return (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'white', border: `1px solid ${ps.color}40`, borderRadius: 100, padding: '0.45rem 1.1rem' }}>
                  <span style={{ fontSize: '0.9rem' }}>{ps.gradeEmoji}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: ps.color }}>Proof Score™</span>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: ps.color, fontFamily: 'Georgia, serif' }}>{ps.total}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--ink-subtle)', fontWeight: 500 }}>/ 100</span>
                </div>
              )
            })()}
          </div>
        </div>

        {/* Filter by stars */}
        {testimonials.some(te => te.rating) && (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <button onClick={() => setFilter(null)} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', ...(filter === null ? { background: brandColor, color: 'white', borderColor: brandColor } : {}) }}>{t('filter_all')}</button>
            {[5, 4, 3, 2, 1].map(n => (
              <button key={n} onClick={() => setFilter(filter === n ? null : n)} className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', display: 'flex', alignItems: 'center', gap: 4, ...(filter === n ? { background: brandColor, color: 'white', borderColor: brandColor } : {}) }}>
                {n} <Star size={11} fill={filter === n ? 'white' : '#e8963a'} color={filter === n ? 'white' : '#e8963a'} />
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--ink-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💬</div>
            <p>{t('no_testimonials')}</p>
            <Link href={`/collect/${slug}`} className="btn btn-primary" style={{ marginTop: '1rem', background: brandColor, borderColor: brandColor }}>{t('be_first')}</Link>
          </div>
        ) : (
          <div style={{ columns: '300px 3', gap: '1rem' }}>
            {filtered.map(te => (
              <div key={te.id} className="testimonial-card" style={{ breakInside: 'avoid', marginBottom: '1rem' }}>
                {te.rating && (
                  <div style={{ display: 'flex', gap: 2, marginTop: '1rem', marginBottom: '0.75rem' }}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={13} fill={i < te.rating! ? '#e8963a' : 'none'} color={i < te.rating! ? '#e8963a' : '#d5d1c9'} />)}
                  </div>
                )}
                {te.video_url && (
                  <video src={te.video_url} controls style={{ width: '100%', borderRadius: 8, marginBottom: '0.75rem', marginTop: '1rem' }} />
                )}
                {(te.ai_enhanced_content || te.content) && (
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--ink)', marginBottom: '1.25rem' }}>
                    {te.ai_enhanced_content || te.content}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: brandColor + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: brandColor, flexShrink: 0 }}>
                    {te.submitter_name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)' }}>{te.submitter_name}</div>
                    {(te.submitter_role || te.submitter_company) && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                        {[te.submitter_role, te.submitter_company].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA to leave one */}
        <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #eceae6' }}>
          <Link href={`/collect/${slug}`} className="btn btn-primary" style={{ background: brandColor, borderColor: brandColor }}>
            {t('leave_cta')} <ExternalLink size={14} />
          </Link>
        </div>

        {/* Branding + language switcher */}
        <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          {!removeBranding && (
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-subtle)' }}>
              {t('powered_by')} <Link href="/" style={{ color: 'var(--ink-muted)', fontWeight: 600, textDecoration: 'none' }}>vouchly</Link>
            </span>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  )
}
