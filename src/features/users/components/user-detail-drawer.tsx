import { useUserDetails } from '@/api/users'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
    Building2,
    Calendar,
    Clock,
    CreditCard,
    ExternalLink,
    Mail,
    Phone as PhoneIcon,
    PhoneCall,
    Receipt,
    Sparkles,
    Timer,
    User,
} from 'lucide-react'

interface UserDetailDrawerProps {
    userId: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    active: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-600 dark:text-emerald-400',
        dot: 'bg-emerald-500',
    },
    trialing: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-600 dark:text-blue-400',
        dot: 'bg-blue-500',
    },
    canceled: {
        bg: 'bg-slate-500/10',
        text: 'text-slate-600 dark:text-slate-400',
        dot: 'bg-slate-500',
    },
    past_due: {
        bg: 'bg-red-500/10',
        text: 'text-red-600 dark:text-red-400',
        dot: 'bg-red-500',
    },
    inactive: {
        bg: 'bg-amber-500/10',
        text: 'text-amber-600 dark:text-amber-400',
        dot: 'bg-amber-500',
    },
}

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

function formatCurrency(cents: number): string {
    return `$${(cents / 100).toFixed(0)}`
}

function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
}

export function UserDetailDrawer({
    userId,
    open,
    onOpenChange,
}: UserDetailDrawerProps) {
    const { data: user, isLoading } = useUserDetails(userId)

    const initials =
        user?.fullName
            ?.split(' ')
            .map((n: string) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'U'

    const status = user?.subscription?.status || 'inactive'
    const statusStyle = statusConfig[status] || statusConfig.inactive

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className='w-full sm:max-w-md overflow-y-auto p-0'>
                {isLoading ? (
                    <div className='p-6 space-y-6'>
                        <div className='flex items-center gap-4'>
                            <Skeleton className='h-20 w-20 rounded-full' />
                            <div className='space-y-2 flex-1'>
                                <Skeleton className='h-6 w-32' />
                                <Skeleton className='h-4 w-48' />
                            </div>
                        </div>
                        <Skeleton className='h-32 w-full rounded-xl' />
                        <Skeleton className='h-24 w-full rounded-xl' />
                    </div>
                ) : user ? (
                    <div className='flex flex-col'>
                        {/* Hero Header with Gradient */}
                        <div className='relative bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 pb-8'>
                            <SheetHeader className='mb-6'>
                                <SheetTitle className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                                    <User className='h-4 w-4' />
                                    User Profile
                                </SheetTitle>
                            </SheetHeader>

                            <div className='flex items-start gap-4'>
                                <Avatar className='h-20 w-20 ring-4 ring-background shadow-xl'>
                                    <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                                    <AvatarFallback className='text-xl font-semibold bg-primary/10 text-primary'>
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className='flex-1 min-w-0'>
                                    <h2 className='text-xl font-bold truncate'>{user.fullName}</h2>
                                    <div className='flex items-center gap-2 text-sm text-muted-foreground mt-1'>
                                        <Mail className='h-3.5 w-3.5 shrink-0' />
                                        <span className='truncate'>{user.email}</span>
                                    </div>
                                    {user.phone && (
                                        <div className='flex items-center gap-2 text-sm text-muted-foreground mt-1'>
                                            <PhoneIcon className='h-3.5 w-3.5 shrink-0' />
                                            <span>{user.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status Badge - Floating */}
                            <div className='absolute -bottom-4 left-6'>
                                <div
                                    className={cn(
                                        'inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-lg',
                                        'bg-background border',
                                        statusStyle.text
                                    )}
                                >
                                    <span
                                        className={cn('h-2 w-2 rounded-full animate-pulse', statusStyle.dot)}
                                    />
                                    <span className='font-medium capitalize text-sm'>{status}</span>
                                </div>
                            </div>
                        </div>

                        <div className='p-6 pt-8 space-y-6'>
                            {/* Business Card */}
                            <div className='rounded-xl border bg-card p-4 shadow-sm'>
                                <div className='flex items-center gap-3 mb-3'>
                                    <div className='h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center'>
                                        <Building2 className='h-5 w-5 text-primary' />
                                    </div>
                                    <div>
                                        <h3 className='font-semibold'>{user.businessName}</h3>
                                        {user.businessCategory && (
                                            <p className='text-sm text-muted-foreground'>
                                                {user.businessCategory}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className='flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t'>
                                    <Calendar className='h-3 w-3' />
                                    Member since {formatDate(user.createdAt)}
                                </div>
                            </div>

                            {/* Subscription Card */}
                            <div className='rounded-xl border bg-card overflow-hidden shadow-sm'>
                                <div className='p-4 border-b bg-muted/30'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <CreditCard className='h-4 w-4 text-muted-foreground' />
                                            <span className='font-medium'>Subscription</span>
                                        </div>
                                        {user.subscription && (
                                            <Badge variant='secondary' className='font-semibold'>
                                                {user.subscription.planName}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {user.subscription ? (
                                    <div className='p-4 space-y-4'>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-1'>
                                                <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                                                    Price
                                                </p>
                                                <p className='text-2xl font-bold'>
                                                    {formatCurrency(user.subscription.planPrice)}
                                                    <span className='text-sm font-normal text-muted-foreground'>
                                                        /mo
                                                    </span>
                                                </p>
                                            </div>
                                            <div className='space-y-1'>
                                                <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                                                    Renews
                                                </p>
                                                <p className='text-sm font-medium'>
                                                    {formatDate(user.subscription.currentPeriodEnd)}
                                                </p>
                                            </div>
                                        </div>

                                        {user.subscription.cancelAtPeriodEnd && (
                                            <div className='flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm'>
                                                <Sparkles className='h-4 w-4' />
                                                <span>Subscription ends at period end</span>
                                            </div>
                                        )}

                                        {user.subscription.stripeCustomerId && (
                                            <Button variant='outline' size='sm' className='w-full' asChild>
                                                <a
                                                    href={`https://dashboard.stripe.com/customers/${user.subscription.stripeCustomerId}`}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                >
                                                    <ExternalLink className='h-4 w-4 mr-2' />
                                                    View in Stripe Dashboard
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className='p-8 text-center text-muted-foreground'>
                                        <CreditCard className='h-8 w-8 mx-auto mb-2 opacity-50' />
                                        <p className='text-sm'>No active subscription</p>
                                    </div>
                                )}
                            </div>

                            {/* Usage Stats */}
                            <div className='rounded-xl border bg-card overflow-hidden shadow-sm'>
                                <div className='p-4 border-b bg-muted/30'>
                                    <div className='flex items-center gap-2'>
                                        <PhoneCall className='h-4 w-4 text-muted-foreground' />
                                        <span className='font-medium'>Usage Statistics</span>
                                    </div>
                                </div>

                                <div className='p-4'>
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div className='text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5'>
                                            <div className='flex items-center justify-center gap-1 text-3xl font-bold text-blue-600 dark:text-blue-400'>
                                                <PhoneCall className='h-6 w-6' />
                                                {user.usage.totalCalls}
                                            </div>
                                            <p className='text-xs text-muted-foreground mt-1'>
                                                Total Calls
                                            </p>
                                        </div>
                                        <div className='text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5'>
                                            <div className='flex items-center justify-center gap-1 text-3xl font-bold text-purple-600 dark:text-purple-400'>
                                                <Timer className='h-6 w-6' />
                                                {formatDuration(user.usage.totalDurationSeconds)}
                                            </div>
                                            <p className='text-xs text-muted-foreground mt-1'>
                                                Total Time
                                            </p>
                                        </div>
                                    </div>

                                    {user.usage.recentCalls.length > 0 && (
                                        <div className='mt-4 pt-4 border-t'>
                                            <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
                                                Recent Activity
                                            </p>
                                            <div className='space-y-2'>
                                                {user.usage.recentCalls.slice(0, 5).map((call) => (
                                                    <div
                                                        key={call.id}
                                                        className='flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 text-sm'
                                                    >
                                                        <div className='flex items-center gap-2'>
                                                            <Clock className='h-3.5 w-3.5 text-muted-foreground' />
                                                            <span className='text-muted-foreground'>
                                                                {formatDate(call.created_at)}
                                                            </span>
                                                        </div>
                                                        <div className='flex items-center gap-2'>
                                                            <Badge
                                                                variant='outline'
                                                                className={cn(
                                                                    'text-xs capitalize',
                                                                    call.status === 'completed' &&
                                                                    'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                                )}
                                                            >
                                                                {call.status}
                                                            </Badge>
                                                            <span className='text-xs text-muted-foreground font-medium'>
                                                                {call.duration_seconds
                                                                    ? formatDuration(call.duration_seconds)
                                                                    : '—'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Invoices */}
                            {user.invoices.length > 0 && (
                                <div className='rounded-xl border bg-card overflow-hidden shadow-sm'>
                                    <div className='p-4 border-b bg-muted/30'>
                                        <div className='flex items-center gap-2'>
                                            <Receipt className='h-4 w-4 text-muted-foreground' />
                                            <span className='font-medium'>Payment History</span>
                                        </div>
                                    </div>

                                    <div className='divide-y'>
                                        {user.invoices.map((invoice: any) => (
                                            <div
                                                key={invoice.id}
                                                className='flex items-center justify-between p-4'
                                            >
                                                <div>
                                                    <p className='font-semibold'>
                                                        {formatCurrency(invoice.amount_paid || 0)}
                                                    </p>
                                                    <p className='text-xs text-muted-foreground'>
                                                        {formatDate(invoice.created_at)}
                                                    </p>
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <Badge
                                                        variant={invoice.status === 'paid' ? 'default' : 'outline'}
                                                        className={cn(
                                                            'capitalize',
                                                            invoice.status === 'paid' &&
                                                            'bg-emerald-500 hover:bg-emerald-600'
                                                        )}
                                                    >
                                                        {invoice.status}
                                                    </Badge>
                                                    {invoice.hosted_invoice_url && (
                                                        <Button variant='ghost' size='icon' className='h-8 w-8' asChild>
                                                            <a
                                                                href={invoice.hosted_invoice_url}
                                                                target='_blank'
                                                                rel='noopener noreferrer'
                                                            >
                                                                <ExternalLink className='h-4 w-4' />
                                                            </a>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className='flex flex-col items-center justify-center h-full py-16 text-muted-foreground'>
                        <User className='h-12 w-12 mb-4 opacity-30' />
                        <p>User not found</p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
