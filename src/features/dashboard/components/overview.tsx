import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { useCallsChart } from '@/api/dashboard'

export function Overview() {
  const { data, isLoading } = useCallsChart()

  if (isLoading) {
    return <Skeleton className='h-[350px] w-full' />
  }

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data || []}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          direction='ltr'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: 'transparent' }}
          content={({ active, payload }: any) => {
            if (active && payload && payload.length) {
              return (
                <div className='rounded-lg border bg-background p-2 shadow-sm'>
                  <div className='grid grid-cols-2 gap-2'>
                    <div className='flex flex-col'>
                      <span className='text-[0.70rem] uppercase text-muted-foreground'>
                        Total
                      </span>
                      <span className='font-bold text-muted-foreground'>
                        {payload[0].value}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
