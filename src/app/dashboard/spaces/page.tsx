'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Plus, ExternalLink, Copy, Trash2, Edit } from 'lucide-react'
import { toast } from 'sonner'
import { calculateProofScore, type ScoredTestimonial } from '@/lib/proofScore'
import { ProofGradeIcon } from '@/components/ProofScoreIcons'
import { useSpaces } from '@/hooks/useSpaces'
import { useQuery, useQueryClient } from '@tanstack/react-query'

async function fetchAllSpaceScores(spaceIds: string[]) {
  if (spaceIds.length === 0) return {}
  const { data: te } = await supabase
    .from('testimonials')
    .select('space_id, status, rating, type, submitter_role, submitter_company, content, created_at')
    .in('space_id', spaceIds)
  if (!te) return {}
  const bySpace: Record<string, ScoredTestimonial[]> = {}
  for (const t of te) {
    bySpace[t.space_id] = bySpace[t.space_id] ?? []
    bySpace[t.space_id].push(t as ScoredTestimonial)
  }
  const scores: Record<string, ReturnType<typeof calculateProofScore>> = {}
  for (const id of spaceIds) scores[id] = calculateProofScore(bySpace[id] ?? [])
  return scores
}

export default function SpacesPage() {
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState<string | null>(null)

  const { data: spaces = [], isLoading } = useSpaces()

  const { data: spaceScores = {} } = useQuery({
    queryKey: ['space-scores', spaces.map(s => s.id).join(',')],
    queryFn: () => fetchAllSpaceScores(spaces.map(s => s.id)),
    enabled: spaces.length > 0,
  })

  async function deleteSpace(id: string, name: string) {
    const previous = spaces
    queryClient.setQueryData(['spaces'], spaces.filter(s => s.id !== id))

    async function commitDelete() {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch(`/api/spaces?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
      })
      queryClient.invalidateQueries({ queryKey: ['spaces'] })
    }

    toast(`"${name}" deleted`, {
      description: 'Space and all its testimonials have been removed.',
      action: { label: 'Undo', onClick: () => queryClient.setQueryData(['spaces'], previous) },
      duration: 5000,
      onDismiss: commitDelete,
      onAutoClose: commitDelete,
    })
  }

  function copyLink(slug: string) {
    navigator.clipboard.writeText(`${window.location.origin}/collect/${slug}`)
    setCopied(slug)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="dash-page" style={{ maxWidth: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Spaces</h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem' }}>Each space is a branded collection page for one product or service.</p>
        </div>
        <Link href="/dashboard/spaces/new" className="btn btn-primary">
          <Plus size={15} /> New Space
        </Link>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 90 }} />)}
        </div>
      ) : spaces.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem', border: '2px dashed #eceae6', background: 'var(--paper)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No spaces yet</h3>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem', maxWidth: 360, margin: '0 auto 1.5rem' }}>Create your first space to start collecting testimonials from your customers.</p>
          <Link href="/dashboard/spaces/new" className="btn btn-primary">Create your first space</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {spaces.map(space => (
            <div key={space.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: (space.theme_color || '#d4751f') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>💬</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--ink)' }}>{space.name}</span>
                  <span className={`badge ${space.is_active ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: '0.68rem' }}>{space.is_active ? 'Active' : 'Inactive'}</span>
                  {spaceScores[space.id] && (() => {
                    const ps = spaceScores[space.id]
                    return (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', fontWeight: 700, color: ps.color, background: ps.color + '18', padding: '0.15rem 0.55rem', borderRadius: 100 }}>
                        <ProofGradeIcon name={ps.gradeIcon} size={12} color={ps.color} />
                        {ps.total}
                      </span>
                    )
                  })()}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: '0.2rem', wordBreak: 'break-all' }}>
                  /collect/<strong>{space.slug}</strong> · {formatDate(space.created_at)}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                  <button onClick={() => copyLink(space.slug)} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
                    <Copy size={13} /> {copied === space.slug ? 'Copied!' : 'Copy link'}
                  </button>
                  <Link href={`/collect/${space.slug}`} target="_blank" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
                    <ExternalLink size={13} /> Preview
                  </Link>
                  <Link href={`/dashboard/spaces/${space.id}`} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
                    <Edit size={13} /> Manage
                  </Link>
                  <button onClick={() => deleteSpace(space.id, space.name)} className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', color: '#c0392b' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
