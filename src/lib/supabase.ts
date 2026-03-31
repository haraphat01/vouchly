import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
)

export type Profile = {
  id: string
  email: string
  full_name?: string
  plan: 'free' | 'starter' | 'pro'
  stripe_customer_id?: string
  stripe_subscription_id?: string
  created_at: string
}

export type Space = {
  id: string
  user_id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  custom_domain?: string
  header_title: string
  header_message: string
  questions: string[]
  collect_video: boolean
  collect_text: boolean
  rating_required: boolean
  auto_approve: boolean
  theme_color: string
  widget_theme: 'light' | 'dark' | 'auto'
  is_active: boolean
  created_at: string
}

export type Testimonial = {
  id: string
  space_id: string
  type: 'text' | 'video'
  submitter_name: string
  submitter_email?: string
  submitter_role?: string
  submitter_company?: string
  submitter_avatar_url?: string
  content?: string
  video_url?: string
  image_url?: string
  video_thumbnail_url?: string
  ai_enhanced_content?: string
  answers?: Record<string, string>
  campaign?: string
  rating?: number
  status: 'pending' | 'approved' | 'archived'
  is_featured: boolean
  source: 'direct' | 'google' | 'trustpilot' | 'import'
  tags?: string[]
  created_at: string
}
