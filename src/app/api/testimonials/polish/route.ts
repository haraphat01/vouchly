import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabaseAdmin.from('profiles').select('plan').eq('id', user.id).single()
    if (!profile || profile.plan === 'free') {
      return NextResponse.json({ error: 'AI polish requires a Starter or Pro plan. Upgrade to unlock this feature.' }, { status: 403 })
    }

    const { content, name, role, spaceId } = await req.json()
    if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 })

    // Fetch brand context so the AI knows what business this testimonial is for
    let brandName = ''
    let brandDescription = ''
    if (spaceId) {
      const { data: space } = await supabaseAdmin
        .from('spaces')
        .select('name, description, header_message')
        .eq('id', spaceId)
        .single()
      if (space) {
        brandName = space.name || ''
        brandDescription = space.description || space.header_message || ''
      }
    }

    const submitterContext = [
      name && `Submitter name: ${name.slice(0, 100)}`,
      role && `Submitter role: ${role.slice(0, 100)}`,
    ].filter(Boolean).join('\n')

    const brandContext = [
      brandName && `Business name: ${brandName}`,
      brandDescription && `What they do: ${brandDescription.slice(0, 300)}`,
    ].filter(Boolean).join('\n')

    const prompt = `You are a testimonial editor for a business called "${brandName || 'this business'}".

${brandContext ? `<brand>\n${brandContext}\n</brand>\n` : ''}${submitterContext ? `<submitter>\n${submitterContext}\n</submitter>\n` : ''}
<raw_feedback>
${content.slice(0, 2000)}
</raw_feedback>

Rewrite this raw customer feedback as a polished, authentic, and compelling testimonial. Rules:
- Keep it in first person and preserve the original meaning and sentiment
- Naturally mention the business name (${brandName || 'the business'}) at least once where it fits
- If the feedback mentions a specific result, outcome, or transformation, make that the headline of the testimonial
- Make it sound like a real person talking, not a press release — no hollow phrases like "I highly recommend"
- 2–4 sentences maximum
- Do NOT invent details that aren't in the original feedback

Return ONLY the polished testimonial text, nothing else.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 250,
      temperature: 0.7,
    })

    const raw = completion.choices[0]?.message?.content?.trim()
    if (!raw) return NextResponse.json({ error: 'Failed to polish testimonial' }, { status: 500 })
    // Strip surrounding quotes the model sometimes wraps around the output
    const polished = raw.replace(/^["'"']|["'"']$/g, '').trim()

    return NextResponse.json({ polished })
  } catch (error: unknown) {
    console.error('Polish API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
