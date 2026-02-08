import { useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
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
import { useCalls } from '@/api/calls'
import { formatDuration, formatPhoneNumber, formatDateTime } from '@/lib/formatters'

interface CallRow {
  id: string
  caller_name: string
  caller_phone: string
  duration_seconds: number
  status: string
  sentiment: string
  category: string
  is_urgent: boolean
  created_at: string
}

const statusColors: Record<string, string> = {
  Completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Missed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Handled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
}

const callColumns: ColumnDef<CallRow>[] = [
  {
    accessorKey: 'caller_name',
    header: 'Caller',
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('caller_name') || 'Unknown'}</div>
    ),
  },
  {
    accessorKey: 'caller_phone',
    header: 'Phone',
    cell: ({ row }) => (
      <div className='text-nowrap'>{formatPhoneNumber(row.getValue('caller_phone') || '')}</div>
    ),
  },
  {
    accessorKey: 'duration_seconds',
    header: 'Duration',
    cell: ({ row }) => formatDuration(row.getValue('duration_seconds') || 0),
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <Badge variant='outline'>{row.getValue('category') || 'General'}</Badge>
    ),
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
    accessorKey: 'is_urgent',
    header: 'Urgent',
    cell: ({ row }) =>
      row.getValue('is_urgent') ? (
        <Badge className='bg-red-500 text-white'>Urgent</Badge>
      ) : null,
  },
  {
    accessorKey: 'created_at',
    header: 'Date',
    cell: ({ row }) => (
      <div className='text-nowrap text-sm'>
        {formatDateTime(row.getValue('created_at'))}
      </div>
    ),
  },
]

export function Calls() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const { data, isLoading } = useCalls({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  })

  const table = useReactTable({
    data: (data?.calls || []) as CallRow[],
    columns: callColumns,
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
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
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
          <h2 className='text-2xl font-bold tracking-tight'>Call Logs</h2>
          <p className='text-muted-foreground'>
            All calls across all businesses ({data?.total || 0} total)
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
                      <TableCell colSpan={callColumns.length} className='h-24 text-center'>
                        No calls found.
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
