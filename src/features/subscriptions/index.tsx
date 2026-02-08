import { useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table'
import { useSubscriptions } from '@/api/subscriptions'
import { formatCurrency, formatDate } from '@/lib/formatters'

interface SubscriptionRow {
  id: string
  user_id: string
  status: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
  plans?: {
    name: string
    price_amount: number
    interval: string
  }
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  trialing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  canceled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  past_due: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  incomplete: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
}

const subColumns: ColumnDef<SubscriptionRow>[] = [
  {
    accessorKey: 'user_id',
    header: 'User ID',
    cell: ({ row }) => (
      <div className='font-mono text-xs max-w-32 truncate'>
        {row.getValue('user_id')}
      </div>
    ),
  },
  {
    id: 'plan',
    header: 'Plan',
    cell: ({ row }) => (
      <Badge variant='outline'>
        {row.original.plans?.name || 'N/A'}
      </Badge>
    ),
  },
  {
    id: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const plan = row.original.plans
      if (!plan) return '-'
      return `${formatCurrency(plan.price_amount)}/${plan.interval}`
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge variant='outline' className={cn('capitalize', statusColors[status] || '')}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'cancel_at_period_end',
    header: 'Canceling',
    cell: ({ row }) =>
      row.getValue('cancel_at_period_end') ? (
        <Badge variant='destructive'>Yes</Badge>
      ) : (
        <span className='text-muted-foreground'>No</span>
      ),
  },
  {
    accessorKey: 'current_period_end',
    header: 'Period Ends',
    cell: ({ row }) => {
      const val = row.getValue('current_period_end') as string
      return val ? (
        <div className='text-nowrap text-sm'>{formatDate(val)}</div>
      ) : (
        '-'
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({ row }) => (
      <div className='text-nowrap text-sm'>
        {formatDate(row.getValue('created_at'))}
      </div>
    ),
  },
]

export function Subscriptions() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const { data, isLoading } = useSubscriptions({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  })

  const table = useReactTable({
    data: (data?.subscriptions || []) as SubscriptionRow[],
    columns: subColumns,
    pageCount: Math.ceil((data?.total || 0) / pagination.pageSize),
    state: { sorting, pagination, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Subscriptions</h2>
          <p className='text-muted-foreground'>
            All subscriptions ({data?.total || 0} total)
          </p>
        </div>
        {isLoading ? (
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-12 w-full' />
            ))}
          </div>
        ) : (
          <div className='flex flex-1 flex-col gap-4'>
            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={subColumns.length} className='h-24 text-center'>
                        No subscriptions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <DataTablePagination table={table} className='mt-auto' />
          </div>
        )}
      </Main>
    </>
  )
}
