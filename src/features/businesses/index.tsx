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
import { useBusinesses } from '@/api/businesses'
import { formatDate } from '@/lib/formatters'
import { LongText } from '@/components/long-text'

interface BusinessRow {
  id: string
  business_name: string
  category: string
  email: string
  phone: string
  city: string
  state: string
  subscription_status: string
  rating: number | null
  created_at: string
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  trialing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  canceled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  past_due: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
}

const businessColumns: ColumnDef<BusinessRow>[] = [
  {
    accessorKey: 'business_name',
    header: 'Business',
    cell: ({ row }) => (
      <LongText className='max-w-48 font-medium'>
        {row.getValue('business_name')}
      </LongText>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <Badge variant='outline'>{row.getValue('category') || 'N/A'}</Badge>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <div className='text-nowrap text-sm'>{row.getValue('email') || ''}</div>
    ),
  },
  {
    id: 'location',
    header: 'Location',
    cell: ({ row }) => {
      const city = row.original.city
      const state = row.original.state
      if (!city && !state) return <span className='text-muted-foreground'>N/A</span>
      return <div className='text-nowrap'>{[city, state].filter(Boolean).join(', ')}</div>
    },
  },
  {
    accessorKey: 'subscription_status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('subscription_status') as string
      return (
        <Badge variant='outline' className={cn('capitalize', statusColors[status] || '')}>
          {status || 'inactive'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    cell: ({ row }) => {
      const rating = row.getValue('rating') as number | null
      if (!rating) return <span className='text-muted-foreground'>-</span>
      return <div>{rating.toFixed(1)}</div>
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

export function Businesses() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const { data, isLoading } = useBusinesses({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  })

  const table = useReactTable({
    data: (data?.businesses || []) as BusinessRow[],
    columns: businessColumns,
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
          <h2 className='text-2xl font-bold tracking-tight'>Businesses</h2>
          <p className='text-muted-foreground'>
            All registered businesses ({data?.total || 0} total)
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
                      <TableCell colSpan={businessColumns.length} className='h-24 text-center'>
                        No businesses found.
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
