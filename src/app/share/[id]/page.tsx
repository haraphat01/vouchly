import { supabaseAdmin } from '@/lib/supabase'
import type { Metadata } from 'next'
import ShareClient from './ShareClient'

type Props = { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: t } = await supabaseAdmin
    .from('testimonials')
    .select('*, spaces(name, theme_color, slug)')
    .eq('id', params.id)
    .eq('status', 'approved')
    .single()

  if (!t) return { title: 'Testimonial | vouchly' }

  const space = t.spaces as { name: string; theme_color: string; slug: string } | null
  const content = t.ai_enhanced_content || t.content || ''
  const excerpt = content.length > 200 ? content.slice(0, 197) + '…' : content
  const title = `"${excerpt.slice(0, 60)}${excerpt.length > 60 ? '…' : ''}" — ${t.submitter_name}`
  const description = `${t.submitter_name}${t.submitter_role ? `, ${t.submitter_role}` : ''} left a testimonial for ${space?.name || 'vouchly'}`
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/share/${params.id}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function SharePage({ params }: Props) {
  const { data: t } = await supabaseAdmin
    .from('testimonials')
    .select('*, spaces(name, theme_color, slug)')
    .eq('id', params.id)
    .eq('status', 'approved')
    .single()

  if (!t) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf9f7' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h2 style={{ fontFamily: 'Georgia, serif' }}>Testimonial not found</h2>
          <p style={{ color: '#7a7367' }}>It may have been removed or is not yet approved.</p>
        </div>
      </div>
    )
  }

  const space = t.spaces as { name: string; theme_color: string; slug: string } | null

  return <ShareClient testimonial={t} space={space} />
}
