'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { buildFilterQuery, type FilterState } from '@/lib/utils'

interface NoShowData {
  eventName: string
  eventType: string
  date: string
  noShowCount: number
  totalRegistered: number
  noShowRate: number
}

interface NoShowsAnalysisProps {
  filters?: FilterState | null
}

export function NoShowsAnalysis({ filters }: NoShowsAnalysisProps) {
  const [data, setData] = useState<NoShowData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchNoShows = async () => {
    try {
      const response = await fetch(`/api/dashboard/no-shows?limit=50&t=${Date.now()}${buildFilterQuery(filters)}`, { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch no-shows')
      const noShowsData = await response.json()
      setData(noShowsData)
    } catch (error) {
      console.error('Error fetching no-shows:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNoShows()
  }, [filters])

  useEffect(() => {
    const handleRefresh = () => fetchNoShows()
    window.addEventListener('dashboard-data-changed', handleRefresh)
    return () => window.removeEventListener('dashboard-data-changed', handleRefresh)
  }, [filters])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No-Show Patterns</CardTitle>
          <CardDescription>Events with highest no-show rates</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      workshop: 'bg-blue-100 text-blue-800',
      webinar: 'bg-green-100 text-green-800',
      meetup: 'bg-purple-100 text-purple-800',
      bootcamp: 'bg-orange-100 text-orange-800',
      conference: 'bg-red-100 text-red-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getRateColor = (rate: number) => {
    if (rate > 40) return 'text-red-600 font-bold'
    if (rate > 20) return 'text-orange-600 font-semibold'
    return 'text-green-600'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>No-Show Patterns</CardTitle>
        <CardDescription>Events with highest no-show rates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">No-Shows</TableHead>
                <TableHead className="text-right">Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No no-show data available
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-sm">
                      {row.eventName.substring(0, 20)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(row.eventType)}>
                        {row.eventType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{row.date}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold">{row.noShowCount}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        / {row.totalRegistered}
                      </span>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${getRateColor(row.noShowRate)}`}>
                      {row.noShowRate.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
