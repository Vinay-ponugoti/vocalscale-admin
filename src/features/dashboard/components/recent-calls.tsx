import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useRecentCalls } from '@/api/dashboard'
import { formatDuration, formatPhoneNumber, getInitials } from '@/lib/formatters'

export function RecentCalls() {
  const { data: calls, isLoading } = useRecentCalls()

  if (isLoading) {
    return (
      <div className='space-y-8'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='flex items-center gap-4'>
            <Skeleton className='h-9 w-9 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-3 w-24' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!calls || calls.length === 0) {
    return (
      <p className='text-sm text-muted-foreground text-center py-8'>
        No calls yet
      </p>
    )
  }

  return (
    <div className='space-y-8'>
      {calls.map((call) => (
        <div key={call.id} className='flex items-center gap-4'>
          <Avatar className='h-9 w-9'>
            <AvatarFallback>
              {getInitials(call.caller_name || 'UK')}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-wrap items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm leading-none font-medium'>
                {call.caller_name || 'Unknown'}
              </p>
              <p className='text-sm text-muted-foreground'>
                {formatPhoneNumber(call.caller_phone || '')}
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant='outline' className='text-xs'>
                {call.category || 'General'}
              </Badge>
              <span className='text-sm text-muted-foreground'>
                {formatDuration(call.duration_seconds || 0)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
