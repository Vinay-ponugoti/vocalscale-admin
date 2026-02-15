import { supabase } from '@/lib/supabase'

const GATEWAY_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export interface SupportTicket {
    id: string
    user_id: string
    subject: string
    summary: string
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    channel: string
    metadata: Record<string, any>
    created_at: string
    updated_at: string
}

export interface TicketMessage {
    id: string
    ticket_id: string
    role: 'user' | 'assistant' | 'agent' | 'system'
    content: string
    sender_name?: string
    created_at: string
}

export interface KnowledgeDocument {
    id: string
    name: string
    type: string
    status: 'processing' | 'ready' | 'error'
    chunks_count: number
    uploaded_at: string
}

async function getAuthToken() {
    const session = await supabase.auth.getSession()
    return session.data.session?.access_token
}

export const supportApi = {
    // Get all support tickets
    getTickets: async (): Promise<SupportTicket[]> => {
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Get messages for a specific ticket
    getTicketMessages: async (ticketId: string): Promise<TicketMessage[]> => {
        const { data, error } = await supabase
            .from('support_messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true })

        if (error) {
            console.warn('Could not fetch ticket messages:', error.message)
            return []
        }
        return data || []
    },

    // Send a reply to a ticket (stores message + generates AI draft)
    sendReply: async (ticketId: string, content: string, senderRole: 'agent' | 'system' = 'agent') => {
        const { error } = await supabase
            .from('support_messages')
            .insert({
                ticket_id: ticketId,
                role: senderRole,
                content,
                sender_name: 'Admin',
            })

        if (error) throw error
        return { success: true }
    },

    // Update ticket status
    updateTicketStatus: async (ticketId: string, status: SupportTicket['status']) => {
        const { error } = await supabase
            .from('support_tickets')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', ticketId)

        if (error) throw error
        return { success: true }
    },

    // Generate AI draft via knowledge processor
    generateDraft: async (ticketId: string, history: any[], metadata: any, orderData?: any) => {
        const token = await getAuthToken()

        const response = await fetch(`${GATEWAY_URL}/admin/draft`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                ticket_id: ticketId,
                user_id: 'admin_dashboard',
                history,
                user_metadata: metadata,
                order_data: orderData,
            }),
        })

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Unknown error' }))
            throw new Error(err.error || `HTTP ${response.status}`)
        }

        return response.json()
    },

    // Execute admin action (refund, etc)
    executeAction: async (action: string, params: any) => {
        const token = await getAuthToken()

        const response = await fetch(`${GATEWAY_URL}/admin/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ action, params }),
        })

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Unknown error' }))
            throw new Error(err.error || `HTTP ${response.status}`)
        }

        return response.json()
    },

    // Knowledge base operations
    getKnowledgeDocuments: async (): Promise<KnowledgeDocument[]> => {
        const { data, error } = await supabase
            .from('knowledge_documents')
            .select('*')
            .order('uploaded_at', { ascending: false })

        if (error) {
            console.warn('knowledge_documents table may not exist:', error.message)
            return []
        }
        return data || []
    },

    // Search knowledge base
    searchKnowledge: async (query: string) => {
        const token = await getAuthToken()

        const response = await fetch(`${GATEWAY_URL}/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ query, limit: 10 }),
        })

        if (!response.ok) return { results: [] }
        return response.json()
    },

    // Get knowledge processor health
    getProcessorHealth: async () => {
        try {
            const kpUrl = import.meta.env.VITE_KP_URL || 'http://localhost:8001'
            const response = await fetch(`${kpUrl}/health`, { signal: AbortSignal.timeout(5000) })
            if (!response.ok) return { status: 'unhealthy' }
            return response.json()
        } catch {
            return { status: 'unreachable' }
        }
    },

    // Get knowledge processor metrics
    getProcessorMetrics: async () => {
        try {
            const kpUrl = import.meta.env.VITE_KP_URL || 'http://localhost:8001'
            const response = await fetch(`${kpUrl}/metrics`, { signal: AbortSignal.timeout(5000) })
            if (!response.ok) return null
            return response.json()
        } catch {
            return null
        }
    },
}
