'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { filtersToBody, dashboardPost, type FilterState } from '@/lib/utils'
import { TrendingDown } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

interface TrendData {
  date: string
  eventsCount: number
  attended: number
  registered: number
  attendanceRate: number
}

interface AttendanceTrendChartProps {
  filters?: FilterState | null
}

export function AttendanceTrendChart({ filters }: AttendanceTrendChartProps) {
  const [data, setData] = useState<TrendData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useIsMobile()

  const fetchTrends = async () => {
    try {
      const trendData = await dashboardPost('attendance-trends', filtersToBody(filters))
      setData(trendData)
    } catch (error) {
      console.error('Error fetching attendance trends:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTrends()
  }, [filters])

  useEffect(() => {
    const handleRefresh = () => fetchTrends()
    window.addEventListener('dashboard-data-changed', handleRefresh)
    return () => window.removeEventListener('dashboard-data-changed', handleRefresh)
  }, [filters])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attendance Trends Over Time</CardTitle>
          <CardDescription>Daily attendance rate and registration patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm sm:text-base">Attendance Trends Over Time</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Daily attendance rate and registration patterns</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 px-1 sm:px-6">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[250px] sm:h-[300px] text-muted-foreground">
            <TrendingDown className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm font-medium">No trend data available</p>
            <p className="text-xs mt-1">Try adjusting your filters to see attendance trends</p>
          </div>
        ) : (
        <>
          <ResponsiveContainer width="100%" height={isMobile ? 260 : 300}>
            <LineChart data={data} margin={{ top: 5, right: isMobile ? 5 : 30, left: isMobile ? -15 : 0, bottom: isMobile ? 5 : 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="date"
                stroke="var(--color-muted-foreground)"
                tick={{ fontSize: isMobile ? 8 : 12 }}
                interval={isMobile ? Math.max(Math.floor(data.length / 5), 1) : 'preserveStartEnd'}
                tickFormatter={(val: string) => isMobile ? val.replace(/^\d{4}-/, '').slice(0, 5) : val}
              />
              <YAxis
                yAxisId="left"
                stroke="var(--color-muted-foreground)"
                tick={{ fontSize: isMobile ? 8 : 12 }}
                width={isMobile ? 25 : 50}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                stroke="#f59e0b"
                tick={{ fontSize: isMobile ? 8 : 12 }}
                width={isMobile ? 25 : 50}
                tickFormatter={(v: number) => `${v}%`}
                hide={isMobile}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: isMobile ? '11px' : '14px',
                }}
                formatter={(value: any, name: string) => {
                  if (typeof value === 'number') return [value.toFixed(1), name]
                  return [value, name]
                }}
              />
              <Line yAxisId="left" type="monotone" dataKey="registered" stroke="#3b82f6" strokeWidth={2} dot={{ r: isMobile ? 2 : 4 }} name="Registered" />
              <Line yAxisId="left" type="monotone" dataKey="attended" stroke="#10b981" strokeWidth={2} dot={{ r: isMobile ? 2 : 4 }} name="Attended" />
              <Line yAxisId="right" type="monotone" dataKey="attendanceRate" stroke="#f59e0b" strokeWidth={2} dot={{ r: isMobile ? 2 : 4 }} name="Rate %" />
            </LineChart>
          </ResponsiveContainer>
          {/* Custom compact legend for mobile */}
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1 text-[10px] sm:text-xs">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]" />Registered</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" />Attended</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" />Rate %</span>
          </div>
        </>
        )}
      </CardContent>
    </Card>
  )
}
