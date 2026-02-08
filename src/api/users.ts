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
      // Get users from profiles
      let query = supabase
        .from('profiles')
        .select(`
          *,
          businesses(business_name, subscription_status, category, created_at)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (status && status.length > 0) {
        query = query.in('businesses.subscription_status', status)
      }

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      const { data: profiles, error, count } = await query

      if (error) {
        console.error('UseUsers Supabase Error:', error)
        throw error
      }

      // Fetch subscriptions manually since there's no FK constraint
      const profileIds = (profiles || []).map(p => p.id)
      let subscriptionsMap: Record<string, any> = {}
      let callsCountMap: Record<string, number> = {}

      if (profileIds.length > 0) {
        // Fetch subscriptions with plan details
        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('*, plans(name, price_amount, features)')
          .in('user_id', profileIds)
          .order('created_at', { ascending: false })

        if (subscriptions) {
          subscriptions.forEach(sub => {
            if (!subscriptionsMap[sub.user_id]) {
              subscriptionsMap[sub.user_id] = sub
            }
          })
        }

        // Fetch call counts per user
        const { data: calls } = await supabase
          .from('calls')
          .select('user_id')
          .in('user_id', profileIds)

        if (calls) {
          calls.forEach(call => {
            callsCountMap[call.user_id] = (callsCountMap[call.user_id] || 0) + 1
          })
        }
      }

      const users = (profiles || []).map((profile) => {
        const business = Array.isArray(profile.businesses)
          ? profile.businesses[0]
          : profile.businesses

        const subscription = subscriptionsMap[profile.id]
        const plan = subscription?.plans
        const planData = Array.isArray(plan) ? plan[0] : plan

        return {
          id: profile.id,
          fullName: profile.full_name || 'N/A',
          email: profile.email || 'N/A',
          phone: profile.contact_phone || '',
          avatarUrl: profile.avatar_url || '',
          businessName: business?.business_name || profile.business_name || 'No business',
          subscriptionStatus: subscription?.status || business?.subscription_status || 'inactive',
          planName: planData?.name || 'Free',
          planPrice: planData?.price_amount || 0,
          category: business?.category || '',
          createdAt: profile.created_at,
          // Subscription details
          subscriptionStart: subscription?.current_period_start || null,
          subscriptionEnd: subscription?.current_period_end || null,
          stripeCustomerId: subscription?.stripe_customer_id || null,
          cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
          // Usage stats
          totalCalls: callsCountMap[profile.id] || 0,
        }
      })

      return { users, total: count || 0 }
    },
    staleTime: 15000,
  })
}

// New hook for detailed single user view
export function useUserDetails(userId: string | null) {
  return useQuery({
    queryKey: ['user-details', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null

      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          businesses(*)
        `)
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      // Fetch subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*, plans(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Fetch calls summary
      const { data: calls, count: totalCalls } = await supabase
        .from('calls')
        .select('id, duration_seconds, status, created_at', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      // Calculate total duration
      const totalDuration = calls?.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) || 0

      // Fetch invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      const business = Array.isArray(profile.businesses)
        ? profile.businesses[0]
        : profile.businesses
      const plan = subscription?.plans
      const planData = Array.isArray(plan) ? plan[0] : plan

      return {
        id: profile.id,
        fullName: profile.full_name || 'N/A',
        email: profile.email || 'N/A',
        phone: profile.contact_phone || '',
        avatarUrl: profile.avatar_url || '',
        businessName: business?.business_name || profile.business_name || 'No business',
        businessCategory: business?.category || '',
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        // Subscription
        subscription: subscription ? {
          status: subscription.status,
          planName: planData?.name || 'Free',
          planPrice: planData?.price_amount || 0,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          stripeSubscriptionId: subscription.stripe_subscription_id,
          stripeCustomerId: subscription.stripe_customer_id,
        } : null,
        // Usage
        usage: {
          totalCalls: totalCalls || 0,
          totalDurationSeconds: totalDuration,
          recentCalls: calls || [],
        },
        // Invoices
        invoices: invoices || [],
      }
    },
    staleTime: 30000,
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
