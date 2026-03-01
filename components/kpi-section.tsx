'use client'

import { useEffect, useState } from 'react'
import { KPICard } from '@/components/kpi-card'
import { buildFilterQuery, type FilterState } from '@/lib/utils'

interface DashboardStats {
  totalEvents: number
  totalAttendees: number
  totalRegistrations: number
  averageAttendanceRate: string
  trends?: {
    events: number
    attendees: number
    registrations: number
    attendanceRate: number
  }
}

interface KPISectionProps {
  filters?: FilterState | null
}

export function KPISection({ filters }: KPISectionProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/dashboard/stats?t=${Date.now()}${buildFilterQuery(filters)}`, { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [filters])

  useEffect(() => {
    const handleRefresh = () => fetchStats()
    window.addEventListener('dashboard-data-changed', handleRefresh)
    return () => window.removeEventListener('dashboard-data-changed', handleRefresh)
  }, [filters])

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-6 sm:mb-8">
      <KPICard
        title="Total Events"
        value={stats?.totalEvents || 0}
        unit="events"
        isLoading={isLoading}
        trend={stats?.trends ? { value: stats.trends.events, isPositive: stats.trends.events >= 0 } : undefined}
      />
      <KPICard
        title="Total Attendees"
        value={stats?.totalAttendees || 0}
        unit="people"
        isLoading={isLoading}
        trend={stats?.trends ? { value: stats.trends.attendees, isPositive: stats.trends.attendees >= 0 } : undefined}
      />
      <KPICard
        title="Total Registrations"
        value={stats?.totalRegistrations || 0}
        unit="registrations"
        isLoading={isLoading}
        trend={stats?.trends ? { value: stats.trends.registrations, isPositive: stats.trends.registrations >= 0 } : undefined}
      />
      <KPICard
        title="Avg Attendance Rate"
        value={stats?.averageAttendanceRate || '0'}
        unit="%"
        isLoading={isLoading}
        trend={stats?.trends ? { value: stats.trends.attendanceRate, isPositive: stats.trends.attendanceRate >= 0 } : undefined}
      />
    </div>
  )
}
