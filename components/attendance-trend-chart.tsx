'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { buildFilterQuery, type FilterState } from '@/lib/utils'
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
      const response = await fetch(`/api/dashboard/attendance-trends?t=${Date.now()}${buildFilterQuery(filters)}`, { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch trends')
      const trendData = await response.json()
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
        <CardTitle>Attendance Trends Over Time</CardTitle>
        <CardDescription>Daily attendance rate and registration patterns</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <TrendingDown className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm font-medium">No trend data available</p>
            <p className="text-xs mt-1">Try adjusting your filters to see attendance trends</p>
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
          <LineChart data={data} margin={{ top: 5, right: isMobile ? 10 : 30, left: isMobile ? -10 : 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: isMobile ? '10px' : '12px' }}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: isMobile ? '10px' : '12px' }} width={isMobile ? 30 : 60} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px'
              }}
              formatter={(value: any) => {
                if (typeof value === 'number') {
                  return value.toFixed(1)
                }
                return value
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="registered"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6' }}
              name="Registered"
            />
            <Line
              type="monotone"
              dataKey="attended"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981' }}
              name="Attended"
            />
            <Line
              type="monotone"
              dataKey="attendanceRate"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b' }}
              name="Attendance Rate %"
            />
          </LineChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
