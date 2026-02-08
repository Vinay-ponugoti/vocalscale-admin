import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface UsersFilters {
  page?: number
  pageSize?: number
  status?: string[]
  search?: string
}

export function useUsers(filters: UsersFilters = {}) {
  const { page = 1, pageSize = 10, status, search } = filters

  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      // Get users from auth.users via service role
      let query = supabase
        .from('profiles')
        .select(`
          *,
          businesses(business_name, subscription_status, category, created_at),
          subscriptions(status, plan_id, plans(name, price_amount))
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (status && status.length > 0) {
        query = query.in('businesses.subscription_status', status)
      }

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,contact_phone.ilike.%${search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      const users = (data || []).map((profile) => {
        const business = Array.isArray(profile.businesses)
          ? profile.businesses[0]
          : profile.businesses
        const subscription = Array.isArray(profile.subscriptions)
          ? profile.subscriptions[0]
          : profile.subscriptions

        return {
          id: profile.user_id,
          fullName: profile.full_name || 'N/A',
          email: '', // Will be filled from auth if needed
          phone: profile.contact_phone || '',
          businessName: business?.business_name || 'No business',
          subscriptionStatus: business?.subscription_status || subscription?.status || 'inactive',
          planName: subscription?.plans?.name || 'Free',
          category: business?.category || '',
          createdAt: profile.created_at,
        }
      })

      return { users, total: count || 0 }
    },
    staleTime: 15000,
  })
}

export function useUserEmails() {
  return useQuery({
    queryKey: ['user-emails'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.admin.listUsers()
      if (error) throw error
      const emailMap: Record<string, string> = {}
      for (const user of data.users) {
        emailMap[user.id] = user.email || ''
      }
      return emailMap
    },
    staleTime: 60000,
  })
}
