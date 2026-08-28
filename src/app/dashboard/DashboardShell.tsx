'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { Quote, LayoutDashboard, MessageSquareQuote, Settings, LogOut, Plus, Zap, Menu, X } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations('dashboard.nav')
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authed, setAuthed] = useState<boolean | null>(null)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth/login'); return }
      setAuthed(true)
    })
  }, [router])

  const { data: profile, isLoading } = useProfile()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navItems = [
    { href: '/dashboard', label: t('overview'), icon: LayoutDashboard },
    { href: '/dashboard/spaces', label: t('spaces'), icon: MessageSquareQuote },
    { href: '/dashboard/settings', label: t('settings'), icon: Settings },
  ]

  if (authed === null || isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, background: 'var(--brand)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', animation: 'pulse 1.5s infinite' }}>
            <Quote size={20} color="white" />
          </div>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>{t('loading')}</p>
        </div>
      </div>
    )
  }

  const Sidebar = ({ onNavClick }: { onNavClick?: () => void }) => (
    <aside style={{ width: 240, background: 'white', borderRight: '1px solid #eceae6', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #eceae6', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 30, height: 30, background: 'var(--brand)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Quote size={15} color="white" />
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)' }}>vouchly</span>
      </div>

      <div style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
        <Link href="/dashboard/spaces/new" className="btn btn-primary" onClick={onNavClick} style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem', fontSize: '0.85rem' }}>
          <Plus size={15} /> {t('new_space')}
        </Link>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link key={href} href={href} onClick={onNavClick} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.55rem 0.85rem', borderRadius: 8, textDecoration: 'none', fontSize: '0.9rem', fontWeight: active ? 600 : 400, color: active ? 'var(--brand)' : 'var(--ink-muted)', background: active ? 'var(--brand-light)' : 'transparent', transition: 'all 0.15s' }}>
                <Icon size={16} /> {label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid #eceae6' }}>
        {profile?.plan === 'free' && (
          <div style={{ background: 'var(--brand-light)', borderRadius: 10, padding: '0.9rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.35rem' }}>
              <Zap size={13} color="var(--brand)" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7a3815' }}>{t('upgrade_title')}</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginBottom: '0.6rem', lineHeight: 1.4 }}>{t('upgrade_desc')}</p>
            <Link href="/dashboard/settings?tab=billing" className="btn btn-primary" onClick={onNavClick} style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem', width: '100%', justifyContent: 'center' }}>{t('upgrade_cta')}</Link>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.5rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand)', flexShrink: 0 }}>
            {profile?.full_name?.split(' ').map(n => n[0]).join('') || profile?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.full_name || t('user_fallback')}</div>
            <div className={`badge badge-${profile?.plan === 'pro' ? 'brand' : profile?.plan === 'starter' ? 'blue' : 'gray'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>{t(`plan_${profile?.plan || 'free'}` as 'plan_free' | 'plan_starter' | 'plan_pro')}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem', padding: '0.45rem 0.5rem' }}>
          <LogOut size={14} /> {t('sign_out')}
        </button>
      </div>
    </aside>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--paper)' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex" style={{ flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Mobile header */}
      <div className="flex md:hidden" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: 'white', borderBottom: '1px solid #eceae6', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'var(--brand)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Quote size={13} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ink)' }}>vouchly</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)', padding: '0.5rem' }}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="md:hidden" style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div onClick={() => setMobileOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, overflowY: 'auto' }}>
            <Sidebar onNavClick={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <main ref={mainRef} className="dashboard-main" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  )
}
