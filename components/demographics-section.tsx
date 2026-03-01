'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { filtersToBody, dashboardPost, type FilterState } from '@/lib/utils'
import { Users } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

interface DemographicData {
  name?: string
  location?: string
  status?: string
  total_attendees?: number
  active?: number
  graduated?: number
  inactive?: number
  attended_events?: number
  count?: number
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

interface DemographicsSectionProps {
  filters?: FilterState | null
}

export function DemographicsSection({ filters }: DemographicsSectionProps) {
  const [cohortData, setCohortData] = useState<DemographicData[]>([])
  const [statusData, setStatusData] = useState<DemographicData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useIsMobile()

  const fetchDemographics = async () => {
    try {
      const fb = filtersToBody(filters)
      const [cohorts, statuses] = await Promise.all([
        dashboardPost('demographics', { type: 'cohort', ...fb }),
        dashboardPost('demographics', { type: 'status', ...fb })
      ])

      setCohortData(cohorts)
      setStatusData(statuses)
    } catch (error) {
      console.error('Error fetching demographics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDemographics()
  }, [filters])

  useEffect(() => {
    const handleRefresh = () => fetchDemographics()
    window.addEventListener('dashboard-data-changed', handleRefresh)
    return () => window.removeEventListener('dashboard-data-changed', handleRefresh)
  }, [filters])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Demographics</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }

  const statusChartData = statusData.map((item: any) => ({
    name: item.status?.charAt(0).toUpperCase() + item.status?.slice(1),
    value: item.count || 0
  }))

  const cohortChartData = cohortData
    .slice(0, 5)
    .map((item: any) => ({
      name: item.name,
      value: item.total_attendees || 0
    }))

  const RADIAN = Math.PI / 180
  const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, name, value, percent }: any) => {
    if (value === 0) return null // skip labels for zero-value slices
    const radius = outerRadius + 25
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="currentColor" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs">
        {`${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
      </text>
    )
  }

  const renderLegend = (data: { name: string; value: number }[]) => (props: any) => {
    return (
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-xs">
        {data.map((entry, index) => (
          <li key={entry.name} className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span>{entry.name}: {entry.value}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm sm:text-base">Attendee Demographics</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Distribution by status and cohort</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 px-1 sm:px-6">
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="cohort">Cohort</TabsTrigger>
          </TabsList>

          <TabsContent value="status">
            {statusChartData.length === 0 || statusChartData.every(d => d.value === 0) ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <Users className="h-12 w-12 mb-3 opacity-40" />
                <p className="text-sm font-medium">No status data available</p>
                <p className="text-xs mt-1">Try adjusting your filters</p>
              </div>
            ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={!isMobile}
                  label={isMobile ? false : renderCustomLabel}
                  outerRadius={isMobile ? 70 : 80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend content={renderLegend(statusChartData)} />
              </PieChart>
            </ResponsiveContainer>
            )}
          </TabsContent>

          <TabsContent value="cohort">
            {cohortChartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <Users className="h-12 w-12 mb-3 opacity-40" />
                <p className="text-sm font-medium">No cohort data available</p>
                <p className="text-xs mt-1">Try adjusting your filters</p>
              </div>
            ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={cohortChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={!isMobile}
                  label={isMobile ? false : renderCustomLabel}
                  outerRadius={isMobile ? 70 : 80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {cohortChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend content={renderLegend(cohortChartData)} />
              </PieChart>
            </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
