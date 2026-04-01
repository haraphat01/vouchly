import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Space } from '@/lib/supabase'

async function fetchSpaces(): Promise<Space[]> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return []
  const { data } = await supabase
    .from('spaces')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
  return data || []
}

async function fetchSpace(id: string): Promise<Space | null> {
  const { data } = await supabase.from('spaces').select('*').eq('id', id).single()
  return data
}

export function useSpaces() {
  return useQuery<Space[]>({
    queryKey: ['spaces'],
    queryFn: fetchSpaces,
  })
}

export function useSpace(id: string) {
  return useQuery<Space | null>({
    queryKey: ['spaces', id],
    queryFn: () => fetchSpace(id),
    enabled: !!id,
  })
}

export function useSpaceBySlug(slug: string) {
  return useQuery<Space | null>({
    queryKey: ['spaces', 'slug', slug],
    queryFn: async () => {
      const { data } = await supabase.from('spaces').select('*').eq('slug', slug).single()
      return data
    },
    enabled: !!slug,
  })
}

export function useDeleteSpace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('spaces').delete().eq('id', id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] })
    },
  })
}

export function useUpdateSpace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Space> }) => {
      await supabase.from('spaces').update(updates).eq('id', id)
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['spaces', id] })
      queryClient.invalidateQueries({ queryKey: ['spaces'] })
    },
  })
}
