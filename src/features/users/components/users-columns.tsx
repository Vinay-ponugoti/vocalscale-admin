import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type User } from '../data/schema'
import { Phone, Calendar } from 'lucide-react'

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  trialing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  canceled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  past_due: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
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

export const usersColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36 font-medium'>
        {row.getValue('fullName')}
      </LongText>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap text-sm'>{row.getValue('email')}</div>
    ),
  },
  {
    accessorKey: 'businessName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Business' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-32'>{row.getValue('businessName')}</LongText>
    ),
  },
  {
    accessorKey: 'planName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Plan' />
    ),
    cell: ({ row }) => {
      const planPrice = row.original.planPrice || 0
      return (
        <div className='flex items-center gap-1'>
          <Badge variant='outline'>{row.getValue('planName')}</Badge>
          {planPrice > 0 && (
            <span className='text-xs text-muted-foreground'>
              {formatCurrency(planPrice)}/mo
            </span>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'subscriptionStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('subscriptionStatus') as string
      const cancelAtPeriodEnd = row.original.cancelAtPeriodEnd
      return (
        <div className='flex items-center gap-1'>
          <Badge
            variant='outline'
            className={cn('capitalize', statusColors[status] || '')}
          >
            {status}
          </Badge>
          {cancelAtPeriodEnd && (
            <span className='text-xs text-red-500'>⚠</span>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
  {
    accessorKey: 'subscriptionEnd',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Renews' />
    ),
    cell: ({ row }) => {
      const endDate = row.original.subscriptionEnd
      const cancelAtPeriodEnd = row.original.cancelAtPeriodEnd
      return (
        <div className='flex items-center gap-1 text-sm'>
          <Calendar className='h-3 w-3 text-muted-foreground' />
          <span className={cn(cancelAtPeriodEnd && 'text-red-500 line-through')}>
            {formatDate(endDate)}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'totalCalls',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Calls' />
    ),
    cell: ({ row }) => {
      const totalCalls = row.original.totalCalls || 0
      return (
        <div className='flex items-center gap-1 text-sm'>
          <Phone className='h-3 w-3 text-muted-foreground' />
          <span className='font-medium'>{totalCalls}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Joined' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date
      return (
        <div className='text-nowrap text-sm'>
          {date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      )
    },
  },
]

