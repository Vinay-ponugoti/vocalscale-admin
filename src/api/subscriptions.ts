import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface SubscriptionsFilters {
  page?: number
  pageSize?: number
  status?: string[]
  search?: string
}

export function useSubscriptions(filters: SubscriptionsFilters = {}) {
  const { page = 1, pageSize = 10, status } = filters

  return useQuery({
    queryKey: ['subscriptions', filters],
    queryFn: async () => {
      let query = supabase
        .from('subscriptions')
        .select(`
          *,
          plans(name, price_amount, interval)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (status && status.length > 0) {
        query = query.in('status', status)
      }

      const { data, error, count } = await query

      if (error) throw error
      return { subscriptions: data || [], total: count || 0 }
    },
    staleTime: 15000,
  })
}

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('price_amount', { ascending: true })

      if (error) throw error
      return data || []
    },
    staleTime: 300000,
  })
}
