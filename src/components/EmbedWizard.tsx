'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { X, ArrowLeft, Copy, Mail, Download, Globe, CheckCircle2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface EmbedWizardProps {
  open: boolean
  onClose: () => void
  embedCode: string
  spaceSlug: string
}

interface PlatformMeta {
  id: string
  icon: string
  color: string
  hasPlugin?: boolean
}

const PLATFORMS: PlatformMeta[] = [
  { id: 'wordpress', icon: '🔵', color: '#0073aa', hasPlugin: true },
  { id: 'shopify', icon: '🟢', color: '#96bf48' },
  { id: 'wix', icon: '⚫', color: '#1c1c1c' },
  { id: 'squarespace', icon: '⬛', color: '#222222' },
  { id: 'webflow', icon: '🔷', color: '#4353ff' },
  { id: 'framer', icon: '🟣', color: '#0055ff' },
  { id: 'html', icon: '🌐', color: '#e44d26' },
]

function CodeBlock({ code, onCopy, copied }: { code: string; onCopy: () => void; copied: boolean }) {
  const t = useTranslations('dashboard.embed_wizard')
  return (
    <div style={{ background: '#1a1713', borderRadius: 8, padding: '0.85rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
      <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#faecd8', flex: 1, wordBreak: 'break-all', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
        {code}
      </code>
      <button
        onClick={onCopy}
        className="btn btn-ghost"
        style={{ color: '#faecd8', padding: '0.25rem 0.5rem', flexShrink: 0, fontSize: '0.75rem', border: '1px solid #3d3a35' }}
      >
        {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
        {copied ? t('copied') : t('copy')}
      </button>
    </div>
  )
}

export default function EmbedWizard({ open, onClose, embedCode, spaceSlug }: EmbedWizardProps) {
  const t = useTranslations('dashboard.embed_wizard')
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformMeta | null>(null)
  const [copied, setCopied] = useState('')
  const [testUrl, setTestUrl] = useState('')
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'found' | 'not_found' | 'error'>('idle')
  const [testError, setTestError] = useState('')

  if (!open) return null

  function handleClose() {
    setSelectedPlatform(null)
    setTestUrl('')
    setTestStatus('idle')
    setTestError('')
    onClose()
  }

  function copyCode(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  function buildMailto() {
    const subject = encodeURIComponent('Adding Vouchly testimonials to our website')
    const body = encodeURIComponent(
      `Hi,\n\nCould you add our Vouchly testimonial widget to the website?\n\n`
      + `Please paste this one line of code just before the closing </body> tag on the relevant page(s):\n\n`
      + `${embedCode}\n\n`
      + `That's all it takes — no configuration needed. The testimonials will load automatically.\n\n`
      + `You can preview what it looks like here: https://vouchly.tech/wall/${spaceSlug}\n\n`
      + `Thanks!`
    )
    return `mailto:?subject=${subject}&body=${body}`
  }

  async function runDetection() {
    if (!testUrl.trim()) return
    setTestStatus('loading')
    setTestError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/embed/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ url: testUrl.trim(), slug: spaceSlug }),
      })
      const data = await res.json()
      if (!res.ok) {
        setTestStatus('error')
        setTestError(data.error || t('error_generic'))
        return
      }
      if (data.error) {
        setTestStatus('error')
        setTestError(data.error)
        return
      }
      setTestStatus(data.found ? 'found' : 'not_found')
    } catch {
      setTestStatus('error')
      setTestError(t('error_connection'))
    }
  }

  return (
    /* Overlay */
    <div
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Panel */}
      <div style={{
        background: 'white', borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: 640,
        maxHeight: 'calc(100vh - 2rem)', overflowY: 'auto',
        boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem', borderBottom: '1px solid #eceae6',
          position: 'sticky', top: 0, background: 'white', zIndex: 1, borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {selectedPlatform && (
              <button
                onClick={() => { setSelectedPlatform(null); setTestStatus('idle'); setTestError('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', padding: '0.25rem', display: 'flex' }}
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                {selectedPlatform ? t('title_platform', { name: t(`platforms.${selectedPlatform.id}.name` as 'platforms.wordpress.name') }) : t('title_default')}
              </h2>
              {!selectedPlatform && (
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', margin: '0.2rem 0 0' }}>
                  {t('subtitle')}
                </p>
              )}
            </div>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', padding: '0.25rem', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>

          {/* ── Platform picker ── */}
          {!selectedPlatform && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlatform(p)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: '0.5rem', padding: '1.1rem 0.75rem',
                      background: 'white', border: '1.5px solid #eceae6',
                      borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                      transition: 'all 0.15s', textAlign: 'center',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget
                      el.style.borderColor = p.color
                      el.style.background = p.color + '10'
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget
                      el.style.borderColor = '#eceae6'
                      el.style.background = 'white'
                    }}
                  >
                    <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{p.icon}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>{t(`platforms.${p.id}.name` as 'platforms.wordpress.name')}</span>
                    {p.hasPlugin && (
                      <span style={{ fontSize: '0.68rem', background: 'var(--brand-light)', color: 'var(--brand)', padding: '0.1rem 0.45rem', borderRadius: 100, fontWeight: 700 }}>
                        {t('plugin_badge')}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Email to developer */}
              <div style={{ borderTop: '1px solid #eceae6', paddingTop: '1.25rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '0.75rem' }}>
                  {t('not_technical')}
                </p>
                <a
                  href={buildMailto()}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  <Mail size={14} /> {t('email_developer')}
                </a>
              </div>
            </>
          )}

          {/* ── Platform steps ── */}
          {selectedPlatform && (
            <>
              {/* WordPress plugin download banner */}
              {selectedPlatform.hasPlugin && (
                <div style={{
                  background: 'var(--brand-light)', border: '1px solid #f0d4a8',
                  borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)', marginBottom: '0.2rem' }}>
                      {t('free_plugin_title')}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                      {t('free_plugin_desc')}
                    </div>
                  </div>
                  <a
                    href="/api/plugin/download"
                    download="vouchly.php"
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <Download size={14} /> {t('download_plugin')}
                  </a>
                </div>
              )}

              {/* Steps */}
              <ol style={{ margin: '0 0 1.5rem', padding: '0 0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(t.raw(`platforms.${selectedPlatform.id}.steps` as 'platforms.wordpress.steps') as string[]).map((step, i) => {
                  const isCodeStep = step === '{{EMBED_CODE}}'
                  if (isCodeStep) {
                    return (
                      <li key={i} style={{ listStyle: 'none', marginLeft: '-1.25rem' }}>
                        <CodeBlock
                          code={embedCode}
                          onCopy={() => copyCode(embedCode, 'embed')}
                          copied={copied === 'embed'}
                        />
                      </li>
                    )
                  }
                  const html = step
                    .replace(/{{SLUG}}/g, `<strong>${spaceSlug}</strong>`)
                  return (
                    <li key={i} style={{ fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.7 }}
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  )
                })}
              </ol>

              {/* Test detection */}
              <div style={{ borderTop: '1px solid #eceae6', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.5rem' }}>
                  <Globe size={14} color="var(--ink-muted)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>{t('test_working_title')}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.75rem' }}>
                  {t('test_working_desc')}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input
                    className="input"
                    value={testUrl}
                    onChange={(e) => { setTestUrl(e.target.value); setTestStatus('idle') }}
                    placeholder={t('url_placeholder')}
                    style={{ flex: '1 1 200px', fontSize: '0.875rem' }}
                    onKeyDown={(e) => e.key === 'Enter' && runDetection()}
                  />
                  <button
                    onClick={runDetection}
                    className="btn btn-secondary"
                    disabled={testStatus === 'loading' || !testUrl.trim()}
                    style={{ fontSize: '0.85rem' }}
                  >
                    {testStatus === 'loading'
                      ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> {t('checking')}</>
                      : t('test_now')}
                  </button>
                </div>

                {testStatus === 'found' && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: 6, background: '#eafaf1', border: '1px solid #a9dfbf', borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: '0.85rem', color: '#1e8449' }}>
                    <CheckCircle2 size={15} /> {t('found_msg')}
                  </div>
                )}
                {testStatus === 'not_found' && (
                  <div style={{ marginTop: '0.75rem', background: '#fef9e7', border: '1px solid #f9e79f', borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: '0.85rem', color: '#7d6608' }}>
                    ⚠️ {t('not_found_msg')}
                  </div>
                )}
                {testStatus === 'error' && (
                  <div style={{ marginTop: '0.75rem', background: '#ffe4e4', border: '1px solid #f5c6c6', borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: '0.85rem', color: '#c0392b' }}>
                    {testError}
                  </div>
                )}
              </div>

              {/* Email fallback */}
              <div style={{ borderTop: '1px solid #eceae6', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
                <a href={buildMailto()} className="btn btn-ghost" style={{ fontSize: '0.82rem' }}>
                  <Mail size={13} /> {t('email_developer_footer')}
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
