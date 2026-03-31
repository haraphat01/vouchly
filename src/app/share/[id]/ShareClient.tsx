'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Star, Copy, Quote, Share2 } from 'lucide-react'
import type { Testimonial } from '@/lib/supabase'

type Props = {
  testimonial: Testimonial
  space: { name: string; theme_color: string; slug: string } | null
}

export default function ShareClient({ testimonial: t, space }: Props) {
  const [copied, setCopied] = useState(false)
  const brandColor = space?.theme_color || '#d4751f'
  const content = t.ai_enhanced_content || t.content || ''
  const role = [t.submitter_role, t.submitter_company].filter(Boolean).join(' · ')
  const initials = t.submitter_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `"${content.slice(0, 200)}${content.length > 200 ? '…' : ''}" — ${t.submitter_name}`

  function copyLink() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.25rem' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 20, padding: '2.5rem 2rem', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid #eceae6', position: 'relative', marginBottom: '1.5rem' }}>
          {/* Quote mark */}
          <div style={{ position: 'absolute', top: 20, left: 24, fontSize: 64, lineHeight: 1, color: brandColor + '25', fontFamily: 'Georgia, serif', userSelect: 'none' }}>"</div>

          {/* Stars */}
          {t.rating && (
            <div style={{ display: 'flex', gap: 3, marginBottom: '1rem' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill={i < t.rating! ? '#e8963a' : 'none'} color={i < t.rating! ? '#e8963a' : '#d5d1c9'} />
              ))}
            </div>
          )}

          {/* Content */}
          {t.video_url ? (
            <video src={t.video_url} controls style={{ width: '100%', borderRadius: 10, marginBottom: '1.25rem', background: '#1a1713' }} />
          ) : (
            <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: '#1a1713', marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>
              {content}
            </p>
          )}

          {/* Image */}
          {t.image_url && (
            <img src={t.image_url} alt="Attached" style={{ width: '100%', borderRadius: 10, marginBottom: '1.25rem', maxHeight: 280, objectFit: 'cover' }} />
          )}

          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: brandColor + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: brandColor, flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1713' }}>{t.submitter_name}</div>
              {role && <div style={{ fontSize: '0.82rem', color: '#7a7367' }}>{role}</div>}
            </div>
            {space && (
              <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#b8b3a8', textAlign: 'right' }}>
                <div>via</div>
                <div style={{ fontWeight: 700, color: brandColor }}>{space.name}</div>
              </div>
            )}
          </div>
        </div>

        {/* Share buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <button onClick={async () => {
            if (navigator.share) {
              await navigator.share({ title: `${t.submitter_name}'s testimonial`, text: shareText, url: shareUrl })
            } else {
              copyLink()
            }
          }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', background: brandColor, color: 'white', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', border: 'none' }}>
            <Share2 size={16} /> Share this testimonial
          </button>
          <button onClick={copyLink}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: 'white', color: '#1a1713', border: '1.5px solid #eceae6', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
            <Copy size={15} /> {copied ? '✓ Copied!' : 'Copy link'}
          </button>
        </div>

        {/* CTA */}
        {space && (
          <div style={{ textAlign: 'center' }}>
            <Link href={`/collect/${space.slug}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', background: brandColor, color: 'white', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              <Quote size={15} /> Leave your own testimonial
            </Link>
            <p style={{ fontSize: '0.72rem', color: '#b8b3a8', marginTop: '0.75rem' }}>
              Powered by <strong style={{ color: '#7a7367' }}>vouchly</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
