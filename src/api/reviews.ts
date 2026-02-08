import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface ReviewsFilters {
  page?: number
  pageSize?: number
  rating?: number[]
  source?: string[]
  search?: string
}

export function useReviews(filters: ReviewsFilters = {}) {
  const { page = 1, pageSize = 10, rating, source, search } = filters

  return useQuery({
    queryKey: ['reviews', filters],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          businesses(business_name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (rating && rating.length > 0) {
        query = query.in('rating', rating)
      }

      if (source && source.length > 0) {
        query = query.in('source', source)
      }

      if (search) {
        query = query.or(`reviewer_name.ilike.%${search}%,review_text.ilike.%${search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error
      return { reviews: data || [], total: count || 0 }
    },
    staleTime: 15000,
  })
}
