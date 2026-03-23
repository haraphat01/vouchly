import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'vouchly — Collect customer testimonials, polish them with AI, and embed a live testimonial wall on any website in one script tag.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#fdf8f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        {/* Background pattern dots */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, #eceae6 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            opacity: 0.6,
          }}
        />

        {/* Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1.5px solid #eceae6',
            borderRadius: '24px',
            padding: '64px 80px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            maxWidth: '960px',
            width: '100%',
            boxShadow: '0 8px 48px rgba(26,23,19,0.08)',
            position: 'relative',
          }}
        >
          {/* Logo row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                background: '#d4751f',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '30px',
                fontWeight: 700,
              }}
            >
              v
            </div>
            <span style={{ fontSize: '32px', fontWeight: 700, color: '#1a1713', letterSpacing: '-0.5px' }}>
              vouchly
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: '52px',
              fontWeight: 700,
              color: '#1a1713',
              lineHeight: 1.15,
              marginBottom: '20px',
              letterSpacing: '-1px',
            }}
          >
            Collect customer testimonials,{' '}
            <span style={{ color: '#d4751f' }}>polish with AI</span>,{' '}
            embed anywhere.
          </div>

          {/* Subtext */}
          <div style={{ fontSize: '22px', color: '#7a7367', lineHeight: 1.6, marginBottom: '36px' }}>
            Send a branded form → customers leave text or video feedback → AI rewrites it into polished social proof → one script tag embeds it on your site.
          </div>

          {/* Pill badges */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {['Text & Video', 'AI Rewriter', 'One Script Embed', 'Free to Start'].map((label) => (
              <div
                key={label}
                style={{
                  background: '#faecd8',
                  color: '#7a3815',
                  borderRadius: '100px',
                  padding: '8px 20px',
                  fontSize: '16px',
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
