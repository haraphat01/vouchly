import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'
import { ArrowRight, Quote } from 'lucide-react'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vouchly.tech'

export const metadata: Metadata = {
  title: 'Blog — Testimonials, Social Proof & Conversion Tips',
  description:
    'Practical guides on collecting customer testimonials, building social proof, and turning happy customers into your best marketing asset.',
  alternates: { canonical: `${APP_URL}/blog` },
  openGraph: {
    title: 'Vouchly Blog — Testimonials, Social Proof & Conversion Tips',
    description:
      'Practical guides on collecting customer testimonials, building social proof, and turning happy customers into your best marketing asset.',
    url: `${APP_URL}/blog`,
    type: 'website',
  },
}

export default function BlogIndexPage() {
  const posts = getAllPosts()

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #eceae6', background: 'rgba(253,248,240,0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, background: 'var(--brand)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Quote size={16} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--ink)' }}>vouchly</span>
          </Link>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/#pricing" style={{ color: 'var(--ink-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Pricing</Link>
            <Link href="/auth/login" className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>Log in</Link>
            <Link href="/auth/signup" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(2.5rem, 8vw, 4rem) 1.25rem 0' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--brand-light)', color: '#7a3815', padding: '0.3rem 0.85rem', borderRadius: 100, fontSize: '0.78rem', fontWeight: 600, marginBottom: '1.25rem' }}>
          Blog
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 700, lineHeight: 1.15, color: 'var(--ink)', marginBottom: '0.75rem' }}>
          Testimonials, Social Proof &amp; Conversion
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--ink-muted)', lineHeight: 1.7 }}>
          Practical guides for business owners who want to collect better testimonials, build trust faster, and convert more visitors into customers.
        </p>
      </div>

      {/* Post list */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(2rem, 6vw, 3rem) 1.25rem clamp(3rem, 8vw, 5rem)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <article
                className="card card-hover"
                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span style={{ background: 'var(--brand-light)', color: '#7a3815', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: 100 }}>
                    {post.category}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                    {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--ink-subtle)' }}>· {post.readingTime}</span>
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3, margin: 0 }}>
                  {post.title}
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', lineHeight: 1.65, margin: 0 }}>
                  {post.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', fontWeight: 600, color: 'var(--brand)' }}>
                  Read article <ArrowRight size={13} />
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #eceae6', padding: '2rem 1.25rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: '0.75rem' }}>
          <div style={{ width: 24, height: 24, background: 'var(--brand)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Quote size={12} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ink)' }}>vouchly</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--ink-subtle)' }}>© {new Date().getFullYear()} vouchly. All rights reserved.</p>
      </footer>
    </div>
  )
}
