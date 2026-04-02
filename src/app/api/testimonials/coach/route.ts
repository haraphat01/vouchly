import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase'
import { PLANS } from '@/lib/utils'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { content, spaceId, name, role } = await req.json()

    if (!content || !spaceId) {
      return NextResponse.json({ tips: [] })
    }

    // Check if the space owner's plan includes AI coaching — also grab brand context
    const { data: space } = await supabaseAdmin
      .from('spaces')
      .select('user_id, name, description, header_message')
      .eq('id', spaceId)
      .single()
    if (space) {
      const { data: profile } = await supabaseAdmin.from('profiles').select('plan').eq('id', space.user_id).single()
      const plan = (profile?.plan || 'free') as keyof typeof PLANS
      if (!PLANS[plan].coach) {
        return NextResponse.json({ tips: [] })
      }
    }

    const brandName = space?.name || ''
    const brandDescription = (space?.description || space?.header_message || '').slice(0, 300)

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length

    const brandContext = [
      brandName && `Business name: ${brandName}`,
      brandDescription && `What they do: ${brandDescription}`,
    ].filter(Boolean).join('\n')

    const submitterContext = [
      name && `Author name: ${name.slice(0, 100)}`,
      role && `Author role: ${role.slice(0, 100)}`,
    ].filter(Boolean).join('\n')

    const prompt = `You are a testimonial writing coach giving real-time feedback as someone writes a testimonial for a specific business.

${brandContext ? `<brand>\n${brandContext}\n</brand>\n` : ''}<draft>
${content.slice(0, 2000)}
</draft>
Word count: ${wordCount}
${submitterContext ? `<submitter>\n${submitterContext}\n</submitter>` : ''}

Return ONLY valid JSON in this exact shape: {"tips":[{"type":"warning|success|info","message":"string"}]}

Rules:
- "warning" (use sparingly): something weak — vague phrases like "great product"/"very helpful", no specific result or number, under 25 words, or doesn't mention ${brandName || 'the business'} at all
- "success": something working well — specific metric/outcome (e.g. "saved 3 hrs/week"), a before/after story, credibility markers, or mentions ${brandName || 'the business'} naturally
- "info": neutral guidance — word count (sweet spot is 60–80 words), structural tip, or suggestion to mention ${brandName || 'the business'} by name
- Messages must be under 90 characters and feel conversational, not robotic
- Be specific: say "Add a number, e.g. '3x faster'" not just "be more specific"
- Return 1 tip if under 25 words, up to 3 tips for longer text
- If the draft is excellent (specific, 60-80 words, has story), return only success tips
- Never return an empty tips array when content has 5+ words`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.4,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content?.trim()
    if (!raw) return NextResponse.json({ tips: [] })

    const parsed = JSON.parse(raw)
    return NextResponse.json({ tips: parsed.tips || [] })
  } catch (error) {
    // Fail silently — coaching is best-effort, don't disrupt submission
    return NextResponse.json({ tips: [] })
  }
}
