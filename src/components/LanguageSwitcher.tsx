'use client'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

const LOCALES = [
  { code: 'en', flag: '🇺🇸', name: 'English' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
]

export default function LanguageSwitcher({ style }: { style?: React.CSSProperties }) {
  const locale = useLocale()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function switchLocale(code: string) {
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; samesite=lax`
    setOpen(false)
    router.refresh()
  }

  const current = LOCALES.find(l => l.code === locale) ?? LOCALES[0]

  return (
    <div ref={ref} style={{ position: 'relative', ...style }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'none', border: '1px solid #eceae6',
          borderRadius: 8, padding: '0.35rem 0.7rem',
          cursor: 'pointer', fontSize: '0.82rem',
          color: 'var(--ink-muted)', fontFamily: 'inherit',
          transition: 'border-color 0.15s',
        }}
        aria-label="Switch language"
      >
        {current.flag} {current.code.toUpperCase()}
        <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: 'white', border: '1px solid #eceae6',
          borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.09)',
          overflow: 'hidden', zIndex: 200, minWidth: 140,
        }}>
          {LOCALES.map(l => (
            <button
              key={l.code}
              onClick={() => switchLocale(l.code)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                width: '100%', padding: '0.6rem 1rem',
                background: l.code === locale ? 'var(--brand-light)' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                fontSize: '0.85rem', fontFamily: 'inherit',
                color: l.code === locale ? 'var(--brand)' : 'var(--ink)',
                fontWeight: l.code === locale ? 600 : 400,
              }}
            >
              {l.flag} {l.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
