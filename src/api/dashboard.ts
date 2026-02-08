import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

      const [
        { count: totalUsers },
        { count: activeSubscriptions },
        { data: currentInvoices },
        { data: lastMonthInvoices },
        { count: totalCallsThisMonth },
        { count: totalCallsLastMonth },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('invoices').select('amount_paid').gte('created_at', startOfMonth),
        supabase.from('invoices').select('amount_paid').gte('created_at', startOfLastMonth).lte('created_at', endOfLastMonth),
        supabase.from('calls').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
        supabase.from('calls').select('*', { count: 'exact', head: true }).gte('created_at', startOfLastMonth).lte('created_at', endOfLastMonth),
      ])

      const currentRevenue = currentInvoices?.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0) || 0
      const lastRevenue = lastMonthInvoices?.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0) || 0
      const revenueChange = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue * 100).toFixed(1) : '0'
      const callsChange = (totalCallsLastMonth || 0) > 0
        ? (((totalCallsThisMonth || 0) - (totalCallsLastMonth || 0)) / (totalCallsLastMonth || 1) * 100).toFixed(1)
        : '0'

      return {
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalRevenue: currentRevenue,
        revenueChange,
        totalCalls: totalCallsThisMonth || 0,
        callsChange,
      }
    },
    staleTime: 30000,
  })
}

export function useCallsChart() {
  return useQuery({
    queryKey: ['calls-chart'],
    queryFn: async () => {
      const months = []
      const now = new Date()

      for (let i = 11; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

        const { count } = await supabase
          .from('calls')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString())

        months.push({
          name: start.toLocaleDateString('en-US', { month: 'short' }),
          total: count || 0,
        })
      }

      return months
    },
    staleTime: 60000,
  })
}

export function useRecentCalls() {
  return useQuery({
    queryKey: ['recent-calls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calls')
        .select('id, caller_name, caller_phone, duration_seconds, status, category, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      return data || []
    },
    staleTime: 15000,
  })
}
