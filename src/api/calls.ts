import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface CallsFilters {
  page?: number
  pageSize?: number
  status?: string[]
  category?: string[]
  search?: string
}

export function useCalls(filters: CallsFilters = {}) {
  const { page = 1, pageSize = 10, status, category, search } = filters

  return useQuery({
    queryKey: ['calls', filters],
    queryFn: async () => {
      let query = supabase
        .from('calls')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (status && status.length > 0) {
        query = query.in('status', status)
      }

      if (category && category.length > 0) {
        query = query.in('category', category)
      }

      if (search) {
        query = query.or(`caller_name.ilike.%${search}%,caller_phone.ilike.%${search}%,summary.ilike.%${search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error
      return { calls: data || [], total: count || 0 }
    },
    staleTime: 15000,
  })
}
