import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 60 // allow up to 60s for large uploads

const MAX_BYTES = 50 * 1024 * 1024 // 50 MB
const BUCKET = 'videos'
const TEN_YEARS = 60 * 60 * 24 * 365 * 10

async function ensureBucket() {
  const { error } = await supabaseAdmin.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: MAX_BYTES,
  })
  // Ignore "already exists" error (Duplicate / 409)
  if (error && !error.message.includes('already exists') && !error.message.includes('Duplicate')) {
    throw error
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('video') as File | null
    const spaceId = formData.get('spaceId') as string | null

    if (!file || !spaceId) {
      return NextResponse.json({ error: 'video and spaceId are required' }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Video exceeds the 50 MB size limit.' }, { status: 413 })
    }

    await ensureBucket()

    const ext = file.type === 'video/mp4' ? 'mp4' : 'webm'
    const path = `${spaceId}/${Date.now()}.${ext}`
    const buffer = await file.arrayBuffer()

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (error || !data) {
      console.error('Storage upload error:', error)
      return NextResponse.json({ error: 'Video upload failed.' }, { status: 500 })
    }

    // Signed URL valid for 10 years — works regardless of bucket public setting
    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(data.path, TEN_YEARS)

    if (signError || !signed?.signedUrl) {
      const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(data.path)
      return NextResponse.json({ url: pub.publicUrl })
    }

    return NextResponse.json({ url: signed.signedUrl })
  } catch (err) {
    console.error('Video upload error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
