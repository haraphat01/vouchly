'use client'
import { useState } from 'react'
import { X, ArrowLeft, Copy, Mail, Download, Globe, CheckCircle2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface EmbedWizardProps {
  open: boolean
  onClose: () => void
  embedCode: string
  spaceSlug: string
}

interface Platform {
  id: string
  name: string
  icon: string
  color: string
  steps: string[]
  hasPlugin?: boolean
}

const PLATFORMS: Platform[] = [
  {
    id: 'wordpress',
    name: 'WordPress',
    icon: '🔵',
    color: '#0073aa',
    hasPlugin: true,
    steps: [
      'Download the free Vouchly plugin using the button below.',
      'In your WordPress admin, go to <strong>Plugins → Add New → Upload Plugin</strong>.',
      'Choose the downloaded <code>vouchly.php</code> file and click <strong>Install Now</strong>, then <strong>Activate</strong>.',
      'Go to <strong>Settings → Vouchly</strong> and enter your space slug: <code>{{SLUG}}</code>.',
      'On any page or post, add the shortcode <code>[vouchly]</code> where you want the testimonials to appear.',
      'Save and preview the page — your testimonial wall will load automatically.',
    ],
  },
  {
    id: 'shopify',
    name: 'Shopify',
    icon: '🟢',
    color: '#96bf48',
    steps: [
      'In your Shopify admin, go to <strong>Online Store → Themes</strong>.',
      'Click <strong>Actions → Edit code</strong> on your active theme.',
      'Open the template file where you want testimonials to appear (e.g. <code>sections/main-page.liquid</code> or <code>layout/theme.liquid</code> for site-wide).',
      'Paste the embed code just before the closing <code>&lt;/body&gt;</code> tag (or inside the section where you want it to appear):',
      '{{EMBED_CODE}}',
      'Click <strong>Save</strong>. Your testimonials will appear on the next page load.',
    ],
  },
  {
    id: 'wix',
    name: 'Wix',
    icon: '⚫',
    color: '#1c1c1c',
    steps: [
      'In the Wix Editor, click <strong>Add Elements (+)</strong> in the left sidebar.',
      'Select <strong>Embed Code → Embed HTML</strong> and drag it onto your page.',
      'Click the HTML block, then click <strong>Enter Code</strong>.',
      'Paste the embed code below into the editor:',
      '{{EMBED_CODE}}',
      'Click <strong>Apply</strong>, then <strong>Publish</strong> your site. The testimonial wall will appear where you placed the block.',
    ],
  },
  {
    id: 'squarespace',
    name: 'Squarespace',
    icon: '⬛',
    color: '#222222',
    steps: [
      'Open the page you want to add testimonials to in the Squarespace editor.',
      'Click the <strong>(+)</strong> button to add a new block, then choose <strong>Code</strong>.',
      'In the code block editor, make sure <strong>HTML</strong> is selected (not Markdown).',
      'Paste the embed code below:',
      '{{EMBED_CODE}}',
      'Click <strong>Apply</strong> then <strong>Save</strong>. Testimonials will appear where you placed the block. Note: Code blocks require a Business plan or higher.',
    ],
  },
  {
    id: 'webflow',
    name: 'Webflow',
    icon: '🔷',
    color: '#4353ff',
    steps: [
      'In the Webflow Designer, drag an <strong>Embed</strong> element from the Add panel onto your canvas.',
      'Double-click the Embed element to open the code editor.',
      'Paste the embed code below:',
      '{{EMBED_CODE}}',
      'Click <strong>Save & Close</strong>, then <strong>Publish</strong> your site.',
    ],
  },
  {
    id: 'framer',
    name: 'Framer',
    icon: '🟣',
    color: '#0055ff',
    steps: [
      'In Framer, add a new <strong>Embed</strong> component from the insert menu (or press <kbd>E</kbd>).',
      'Click the Embed component and select <strong>HTML</strong> from the embed type dropdown.',
      'Paste the embed code below into the HTML field:',
      '{{EMBED_CODE}}',
      'Resize and position the component as needed, then click <strong>Publish</strong>.',
    ],
  },
  {
    id: 'html',
    name: 'HTML / Other',
    icon: '🌐',
    color: '#e44d26',
    steps: [
      'Open the HTML file of the page where you want testimonials to appear.',
      'Paste the embed code below just before the closing <code>&lt;/body&gt;</code> tag:',
      '{{EMBED_CODE}}',
      'Save the file and upload it to your server (or redeploy your site). The testimonial wall will load automatically.',
    ],
  },
]

function CodeBlock({ code, onCopy, copied }: { code: string; onCopy: () => void; copied: boolean }) {
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
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

export default function EmbedWizard({ open, onClose, embedCode, spaceSlug }: EmbedWizardProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
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
        setTestError(data.error || 'Something went wrong.')
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
      setTestError('Could not connect. Check your internet connection.')
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
                {selectedPlatform ? `Install on ${selectedPlatform.name}` : 'Add to your website'}
              </h2>
              {!selectedPlatform && (
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', margin: '0.2rem 0 0' }}>
                  Choose your platform for step-by-step instructions
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
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>{p.name}</span>
                    {p.hasPlugin && (
                      <span style={{ fontSize: '0.68rem', background: 'var(--brand-light)', color: 'var(--brand)', padding: '0.1rem 0.45rem', borderRadius: 100, fontWeight: 700 }}>
                        Plugin
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Email to developer */}
              <div style={{ borderTop: '1px solid #eceae6', paddingTop: '1.25rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '0.75rem' }}>
                  Not technical? Forward the instructions directly to your developer.
                </p>
                <a
                  href={buildMailto()}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  <Mail size={14} /> Email to my developer
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
                      Free WordPress Plugin
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                      Install in 60 seconds — no code needed
                    </div>
                  </div>
                  <a
                    href="/api/plugin/download"
                    download="vouchly.php"
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <Download size={14} /> Download Plugin
                  </a>
                </div>
              )}

              {/* Steps */}
              <ol style={{ margin: '0 0 1.5rem', padding: '0 0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {selectedPlatform.steps.map((step, i) => {
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
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>Test if it&apos;s working</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.75rem' }}>
                  After installing, enter your site URL and we&apos;ll check if the embed script is detected.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input
                    className="input"
                    value={testUrl}
                    onChange={(e) => { setTestUrl(e.target.value); setTestStatus('idle') }}
                    placeholder="https://yourwebsite.com"
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
                      ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Checking…</>
                      : 'Test now'}
                  </button>
                </div>

                {testStatus === 'found' && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: 6, background: '#eafaf1', border: '1px solid #a9dfbf', borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: '0.85rem', color: '#1e8449' }}>
                    <CheckCircle2 size={15} /> Script detected — your testimonial wall is live!
                  </div>
                )}
                {testStatus === 'not_found' && (
                  <div style={{ marginTop: '0.75rem', background: '#fef9e7', border: '1px solid #f9e79f', borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: '0.85rem', color: '#7d6608' }}>
                    ⚠️ Script not detected yet. Make sure you saved and published your changes, then try again.
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
                  <Mail size={13} /> Email these instructions to my developer
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
