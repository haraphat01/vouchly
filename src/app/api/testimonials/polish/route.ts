import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { content, name, role } = await req.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const context = [name && `Name: ${name}`, role && `Role: ${role}`].filter(Boolean).join(', ')

    const prompt = `You are a testimonial editor. Take this raw customer feedback and rewrite it as a polished, authentic, and compelling testimonial. Keep it in first person, preserve the original sentiment and meaning, but make it more articulate and professional. Do not add fake details. Keep it concise (2-4 sentences max).

${context ? `Context: ${context}` : ''}

Raw feedback: "${content}"

Return ONLY the polished testimonial text, nothing else.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 250,
      temperature: 0.7,
    })

    const polished = completion.choices[0]?.message?.content?.trim()

    if (!polished) {
      return NextResponse.json({ error: 'Failed to polish testimonial' }, { status: 500 })
    }

    return NextResponse.json({ polished })
  } catch (error: unknown) {
    console.error('Polish API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
