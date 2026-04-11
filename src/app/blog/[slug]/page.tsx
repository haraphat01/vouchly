import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllPosts, getPost, type ContentBlock } from '@/lib/blog'
import { ArrowLeft, Quote, Clock, Tag } from 'lucide-react'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vouchly.app'

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = getPost(params.slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `${APP_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${APP_URL}/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: ['vouchly'],
      tags: post.keywords,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case 'h2':
      return (
        <h2 key={index} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.25rem, 3vw, 1.6rem)', fontWeight: 700, color: 'var(--ink)', marginTop: '2.5rem', marginBottom: '0.75rem', lineHeight: 1.25 }}>
          {block.text}
        </h2>
      )
    case 'h3':
      return (
        <h3 key={index} style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', marginTop: '1.75rem', marginBottom: '0.5rem' }}>
          {block.text}
        </h3>
      )
    case 'p':
      return (
        <p key={index} style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--ink)', marginBottom: '1.1rem' }}>
          {block.text}
        </p>
      )
    case 'ul':
      return (
        <ul key={index} style={{ paddingLeft: '1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {block.items.map((item, i) => (
            <li key={i} style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--ink)' }}>{item}</li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol key={index} style={{ paddingLeft: '1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {block.items.map((item, i) => (
            <li key={i} style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--ink)' }}>{item}</li>
          ))}
        </ol>
      )
    case 'callout':
      return (
        <blockquote key={index} style={{ background: 'var(--brand-light)', borderLeft: '4px solid var(--brand)', borderRadius: '0 var(--radius) var(--radius) 0', padding: '1rem 1.25rem', margin: '1.5rem 0', fontSize: '0.95rem', lineHeight: 1.75, color: '#5a2d0c', whiteSpace: 'pre-line' }}>
          {block.text}
        </blockquote>
      )
    case 'cta':
      return (
        <div key={index} style={{ background: 'var(--brand)', borderRadius: 'var(--radius-lg)', padding: 'clamp(1.5rem, 4vw, 2.5rem)', margin: '2.5rem 0', textAlign: 'center', color: 'white' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>{block.heading}</h3>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>{block.text}</p>
          <Link href={block.href} className="btn" style={{ display: 'inline-flex', background: 'white', color: 'var(--brand)', fontWeight: 700, padding: '0.75rem 2rem', borderRadius: 'var(--radius)', textDecoration: 'none', fontSize: '0.95rem' }}>
            {block.label}
          </Link>
        </div>
      )
    default:
      return null
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: 'vouchly',
      url: APP_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'vouchly',
      url: APP_URL,
      logo: { '@type': 'ImageObject', url: `${APP_URL}/favicon.svg` },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${APP_URL}/blog/${post.slug}`,
    },
    keywords: post.keywords.join(', '),
    url: `${APP_URL}/blog/${post.slug}`,
  }

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
            <Link href="/blog" style={{ color: 'var(--ink-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Blog</Link>
            <Link href="/auth/login" className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>Log in</Link>
            <Link href="/auth/signup" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Breadcrumb + back link */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '1.5rem 1.25rem 0' }}>
        <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.875rem', color: 'var(--ink-muted)', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeft size={14} /> Back to Blog
        </Link>
      </div>

      {/* Article header */}
      <header style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1.25rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--brand-light)', color: '#7a3815', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: 100 }}>
            <Tag size={10} /> {post.category}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
            {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.8rem', color: 'var(--ink-subtle)' }}>
            <Clock size={11} /> {post.readingTime}
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 700, lineHeight: 1.15, color: 'var(--ink)', marginBottom: '1rem' }}>
          {post.title}
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--ink-muted)', lineHeight: 1.65, marginBottom: '2rem', borderBottom: '1px solid #eceae6', paddingBottom: '2rem' }}>
          {post.description}
        </p>
      </header>

      {/* Article body */}
      <article style={{ maxWidth: 760, margin: '0 auto', padding: '0 1.25rem clamp(3rem, 8vw, 6rem)' }}>
        {post.content.map((block, i) => renderBlock(block, i))}
      </article>

      {/* Related posts */}
      <div style={{ background: 'white', borderTop: '1px solid #eceae6', padding: 'clamp(2rem, 6vw, 4rem) 1.25rem' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--ink)' }}>More from the blog</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {getAllPosts().filter(p => p.slug !== post.slug).slice(0, 2).map(p => (
              <Link key={p.slug} href={`/blog/${p.slug}`} style={{ textDecoration: 'none' }}>
                <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7a3815', background: 'var(--brand-light)', padding: '0.15rem 0.55rem', borderRadius: 100, alignSelf: 'flex-start' }}>{p.category}</span>
                  <p style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '0.95rem', margin: 0 }}>{p.title}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', margin: 0 }}>{p.readingTime}</p>
                </div>
              </Link>
            ))}
          </div>
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
