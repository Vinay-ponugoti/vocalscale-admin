import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
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
