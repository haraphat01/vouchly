import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Testimonial } from '@/lib/supabase'

async function fetchTestimonials(spaceId: string): Promise<Testimonial[]> {
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .eq('space_id', spaceId)
    .order('created_at', { ascending: false })
  return data || []
}

async function fetchApprovedTestimonials(spaceId: string): Promise<Testimonial[]> {
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .eq('space_id', spaceId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
  return data || []
}

export function useTestimonials(spaceId: string) {
  return useQuery<Testimonial[]>({
    queryKey: ['testimonials', spaceId],
    queryFn: () => fetchTestimonials(spaceId),
    enabled: !!spaceId,
  })
}

export function useApprovedTestimonials(spaceId: string) {
  return useQuery<Testimonial[]>({
    queryKey: ['testimonials', spaceId, 'approved'],
    queryFn: () => fetchApprovedTestimonials(spaceId),
    enabled: !!spaceId,
  })
}

export function useUpdateTestimonialStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; spaceId: string; status: Testimonial['status'] }) => {
      await supabase.from('testimonials').update({ status }).eq('id', id)
    },
    onSuccess: (_data, { spaceId }) => {
      queryClient.invalidateQueries({ queryKey: ['testimonials', spaceId] })
    },
  })
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string; spaceId: string }) =>
      fetch(`/api/testimonials?id=${id}`, { method: 'DELETE' }),
    onMutate: async ({ id, spaceId }) => {
      await queryClient.cancelQueries({ queryKey: ['testimonials', spaceId] })
      const previous = queryClient.getQueryData<Testimonial[]>(['testimonials', spaceId])
      queryClient.setQueryData<Testimonial[]>(['testimonials', spaceId], old =>
        old ? old.filter(t => t.id !== id) : []
      )
      return { previous }
    },
    onError: (_err, { spaceId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['testimonials', spaceId], context.previous)
      }
    },
    onSettled: (_data, _err, { spaceId }) => {
      queryClient.invalidateQueries({ queryKey: ['testimonials', spaceId] })
    },
  })
}

export function usePolishTestimonial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ testimonial, token }: { testimonial: Testimonial; spaceId: string; token: string }) => {
      const res = await fetch('/api/testimonials/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: testimonial.content, name: testimonial.submitter_name, role: testimonial.submitter_role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to polish')
      await supabase.from('testimonials').update({ ai_enhanced_content: data.polished }).eq('id', testimonial.id)
      return { id: testimonial.id, polished: data.polished }
    },
    onSuccess: ({ id, polished }, { spaceId }) => {
      queryClient.setQueryData<Testimonial[]>(['testimonials', spaceId], old =>
        old ? old.map(t => t.id === id ? { ...t, ai_enhanced_content: polished } : t) : []
      )
    },
  })
}
