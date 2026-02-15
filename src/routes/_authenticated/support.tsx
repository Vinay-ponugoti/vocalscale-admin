import { useState, useRef, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    MessageSquare,
    RefreshCcw,
    Search,
    Send,
    CheckCircle2,
    Clock,
    MoreVertical,
    Bot,
    AlertCircle,
    ArrowUpCircle,
    Loader2,
    Inbox,
    Filter,
} from 'lucide-react'
import { supportApi, type SupportTicket, type TicketMessage } from '@/api/support'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/support')({
    component: SupportPage,
})

const statusConfig = {
    open: { label: 'Open', color: 'bg-blue-500', variant: 'default' as const },
    in_progress: { label: 'In Progress', color: 'bg-yellow-500', variant: 'secondary' as const },
    resolved: { label: 'Resolved', color: 'bg-green-500', variant: 'outline' as const },
    closed: { label: 'Closed', color: 'bg-gray-500', variant: 'outline' as const },
}

const priorityConfig = {
    low: { label: 'Low', className: 'border-gray-300 text-gray-600' },
    medium: { label: 'Medium', className: 'border-blue-300 text-blue-600' },
    high: { label: 'High', className: 'border-orange-300 text-orange-600' },
    urgent: { label: 'Urgent', className: 'border-red-300 text-red-600 bg-red-50' },
}

function SupportPage() {
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const queryClient = useQueryClient()

    const { data: tickets = [], isLoading: isLoadingTickets, refetch } = useQuery({
        queryKey: ['support-tickets'],
        queryFn: supportApi.getTickets,
        refetchInterval: 30000,
    })

    const filteredTickets = tickets.filter((t) => {
        const matchesSearch =
            !searchQuery ||
            t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.user_id?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || (filteredTickets.length > 0 ? filteredTickets[0] : null)

    const openCount = tickets.filter((t) => t.status === 'open').length
    const urgentCount = tickets.filter((t) => t.priority === 'urgent' || t.priority === 'high').length

    return (
        <div className='flex h-[calc(100vh-4rem)] flex-col gap-4 p-4 md:flex-row'>
            {/* LEFT: Ticket List */}
            <Card className='flex w-full flex-col md:w-1/3 lg:w-1/4'>
                <CardHeader className='p-4 pb-2'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <CardTitle className='text-lg'>Inbox</CardTitle>
                            {openCount > 0 && (
                                <Badge variant='default' className='text-xs'>{openCount}</Badge>
                            )}
                        </div>
                        <Button size='icon' variant='ghost' onClick={() => refetch()}>
                            <RefreshCcw className='h-4 w-4' />
                        </Button>
                    </div>
                    {urgentCount > 0 && (
                        <div className='flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1 text-xs text-red-600 dark:bg-red-950 dark:text-red-400'>
                            <AlertCircle className='h-3 w-3' />
                            {urgentCount} high priority ticket{urgentCount > 1 ? 's' : ''}
                        </div>
                    )}
                    <div className='relative mt-2'>
                        <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder='Search tickets...'
                            className='pl-8'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className='mt-2 flex gap-1'>
                        {['all', 'open', 'in_progress', 'resolved'].map((s) => (
                            <Button
                                key={s}
                                variant={statusFilter === s ? 'default' : 'ghost'}
                                size='sm'
                                className='h-7 text-xs'
                                onClick={() => setStatusFilter(s)}
                            >
                                {s === 'all' ? 'All' : s === 'in_progress' ? 'Active' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <Separator />
                <ScrollArea className='flex-1'>
                    {isLoadingTickets ? (
                        <div className='flex items-center justify-center p-8'>
                            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className='flex flex-col items-center justify-center gap-2 p-8 text-center'>
                            <Inbox className='h-10 w-10 text-muted-foreground/50' />
                            <p className='text-sm text-muted-foreground'>No tickets found</p>
                        </div>
                    ) : (
                        <div className='flex flex-col gap-1 p-2'>
                            {filteredTickets.map((ticket) => (
                                <button
                                    key={ticket.id}
                                    onClick={() => setSelectedTicketId(ticket.id)}
                                    className={`flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors hover:bg-accent ${selectedTicket?.id === ticket.id
                                        ? 'bg-accent/50 border-primary/20'
                                        : 'border-transparent'
                                        }`}
                                >
                                    <div className='flex w-full flex-col gap-1'>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-sm font-semibold truncate max-w-[140px]'>
                                                {ticket.user_id?.substring(0, 8)}...
                                            </span>
                                            <span className='text-xs text-muted-foreground'>
                                                {formatRelativeTime(ticket.created_at)}
                                            </span>
                                        </div>
                                        <span className='text-xs font-medium line-clamp-1'>
                                            {ticket.subject || 'No subject'}
                                        </span>
                                        <p className='line-clamp-2 text-xs text-muted-foreground'>
                                            {ticket.summary || 'No description'}
                                        </p>
                                        <div className='mt-1.5 flex items-center gap-1.5'>
                                            <Badge
                                                variant={statusConfig[ticket.status]?.variant || 'outline'}
                                                className='text-[10px] px-1.5 py-0'
                                            >
                                                {statusConfig[ticket.status]?.label || ticket.status}
                                            </Badge>
                                            <Badge
                                                variant='outline'
                                                className={`text-[10px] px-1.5 py-0 ${priorityConfig[ticket.priority]?.className || ''}`}
                                            >
                                                {priorityConfig[ticket.priority]?.label || ticket.priority}
                                            </Badge>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </Card>

            {/* RIGHT: Detail View */}
            <Card className='flex flex-1 flex-col overflow-hidden'>
                {selectedTicket ? (
                    <SupportDetailView ticket={selectedTicket} />
                ) : (
                    <div className='flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground'>
                        <MessageSquare className='h-12 w-12 opacity-30' />
                        <p className='text-sm'>Select a ticket to view details</p>
                    </div>
                )}
            </Card>
        </div>
    )
}

function SupportDetailView({ ticket }: { ticket: SupportTicket }) {
    const [draft, setDraft] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [activeTab, setActiveTab] = useState('chat')
    const [replyInput, setReplyInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const queryClient = useQueryClient()

    // Load real conversation messages
    const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
        queryKey: ['ticket-messages', ticket.id],
        queryFn: () => supportApi.getTicketMessages(ticket.id),
        refetchInterval: 10000,
    })

    // Status update mutation
    const statusMutation = useMutation({
        mutationFn: ({ status }: { status: SupportTicket['status'] }) =>
            supportApi.updateTicketStatus(ticket.id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
            toast.success('Ticket status updated')
        },
        onError: () => toast.error('Failed to update status'),
    })

    // Send reply mutation
    const replyMutation = useMutation({
        mutationFn: (content: string) => supportApi.sendReply(ticket.id, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticket.id] })
            setReplyInput('')
            toast.success('Reply sent')
        },
        onError: () => toast.error('Failed to send reply'),
    })

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleGenerateDraft = async () => {
        setIsGenerating(true)
        try {
            const history = messages.length > 0
                ? messages.map((m) => ({ role: m.role, content: m.content }))
                : [{ role: 'user', content: ticket.summary }]

            const res = await supportApi.generateDraft(
                ticket.id,
                history,
                ticket.metadata || {}
            )

            if (res.draft) {
                setDraft(res.draft)
                toast.success(`Draft generated (Confidence: ${res.confidence || 'N/A'})`)
            }
        } catch (err) {
            console.error(err)
            toast.error('Failed to generate draft — check knowledge processor connection')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSendDraft = async () => {
        if (!draft.trim()) return
        try {
            await supportApi.sendReply(ticket.id, draft)
            queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticket.id] })
            setDraft('')
            toast.success('Reply sent')
        } catch {
            toast.error('Failed to send')
        }
    }

    const handleSendReply = () => {
        if (!replyInput.trim()) return
        replyMutation.mutate(replyInput)
    }

    // Combine ticket summary as first message if no messages loaded
    const displayMessages: TicketMessage[] = messages.length > 0
        ? messages
        : [{
            id: 'initial',
            ticket_id: ticket.id,
            role: 'user' as const,
            content: ticket.summary || 'No message content',
            sender_name: ticket.user_id,
            created_at: ticket.created_at,
        }]

    return (
        <div className='flex h-full flex-col'>
            {/* Header */}
            <div className='flex items-center justify-between border-b p-4'>
                <div className='flex items-center gap-4'>
                    <Avatar>
                        <AvatarFallback className='text-xs'>
                            {(ticket.user_id || 'U').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className='text-base font-semibold line-clamp-1'>{ticket.subject || 'No subject'}</h2>
                        <p className='text-xs text-muted-foreground'>
                            #{ticket.id.substring(0, 8)} &bull; {ticket.channel || 'Email'} &bull; {formatRelativeTime(ticket.created_at)}
                        </p>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    {ticket.status !== 'resolved' && (
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => statusMutation.mutate({ status: 'resolved' })}
                            disabled={statusMutation.isPending}
                        >
                            <CheckCircle2 className='mr-1.5 h-3.5 w-3.5' />
                            Resolve
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon'>
                                <MoreVertical className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => statusMutation.mutate({ status: 'in_progress' })}>
                                <Clock className='mr-2 h-4 w-4' /> Mark In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => statusMutation.mutate({ status: 'open' })}>
                                <ArrowUpCircle className='mr-2 h-4 w-4' /> Reopen
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className='text-destructive'>
                                <AlertCircle className='mr-2 h-4 w-4' /> Escalate
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className='flex flex-1 overflow-hidden'>
                {/* Main Content Area */}
                <div className='flex flex-1 flex-col'>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className='flex flex-1 flex-col'>
                        <div className='border-b px-4'>
                            <TabsList className='bg-transparent'>
                                <TabsTrigger value='chat' className='data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none'>
                                    Conversation
                                </TabsTrigger>
                                <TabsTrigger value='simulator' className='data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none'>
                                    Bot Simulator
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value='chat' className='flex flex-1 flex-col p-0 m-0 overflow-hidden'>
                            {/* Messages Area */}
                            <ScrollArea className='flex-1 p-4'>
                                <div className='flex flex-col gap-4'>
                                    {isLoadingMessages ? (
                                        <div className='flex items-center justify-center py-8'>
                                            <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
                                        </div>
                                    ) : (
                                        displayMessages.map((msg) => (
                                            <div key={msg.id} className='flex gap-3'>
                                                <Avatar className='h-8 w-8 shrink-0'>
                                                    <AvatarFallback className='text-[10px]'>
                                                        {msg.role === 'user' ? 'USR' : msg.role === 'assistant' ? 'BOT' : 'AGT'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className='flex-1 space-y-1'>
                                                    <div className='flex items-center gap-2'>
                                                        <span className='text-sm font-medium'>
                                                            {msg.role === 'user' ? (msg.sender_name || 'Customer') : msg.role === 'assistant' ? 'AI Bot' : 'Agent'}
                                                        </span>
                                                        <span className='text-xs text-muted-foreground'>
                                                            {formatRelativeTime(msg.created_at)}
                                                        </span>
                                                        {msg.role !== 'user' && (
                                                            <Badge variant='outline' className='text-[10px] px-1 py-0'>
                                                                {msg.role}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className={`rounded-lg border p-3 text-sm ${msg.role === 'user'
                                                        ? 'bg-muted/50'
                                                        : msg.role === 'assistant'
                                                            ? 'bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900'
                                                            : 'bg-green-50 border-green-100 dark:bg-green-950/20 dark:border-green-900'
                                                        }`}>
                                                        <p className='whitespace-pre-wrap'>{msg.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>

                            {/* Copilot Draft Area */}
                            <div className='border-t bg-muted/30 p-4 space-y-3'>
                                <Card className='border-primary/20 bg-primary/5'>
                                    <CardHeader className='pb-2 pt-3 px-4'>
                                        <div className='flex items-center justify-between'>
                                            <CardTitle className='text-sm font-medium flex items-center gap-2'>
                                                <Bot className='h-4 w-4 text-primary' />
                                                AI Copilot
                                            </CardTitle>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={handleGenerateDraft}
                                                disabled={isGenerating}
                                                className='h-7 text-xs'
                                            >
                                                {isGenerating ? (
                                                    <>
                                                        <Loader2 className='mr-1.5 h-3 w-3 animate-spin' />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <RefreshCcw className='mr-1.5 h-3 w-3' />
                                                        Generate Draft
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className='px-4 pb-3'>
                                        <textarea
                                            className='min-h-[80px] w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary'
                                            placeholder='Click "Generate Draft" to get an AI-suggested reply based on the knowledge base...'
                                            value={draft}
                                            onChange={(e) => setDraft(e.target.value)}
                                        />
                                        {draft && (
                                            <div className='mt-2 flex justify-end gap-2'>
                                                <Button size='sm' variant='ghost' className='h-7 text-xs' onClick={() => setDraft('')}>
                                                    Discard
                                                </Button>
                                                <Button size='sm' className='h-7 text-xs' onClick={handleSendDraft}>
                                                    <Send className='mr-1.5 h-3 w-3' />
                                                    Send Draft
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Quick Reply */}
                                <div className='flex gap-2'>
                                    <Input
                                        value={replyInput}
                                        onChange={(e) => setReplyInput(e.target.value)}
                                        placeholder='Type a quick reply...'
                                        className='text-sm'
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                                    />
                                    <Button
                                        onClick={handleSendReply}
                                        disabled={replyMutation.isPending || !replyInput.trim()}
                                        size='icon'
                                    >
                                        <Send className='h-4 w-4' />
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value='simulator' className='flex-1 p-0 m-0'>
                            <BotSimulator ticket={ticket} />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar Actions */}
                <div className='hidden w-72 flex-col border-l bg-muted/10 p-4 lg:flex'>
                    <h3 className='text-sm font-semibold mb-3'>Quick Actions</h3>
                    <div className='flex flex-col gap-2'>
                        <RefundAction ticket={ticket} />
                    </div>

                    <Separator className='my-4' />

                    <h3 className='text-sm font-semibold mb-2'>Ticket Details</h3>
                    <div className='grid gap-2.5 text-sm'>
                        <DetailRow label='Status'>
                            <Badge
                                variant={statusConfig[ticket.status]?.variant || 'outline'}
                                className='text-xs'
                            >
                                {statusConfig[ticket.status]?.label || ticket.status}
                            </Badge>
                        </DetailRow>
                        <DetailRow label='Priority'>
                            <Badge
                                variant='outline'
                                className={`text-xs ${priorityConfig[ticket.priority]?.className || ''}`}
                            >
                                {priorityConfig[ticket.priority]?.label || ticket.priority}
                            </Badge>
                        </DetailRow>
                        <DetailRow label='Channel'>
                            <span className='text-xs font-medium'>{ticket.channel || 'Email'}</span>
                        </DetailRow>
                        <DetailRow label='Created'>
                            <span className='text-xs font-medium'>
                                {new Date(ticket.created_at).toLocaleDateString()}
                            </span>
                        </DetailRow>
                        <DetailRow label='User ID'>
                            <span className='text-xs font-mono truncate max-w-[120px]'>
                                {ticket.user_id}
                            </span>
                        </DetailRow>
                    </div>

                    <Separator className='my-4' />

                    <h3 className='text-sm font-semibold mb-2'>Knowledge Base</h3>
                    <KnowledgeStatus />
                </div>
            </div>
        </div>
    )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className='flex items-center justify-between'>
            <span className='text-xs text-muted-foreground'>{label}</span>
            {children}
        </div>
    )
}

function KnowledgeStatus() {
    const { data: health } = useQuery({
        queryKey: ['kp-health'],
        queryFn: supportApi.getProcessorHealth,
        refetchInterval: 60000,
    })

    const statusColor = health?.status === 'healthy'
        ? 'bg-green-500'
        : health?.status === 'degraded'
            ? 'bg-yellow-500'
            : 'bg-red-500'

    return (
        <div className='space-y-2'>
            <div className='flex items-center gap-2'>
                <div className={`h-2 w-2 rounded-full ${statusColor}`} />
                <span className='text-xs text-muted-foreground'>
                    Processor: {health?.status || 'checking...'}
                </span>
            </div>
            {health?.components?.redis && (
                <div className='flex items-center gap-2'>
                    <div className={`h-2 w-2 rounded-full ${health.components.redis.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className='text-xs text-muted-foreground'>
                        Redis: {health.components.redis.status}
                    </span>
                </div>
            )}
        </div>
    )
}

function RefundAction({ ticket }: { ticket: SupportTicket }) {
    const [loading, setLoading] = useState(false)

    const handleRefund = async () => {
        if (!confirm('Are you sure you want to process this refund?')) return

        setLoading(true)
        try {
            await supportApi.executeAction('refund_customer', {
                ticket_id: ticket.id,
                amount: 50.0,
                reason: 'requested_by_customer',
            })
            toast.success('Refund processed successfully')
        } catch {
            toast.error('Refund failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader className='p-3 pb-1'>
                <CardTitle className='text-xs'>Process Refund</CardTitle>
            </CardHeader>
            <CardContent className='p-3 pt-0'>
                <p className='text-[11px] text-muted-foreground mb-2'>
                    30-day refund policy applies.
                </p>
                <Button
                    variant='destructive'
                    className='w-full'
                    size='sm'
                    onClick={handleRefund}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Refund $50.00'}
                </Button>
            </CardContent>
        </Card>
    )
}

function BotSimulator({ ticket }: { ticket: SupportTicket }) {
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([
        { role: 'system', content: `Bot Simulator — testing responses for Ticket #${ticket.id.substring(0, 8)}` },
    ])
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg = { role: 'user', content: input }
        setMessages((prev) => [...prev, userMsg])
        setInput('')
        setLoading(true)

        try {
            const res = await supportApi.generateDraft(
                ticket.id,
                [...messages.filter((m) => m.role !== 'system'), userMsg],
                ticket.metadata || {}
            )

            if (res.draft) {
                setMessages((prev) => [...prev, { role: 'assistant', content: res.draft }])
            }
        } catch {
            setMessages((prev) => [...prev, { role: 'system', content: 'Error generating response. Check knowledge processor.' }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='flex flex-col h-full'>
            <ScrollArea className='flex-1 p-4'>
                <div className='space-y-3'>
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[80%] rounded-lg p-3 text-sm ${m.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : m.role === 'system'
                                        ? 'bg-muted text-muted-foreground text-xs text-center w-full'
                                        : 'bg-secondary'
                                    }`}
                            >
                                <p className='whitespace-pre-wrap'>{m.content}</p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className='flex justify-start'>
                            <div className='bg-secondary rounded-lg p-3 flex items-center gap-2'>
                                <Loader2 className='h-3.5 w-3.5 animate-spin' />
                                <span className='text-xs text-muted-foreground'>Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>
            <div className='p-4 border-t flex gap-2'>
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='Type a message as the customer...'
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button onClick={handleSend} disabled={loading}>
                    <Send className='h-4 w-4' />
                </Button>
            </div>
        </div>
    )
}

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
}
