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
import { Star } from 'lucide-react'
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
import { useReviews } from '@/api/reviews'
import { formatDate } from '@/lib/formatters'
import { LongText } from '@/components/long-text'

interface ReviewRow {
  id: string
  reviewer_name: string
  rating: number
  review_text: string
  source: string
  sentiment: string
  review_date: string
  created_at: string
  businesses?: { business_name: string }
}

const sentimentColors: Record<string, string> = {
  positive: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  negative: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className='flex items-center gap-0.5'>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3.5 w-3.5',
            i < rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-muted text-muted'
          )}
        />
      ))}
    </div>
  )
}

const reviewColumns: ColumnDef<ReviewRow>[] = [
  {
    id: 'business',
    header: 'Business',
    cell: ({ row }) => (
      <LongText className='max-w-36 font-medium'>
        {row.original.businesses?.business_name || 'N/A'}
      </LongText>
    ),
  },
  {
    accessorKey: 'reviewer_name',
    header: 'Reviewer',
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('reviewer_name')}</div>
    ),
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    cell: ({ row }) => <StarRating rating={row.getValue('rating')} />,
  },
  {
    accessorKey: 'review_text',
    header: 'Review',
    cell: ({ row }) => (
      <LongText className='max-w-60 text-sm'>
        {row.getValue('review_text')}
      </LongText>
    ),
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => (
      <Badge variant='outline' className='capitalize'>
        {(row.getValue('source') as string || '').replace('_', ' ')}
      </Badge>
    ),
  },
  {
    accessorKey: 'sentiment',
    header: 'Sentiment',
    cell: ({ row }) => {
      const sentiment = row.getValue('sentiment') as string
      return (
        <Badge variant='outline' className={cn('capitalize', sentimentColors[sentiment] || '')}>
          {sentiment || 'N/A'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'review_date',
    header: 'Date',
    cell: ({ row }) => {
      const val = row.getValue('review_date') as string
      return val ? (
        <div className='text-nowrap text-sm'>{formatDate(val)}</div>
      ) : (
        '-'
      )
    },
  },
]

export function Reviews() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const { data, isLoading } = useReviews({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  })

  const table = useReactTable({
    data: (data?.reviews || []) as ReviewRow[],
    columns: reviewColumns,
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
          <h2 className='text-2xl font-bold tracking-tight'>Reviews</h2>
          <p className='text-muted-foreground'>
            All customer reviews ({data?.total || 0} total)
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
                      <TableCell colSpan={reviewColumns.length} className='h-24 text-center'>
                        No reviews found.
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
