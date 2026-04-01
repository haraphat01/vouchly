import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/supabase'

async function fetchProfile(): Promise<Profile | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
  return data
}

export function useProfile() {
  return useQuery<Profile | null>({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  })
}
