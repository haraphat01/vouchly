'use client'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Plus, Star, MessageSquare, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { useSpaces } from '@/hooks/useSpaces'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Testimonial } from '@/lib/supabase'

function useRecentTestimonials(spaceIds: string[]) {
  return useQuery<Testimonial[]>({
    queryKey: ['testimonials', 'recent', spaceIds.join(',')],
    queryFn: async () => {
      if (spaceIds.length === 0) return []
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .in('space_id', spaceIds)
        .order('created_at', { ascending: false })
        .limit(50)
      return data || []
    },
    enabled: spaceIds.length > 0,
  })
}

export default function DashboardPage() {
  const { data: spaces = [], isLoading: spacesLoading } = useSpaces()
  const spaceIds = spaces.map(s => s.id)
  const { data: testimonials = [], isLoading: testimonialsLoading } = useRecentTestimonials(spaceIds)

  const loading = spacesLoading || (spaceIds.length > 0 && testimonialsLoading)

  const pending = testimonials.filter(t => t.status === 'pending').length
  const approved = testimonials.filter(t => t.status === 'approved').length
  const ratedCount = testimonials.filter(t => t.rating).length
  const avgRating = ratedCount > 0
    ? testimonials.filter(t => t.rating).reduce((a, t) => a + (t.rating || 0), 0) / ratedCount
    : null

  const stats = [
    { label: 'Total testimonials', value: testimonials.length, icon: MessageSquare, color: 'var(--brand)' },
    { label: 'Pending review', value: pending, icon: Clock, color: '#e8963a' },
    { label: 'Published', value: approved, icon: CheckCircle, color: '#2e7d4f' },
    { label: 'Avg. rating', value: avgRating ? avgRating.toFixed(1) : '–', icon: Star, color: '#7c5cbf' },
  ]

  if (loading) {
    return (
      <div className="dash-page">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="dash-page" style={{ maxWidth: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Dashboard</h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem' }}>Welcome back. Here's what's happening.</p>
        </div>
        <Link href="/dashboard/spaces/new" className="btn btn-primary">
          <Plus size={15} /> New Space
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: '0.2rem' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Spaces */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Your spaces</h2>
          <Link href="/dashboard/spaces" style={{ color: 'var(--brand)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <ArrowRight size={13} />
          </Link>
        </div>
        {spaces.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', border: '2px dashed #eceae6', background: 'var(--paper)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏗️</div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Create your first space</h3>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>A space is a branded collection page for one product or service.</p>
            <Link href="/dashboard/spaces/new" className="btn btn-primary">Create a space</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {spaces.slice(0, 6).map(space => (
              <Link key={space.id} href={`/dashboard/spaces/${space.id}`} style={{ textDecoration: 'none' }}>
                <div className="card card-hover" style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: space.theme_color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                      💬
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{space.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{space.slug}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>{space.collect_text && space.collect_video ? 'Text + Video' : space.collect_video ? 'Video' : 'Text'}</span>
                    <span className={`badge ${space.is_active ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: '0.7rem' }}>{space.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent testimonials */}
      {testimonials.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Recent testimonials</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>Showing latest {Math.min(5, testimonials.length)}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {testimonials.slice(0, 5).map(t => (
              <div key={t.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand)', flexShrink: 0 }}>
                  {t.submitter_name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ink)' }}>{t.submitter_name}</span>
                    {t.submitter_role && <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{t.submitter_role}</span>}
                    <span className={`badge ${t.status === 'approved' ? 'badge-green' : t.status === 'archived' ? 'badge-red' : 'badge-amber'}`} style={{ fontSize: '0.68rem' }}>{t.status}</span>
                  </div>
                  {t.content && <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.content}</p>}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-subtle)', flexShrink: 0 }}>{formatDate(t.created_at)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
