'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { filtersToBody, dashboardPost, type FilterState } from '@/lib/utils'
import { BarChart3 } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

interface EventData {
  name: string
  type: string
  date: string
  location: string
  capacity: number
  attended: number
  registered: number
  attendanceRate: number
}

interface EventsComparisonChartProps {
  filters?: FilterState | null
}

export function EventsComparisonChart({ filters }: EventsComparisonChartProps) {
  const [data, setData] = useState<EventData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useIsMobile()

  const fetchEvents = async () => {
    try {
      const eventsData = await dashboardPost('events', { limit: '10', ...filtersToBody(filters) })
      setData(eventsData)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [filters])

  useEffect(() => {
    const handleRefresh = () => fetchEvents()
    window.addEventListener('dashboard-data-changed', handleRefresh)
    return () => window.removeEventListener('dashboard-data-changed', handleRefresh)
  }, [filters])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Events Comparison</CardTitle>
          <CardDescription>Attendance by event (top 10)</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }

  // Prepare data for chart - take event names and attendance
  // On mobile, show only top 5 events to fit within screen width
  const displayData = isMobile ? data.slice(0, 5) : data
  const truncLen = isMobile ? 7 : 15
  const chartData = displayData.map(event => ({
    name: event.name.substring(0, truncLen) + (event.name.length > truncLen ? '..' : ''),
    attended: event.attended,
    registered: event.registered,
    fullName: event.name
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm sm:text-base">Events Comparison</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Attendance by event (top 10)</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 px-1 sm:px-6">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[250px] sm:h-[300px] text-muted-foreground">
            <BarChart3 className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm font-medium">No events match your filters</p>
            <p className="text-xs mt-1">Try adjusting your filters to see event comparisons</p>
          </div>
        ) : (
        <>
          <ResponsiveContainer width="100%" height={isMobile ? 260 : 300}>
            <BarChart data={chartData} margin={{ top: 5, right: isMobile ? 5 : 30, left: isMobile ? -15 : 0, bottom: isMobile ? 40 : 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="name"
                stroke="var(--color-muted-foreground)"
                tick={{ fontSize: isMobile ? 8 : 11 }}
                angle={isMobile ? -35 : -45}
                textAnchor="end"
                height={isMobile ? 55 : 80}
                interval={0}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                tick={{ fontSize: isMobile ? 8 : 12 }}
                width={isMobile ? 25 : 40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: isMobile ? '11px' : '14px',
                }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                labelFormatter={(label: string) => {
                  const item = chartData.find(d => d.name === label)
                  return item?.fullName || label
                }}
              />
              <Bar dataKey="attended" fill="#10b981" name="Attended" />
              <Bar dataKey="registered" fill="#3b82f6" name="Registered" />
            </BarChart>
          </ResponsiveContainer>
          {/* Custom compact legend */}
          <div className="flex justify-center gap-x-4 mt-1 text-[10px] sm:text-xs">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" />Attended</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]" />Registered</span>
          </div>
          {isMobile && data.length > 5 && (
            <p className="text-center text-[10px] text-muted-foreground mt-1">Showing top 5 of {data.length} events</p>
          )}
        </>
        )}
      </CardContent>
    </Card>
  )
}
