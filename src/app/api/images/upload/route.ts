import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 30

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const BUCKET = 'images'
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

async function ensureBucket() {
  const { error } = await supabaseAdmin.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: MAX_BYTES,
  })
  if (error && !error.message.includes('already exists') && !error.message.includes('Duplicate')) {
    throw error
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File | null
    const spaceId = formData.get('spaceId') as string | null

    if (!file || !spaceId) {
      return NextResponse.json({ error: 'image and spaceId are required' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP, and GIF images are allowed.' }, { status: 415 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image exceeds the 10 MB size limit.' }, { status: 413 })
    }

    await ensureBucket()

    const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
    const path = `${spaceId}/${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (error || !data) {
      console.error('Image upload error:', error)
      return NextResponse.json({ error: 'Image upload failed.' }, { status: 500 })
    }

    const TEN_YEARS = 60 * 60 * 24 * 365 * 10
    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(data.path, TEN_YEARS)

    if (signError || !signed?.signedUrl) {
      const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(data.path)
      return NextResponse.json({ url: pub.publicUrl })
    }

    return NextResponse.json({ url: signed.signedUrl })
  } catch (err) {
    console.error('Image upload error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
