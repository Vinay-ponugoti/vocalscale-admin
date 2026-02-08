import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface BusinessesFilters {
  page?: number
  pageSize?: number
  status?: string[]
  search?: string
}

export function useBusinesses(filters: BusinessesFilters = {}) {
  const { page = 1, pageSize = 10, status, search } = filters

  return useQuery({
    queryKey: ['businesses', filters],
    queryFn: async () => {
      let query = supabase
        .from('businesses')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (status && status.length > 0) {
        query = query.in('subscription_status', status)
      }

      if (search) {
        query = query.or(`business_name.ilike.%${search}%,email.ilike.%${search}%,category.ilike.%${search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error
      return { businesses: data || [], total: count || 0 }
    },
    staleTime: 15000,
  })
}
