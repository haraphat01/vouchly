'use client'
import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import {
  Users, TrendingUp, MessageSquare, Layout, Clock, CreditCard,
  Video, Search, ChevronUp, ChevronDown, Trash2, ToggleLeft, ToggleRight,
} from 'lucide-react'

type Overview = {
  totalUsers: number
  totalSpaces: number
  totalTestimonials: number
  pendingTestimonials: number
  mrr: number
  planCounts: { free: number; starter: number; pro: number }
  videoTestimonials: number
}

type UserRow = {
  id: string
  email: string
  full_name: string | null
  plan: string
  spaceCount: number
  testimonialCount: number
  pendingCount: number
  hasBilling: boolean
  createdAt: string
}

type SpaceRow = {
  id: string
  name: string
  slug: string
  is_active: boolean
  ownerId: string
  ownerEmail: string
  ownerName: string | null
  testimonialCount: number
  createdAt: string
}

type TestimonialRow = {
  id: string
  space_id: string
  spaceName: string
  spaceSlug: string
  ownerEmail: string
  submitter_name: string
  content: string | null
  type: string
  status: string
  rating: number | null
  createdAt: string
}

type RecentTestimonial = {
  id: string
  space_id: string
  status: string
  type: string
  createdAt: string
  ownerEmail: string
}

type Tab = 'overview' | 'users' | 'spaces' | 'testimonials'
type SortKey = 'email' | 'plan' | 'spaceCount' | 'testimonialCount' | 'createdAt'

const PLAN_COLORS: Record<string, string> = {
  free: '#7a7367',
  starter: '#d4751f',
  pro: '#7c5cbf',
}

const PLAN_BG: Record<string, string> = {
  free: '#f5f5f5',
  starter: '#faecd8',
  pro: '#f0ebfc',
}

const STATUS_COLOR: Record<string, string> = {
  approved: '#2e7d4f',
  pending: '#e8963a',
  archived: '#c0392b',
}

const STATUS_BG: Record<string, string> = {
  approved: '#dcfce7',
  pending: '#fef3c7',
  archived: '#ffe4e4',
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('overview')
  const [overview, setOverview] = useState<Overview | null>(null)
  const [users, setUsers] = useState<UserRow[]>([])
  const [spaces, setSpaces] = useState<SpaceRow[]>([])
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([])
  const [recentTestimonials, setRecentTestimonials] = useState<RecentTestimonial[]>([])

  // Users tab state
  const [userSearch, setUserSearch] = useState('')
  const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'starter' | 'pro'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // Spaces tab state
  const [spaceSearch, setSpaceSearch] = useState('')

  // Testimonials tab state
  const [testSearch, setTestSearch] = useState('')
  const [testStatusFilter, setTestStatusFilter] = useState<'all' | 'pending' | 'approved' | 'archived'>('all')

  // In-flight mutation tracking
  const [busy, setBusy] = useState<Record<string, boolean>>({})

  const loadData = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/stats')
      .then(res => {
        if (!res.ok) return res.json().then(d => { throw new Error(d.error || 'Failed') })
        return res.json()
      })
      .then(data => {
        setOverview(data.overview)
        setUsers(data.users)
        setSpaces(data.spacesList)
        setTestimonials(data.testimonialsList)
        setRecentTestimonials(data.recentTestimonials)
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // ── Mutations ──────────────────────────────────────────────────────────────

  async function patch(body: Record<string, unknown>) {
    const res = await fetch('/api/admin/actions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      throw new Error(d.error || 'Failed')
    }
  }

  async function del(type: string, id: string) {
    const res = await fetch(`/api/admin/actions?type=${type}&id=${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      throw new Error(d.error || 'Failed')
    }
  }

  async function changePlan(userId: string, plan: string) {
    const key = `plan-${userId}`
    setBusy(b => ({ ...b, [key]: true }))
    try {
      await patch({ type: 'user', id: userId, plan })
      setUsers(u => u.map(x => x.id === userId ? { ...x, plan } : x))
      toast.success('Plan updated')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update plan')
    } finally {
      setBusy(b => ({ ...b, [key]: false }))
    }
  }

  async function deleteUser(userId: string, email: string) {
    if (!confirm(`Delete user "${email}" and all their data? This cannot be undone.`)) return
    const key = `del-user-${userId}`
    setBusy(b => ({ ...b, [key]: true }))
    try {
      await del('user', userId)
      setUsers(u => u.filter(x => x.id !== userId))
      toast.success('User deleted')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete user')
    } finally {
      setBusy(b => ({ ...b, [key]: false }))
    }
  }

  async function toggleSpaceActive(spaceId: string, current: boolean) {
    const key = `active-${spaceId}`
    setBusy(b => ({ ...b, [key]: true }))
    try {
      await patch({ type: 'space', id: spaceId, is_active: !current })
      setSpaces(s => s.map(x => x.id === spaceId ? { ...x, is_active: !current } : x))
      toast.success(current ? 'Space deactivated' : 'Space activated')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update space')
    } finally {
      setBusy(b => ({ ...b, [key]: false }))
    }
  }

  async function deleteSpace(spaceId: string, name: string) {
    if (!confirm(`Delete space "${name}" and all its testimonials? This cannot be undone.`)) return
    const key = `del-space-${spaceId}`
    setBusy(b => ({ ...b, [key]: true }))
    try {
      await del('space', spaceId)
      setSpaces(s => s.filter(x => x.id !== spaceId))
      toast.success('Space deleted')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete space')
    } finally {
      setBusy(b => ({ ...b, [key]: false }))
    }
  }

  async function changeTestimonialStatus(testimonialId: string, status: string) {
    const key = `status-${testimonialId}`
    setBusy(b => ({ ...b, [key]: true }))
    try {
      await patch({ type: 'testimonial', id: testimonialId, status })
      setTestimonials(t => t.map(x => x.id === testimonialId ? { ...x, status } : x))
      toast.success('Status updated')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update status')
    } finally {
      setBusy(b => ({ ...b, [key]: false }))
    }
  }

  async function deleteTestimonial(testimonialId: string) {
    if (!confirm('Delete this testimonial? This cannot be undone.')) return
    const key = `del-test-${testimonialId}`
    setBusy(b => ({ ...b, [key]: true }))
    try {
      await del('testimonial', testimonialId)
      setTestimonials(t => t.filter(x => x.id !== testimonialId))
      toast.success('Testimonial deleted')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete testimonial')
    } finally {
      setBusy(b => ({ ...b, [key]: false }))
    }
  }

  // ── Sorting / filtering ────────────────────────────────────────────────────

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const filteredUsers = users
    .filter(u => {
      if (planFilter !== 'all' && u.plan !== planFilter) return false
      if (userSearch) {
        const q = userSearch.toLowerCase()
        return u.email.toLowerCase().includes(q) || (u.full_name || '').toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'email') return mul * a.email.localeCompare(b.email)
      if (sortKey === 'plan') return mul * a.plan.localeCompare(b.plan)
      if (sortKey === 'createdAt') return mul * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      return mul * ((a[sortKey] as number) - (b[sortKey] as number))
    })

  const filteredSpaces = spaces.filter(s => {
    if (!spaceSearch) return true
    const q = spaceSearch.toLowerCase()
    return s.name.toLowerCase().includes(q) || s.ownerEmail.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q)
  })

  const filteredTestimonials = testimonials.filter(t => {
    if (testStatusFilter !== 'all' && t.status !== testStatusFilter) return false
    if (!testSearch) return true
    const q = testSearch.toLowerCase()
    return t.submitter_name.toLowerCase().includes(q) || t.spaceName.toLowerCase().includes(q) || t.ownerEmail.toLowerCase().includes(q)
  })

  // ── Sub-components ─────────────────────────────────────────────────────────

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span style={{ opacity: 0.3, fontSize: 12 }}>↕</span>
    return sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
  }

  // ── Render guards ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fdf8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔐</div>
          <div style={{ color: '#7a7367' }}>Loading admin panel…</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#fdf8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', background: 'white', borderRadius: 16, padding: '48px 64px', border: '1px solid #eceae6' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1713', marginBottom: 8 }}>{error}</div>
          <div style={{ color: '#7a7367' }}>You need admin access to view this page.</div>
        </div>
      </div>
    )
  }

  const arr = overview!

  const STAT_CARDS = [
    { label: 'Total users', value: arr.totalUsers, icon: <Users size={20} />, color: '#1a5fa8', bg: '#dbeafe' },
    { label: 'MRR', value: `$${arr.mrr.toLocaleString()}`, icon: <TrendingUp size={20} />, color: '#2e7d4f', bg: '#dcfce7' },
    { label: 'Total testimonials', value: arr.totalTestimonials, icon: <MessageSquare size={20} />, color: '#d4751f', bg: '#faecd8' },
    { label: 'Pending review', value: arr.pendingTestimonials, icon: <Clock size={20} />, color: '#e8963a', bg: '#fef3c7' },
    { label: 'Total spaces', value: arr.totalSpaces, icon: <Layout size={20} />, color: '#7c5cbf', bg: '#f0ebfc' },
    { label: 'Video testimonials', value: arr.videoTestimonials, icon: <Video size={20} />, color: '#1a7a7a', bg: '#ccfbf1' },
  ]

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users', count: users.length },
    { id: 'spaces', label: 'Spaces', count: spaces.length },
    { id: 'testimonials', label: 'Testimonials', count: testimonials.length },
  ]

  // ── Layout ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: '#fdf8f0', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#1a1713', padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: '#d4751f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💬</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'white' }}>vouchly admin</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Internal dashboard</div>
          </div>
        </div>
        <a href="/dashboard" style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>← Back to dashboard</a>
      </div>

      {/* Tab bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #eceae6', padding: '0 48px' }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '16px 24px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600,
              color: tab === t.id ? '#d4751f' : '#7a7367',
              borderBottom: tab === t.id ? '2px solid #d4751f' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {t.label}
              {t.count !== undefined && (
                <span style={{ fontSize: 11, fontWeight: 700, background: tab === t.id ? '#faecd8' : '#f0ede8', color: tab === t.id ? '#d4751f' : '#7a7367', padding: '2px 7px', borderRadius: 100 }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 48px' }}>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 40 }}>
              {STAT_CARDS.map(({ label, value, icon, color, bg }) => (
                <div key={label} style={{ background: 'white', borderRadius: 14, padding: '20px 22px', border: '1px solid #eceae6' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: 12 }}>
                    {icon}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1713', marginBottom: 4 }}>{value}</div>
                  <div style={{ fontSize: 13, color: '#7a7367' }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 24 }}>
              {/* Plan breakdown */}
              <div style={{ background: 'white', borderRadius: 16, padding: '28px 32px', border: '1px solid #eceae6' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1713', marginBottom: 24 }}>Plan breakdown</h2>
                {(['free', 'starter', 'pro'] as const).map(plan => {
                  const count = arr.planCounts[plan]
                  const pct = arr.totalUsers > 0 ? Math.round((count / arr.totalUsers) * 100) : 0
                  return (
                    <div key={plan} style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, background: PLAN_BG[plan], color: PLAN_COLORS[plan], padding: '3px 10px', borderRadius: 100, textTransform: 'capitalize' }}>{plan}</span>
                          <span style={{ fontSize: 13, color: '#7a7367' }}>{count} users</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1713' }}>{pct}%</span>
                      </div>
                      <div style={{ height: 8, background: '#f5f5f5', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: PLAN_COLORS[plan], borderRadius: 99 }} />
                      </div>
                    </div>
                  )
                })}
                <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #f0ede8' }}>
                  <div style={{ fontSize: 13, color: '#7a7367', marginBottom: 6 }}>Paid users</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#2e7d4f' }}>
                    {arr.planCounts.starter + arr.planCounts.pro}
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#7a7367', marginLeft: 8 }}>
                      ({arr.totalUsers > 0 ? Math.round(((arr.planCounts.starter + arr.planCounts.pro) / arr.totalUsers) * 100) : 0}% conversion)
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent testimonials */}
              <div style={{ background: 'white', borderRadius: 16, padding: '28px 32px', border: '1px solid #eceae6' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1713', marginBottom: 20 }}>Recent testimonials</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {recentTestimonials.length === 0 && <div style={{ color: '#7a7367', fontSize: 14 }}>No testimonials yet.</div>}
                  {recentTestimonials.map(t => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#fdf8f0', borderRadius: 10, border: '1px solid #eceae6' }}>
                      <span style={{ fontSize: 16 }}>{t.type === 'video' ? '🎥' : '💬'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1713', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.ownerEmail}</div>
                        <div style={{ fontSize: 12, color: '#7a7367' }}>{formatDate(t.createdAt)}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: STATUS_BG[t.status] || '#f5f5f5', color: STATUS_COLOR[t.status] || '#7a7367', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #eceae6', overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #eceae6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1713', margin: 0 }}>
                Users <span style={{ fontSize: 13, fontWeight: 500, color: '#7a7367' }}>({filteredUsers.length})</span>
              </h2>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['all', 'free', 'starter', 'pro'] as const).map(p => (
                    <button key={p} onClick={() => setPlanFilter(p)} style={{
                      padding: '6px 14px', borderRadius: 8, border: '1px solid #eceae6', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      background: planFilter === p ? '#1a1713' : 'white',
                      color: planFilter === p ? 'white' : '#7a7367',
                      textTransform: 'capitalize',
                    }}>{p}</button>
                  ))}
                </div>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#7a7367' }} />
                  <input
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search users…"
                    style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: '1px solid #eceae6', borderRadius: 9, fontSize: 13, outline: 'none', width: 220 }}
                  />
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fdf8f0' }}>
                    {([
                      { label: 'User', key: 'email' },
                      { label: 'Plan', key: 'plan' },
                      { label: 'Spaces', key: 'spaceCount' },
                      { label: 'Testimonials', key: 'testimonialCount' },
                      { label: 'Billing', key: null },
                      { label: 'Joined', key: 'createdAt' },
                      { label: 'Actions', key: null },
                    ] as { label: string; key: string | null }[]).map(({ label, key }) => (
                      <th key={label}
                        onClick={() => key && toggleSort(key as SortKey)}
                        style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#7a7367', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: key ? 'pointer' : 'default', whiteSpace: 'nowrap', userSelect: 'none' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {label} {key && <SortIcon k={key as SortKey} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#7a7367', fontSize: 14 }}>No users found.</td></tr>
                  )}
                  {filteredUsers.map((u, i) => (
                    <tr key={u.id} style={{ borderTop: '1px solid #f0ede8', background: i % 2 === 0 ? 'white' : '#fdf8f0' }}>
                      {/* User */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: PLAN_BG[u.plan] || '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: PLAN_COLORS[u.plan] || '#7a7367', flexShrink: 0 }}>
                            {(u.full_name || u.email)[0].toUpperCase()}
                          </div>
                          <div>
                            {u.full_name && <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1713' }}>{u.full_name}</div>}
                            <div style={{ fontSize: 13, color: '#7a7367' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      {/* Plan */}
                      <td style={{ padding: '14px 20px' }}>
                        <select
                          value={u.plan}
                          disabled={busy[`plan-${u.id}`]}
                          onChange={e => changePlan(u.id, e.target.value)}
                          style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #eceae6', fontSize: 13, fontWeight: 600, background: PLAN_BG[u.plan] || '#f5f5f5', color: PLAN_COLORS[u.plan] || '#7a7367', cursor: 'pointer', outline: 'none' }}
                        >
                          <option value="free">Free</option>
                          <option value="starter">Starter</option>
                          <option value="pro">Pro</option>
                        </select>
                      </td>
                      {/* Spaces */}
                      <td style={{ padding: '14px 20px', fontSize: 14, color: '#1a1713', fontWeight: 600 }}>{u.spaceCount}</td>
                      {/* Testimonials */}
                      <td style={{ padding: '14px 20px', fontSize: 14, color: '#1a1713', fontWeight: 600 }}>{u.testimonialCount}</td>
                      {/* Billing */}
                      <td style={{ padding: '14px 20px' }}>
                        {u.hasBilling ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#2e7d4f', background: '#dcfce7', padding: '3px 9px', borderRadius: 100 }}>
                            <CreditCard size={11} /> Active
                          </span>
                        ) : <span style={{ fontSize: 13, color: '#b8b3a8' }}>—</span>}
                      </td>
                      {/* Joined */}
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#7a7367', whiteSpace: 'nowrap' }}>{formatDate(u.createdAt)}</td>
                      {/* Actions */}
                      <td style={{ padding: '14px 20px' }}>
                        <button
                          onClick={() => deleteUser(u.id, u.email)}
                          disabled={busy[`del-user-${u.id}`]}
                          title="Delete user"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #ffd4d4', background: '#fff5f5', color: '#c0392b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SPACES TAB ── */}
        {tab === 'spaces' && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #eceae6', overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #eceae6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1713', margin: 0 }}>
                Spaces <span style={{ fontSize: 13, fontWeight: 500, color: '#7a7367' }}>({filteredSpaces.length})</span>
              </h2>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#7a7367' }} />
                <input
                  value={spaceSearch}
                  onChange={e => setSpaceSearch(e.target.value)}
                  placeholder="Search spaces…"
                  style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: '1px solid #eceae6', borderRadius: 9, fontSize: 13, outline: 'none', width: 240 }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fdf8f0' }}>
                    {['Space', 'Owner', 'Testimonials', 'Status', 'Created', 'Actions'].map(label => (
                      <th key={label} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#7a7367', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSpaces.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#7a7367', fontSize: 14 }}>No spaces found.</td></tr>
                  )}
                  {filteredSpaces.map((s, i) => (
                    <tr key={s.id} style={{ borderTop: '1px solid #f0ede8', background: i % 2 === 0 ? 'white' : '#fdf8f0' }}>
                      {/* Space */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1713' }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: '#7a7367' }}>/{s.slug}</div>
                      </td>
                      {/* Owner */}
                      <td style={{ padding: '14px 20px' }}>
                        {s.ownerName && <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1713' }}>{s.ownerName}</div>}
                        <div style={{ fontSize: 13, color: '#7a7367' }}>{s.ownerEmail}</div>
                      </td>
                      {/* Testimonials */}
                      <td style={{ padding: '14px 20px', fontSize: 14, color: '#1a1713', fontWeight: 600 }}>{s.testimonialCount}</td>
                      {/* Status */}
                      <td style={{ padding: '14px 20px' }}>
                        <button
                          onClick={() => toggleSpaceActive(s.id, s.is_active)}
                          disabled={busy[`active-${s.id}`]}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: s.is_active ? '#dcfce7' : '#f0ede8', color: s.is_active ? '#2e7d4f' : '#7a7367' }}
                        >
                          {s.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                          {s.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      {/* Created */}
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#7a7367', whiteSpace: 'nowrap' }}>{formatDate(s.createdAt)}</td>
                      {/* Actions */}
                      <td style={{ padding: '14px 20px' }}>
                        <button
                          onClick={() => deleteSpace(s.id, s.name)}
                          disabled={busy[`del-space-${s.id}`]}
                          title="Delete space"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #ffd4d4', background: '#fff5f5', color: '#c0392b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TESTIMONIALS TAB ── */}
        {tab === 'testimonials' && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #eceae6', overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #eceae6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1713', margin: 0 }}>
                Testimonials <span style={{ fontSize: 13, fontWeight: 500, color: '#7a7367' }}>({filteredTestimonials.length})</span>
              </h2>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['all', 'pending', 'approved', 'archived'] as const).map(s => (
                    <button key={s} onClick={() => setTestStatusFilter(s)} style={{
                      padding: '6px 14px', borderRadius: 8, border: '1px solid #eceae6', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      background: testStatusFilter === s ? '#1a1713' : 'white',
                      color: testStatusFilter === s ? 'white' : '#7a7367',
                      textTransform: 'capitalize',
                    }}>{s}</button>
                  ))}
                </div>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#7a7367' }} />
                  <input
                    value={testSearch}
                    onChange={e => setTestSearch(e.target.value)}
                    placeholder="Search testimonials…"
                    style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: '1px solid #eceae6', borderRadius: 9, fontSize: 13, outline: 'none', width: 240 }}
                  />
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fdf8f0' }}>
                    {['Submitter', 'Space', 'Content', 'Type', 'Rating', 'Status', 'Date', 'Actions'].map(label => (
                      <th key={label} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#7a7367', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTestimonials.length === 0 && (
                    <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#7a7367', fontSize: 14 }}>No testimonials found.</td></tr>
                  )}
                  {filteredTestimonials.map((t, i) => (
                    <tr key={t.id} style={{ borderTop: '1px solid #f0ede8', background: i % 2 === 0 ? 'white' : '#fdf8f0' }}>
                      {/* Submitter */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1713' }}>{t.submitter_name}</div>
                        <div style={{ fontSize: 12, color: '#7a7367' }}>{t.ownerEmail}</div>
                      </td>
                      {/* Space */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1713' }}>{t.spaceName}</div>
                        <div style={{ fontSize: 12, color: '#7a7367' }}>/{t.spaceSlug}</div>
                      </td>
                      {/* Content */}
                      <td style={{ padding: '14px 20px', maxWidth: 260 }}>
                        {t.content ? (
                          <div style={{ fontSize: 13, color: '#1a1713', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {t.content}
                          </div>
                        ) : (
                          <span style={{ fontSize: 13, color: '#b8b3a8' }}>Video</span>
                        )}
                      </td>
                      {/* Type */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: 16 }}>{t.type === 'video' ? '🎥' : '💬'}</span>
                      </td>
                      {/* Rating */}
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#7a7367' }}>
                        {t.rating ? `${'★'.repeat(t.rating)}` : '—'}
                      </td>
                      {/* Status */}
                      <td style={{ padding: '14px 20px' }}>
                        <select
                          value={t.status}
                          disabled={busy[`status-${t.id}`]}
                          onChange={e => changeTestimonialStatus(t.id, e.target.value)}
                          style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #eceae6', fontSize: 12, fontWeight: 700, background: STATUS_BG[t.status] || '#f5f5f5', color: STATUS_COLOR[t.status] || '#7a7367', cursor: 'pointer', outline: 'none', textTransform: 'capitalize' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      {/* Date */}
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#7a7367', whiteSpace: 'nowrap' }}>{formatDate(t.createdAt)}</td>
                      {/* Actions */}
                      <td style={{ padding: '14px 20px' }}>
                        <button
                          onClick={() => deleteTestimonial(t.id)}
                          disabled={busy[`del-test-${t.id}`]}
                          title="Delete testimonial"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #ffd4d4', background: '#fff5f5', color: '#c0392b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
