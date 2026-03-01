'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardHeader } from '@/components/dashboard-header'
import { KPISection } from '@/components/kpi-section'
import { AttendanceTrendChart } from '@/components/attendance-trend-chart'
import { EventsComparisonChart } from '@/components/events-comparison-chart'
import { DemographicsSection } from '@/components/demographics-section'
import { NoShowsAnalysis } from '@/components/no-shows-analysis'
import { FilterControls } from '@/components/filter-controls'
import { ExportButton } from '@/components/export-button'
import { AIInsights } from '@/components/ai-insights'
import { AIChat } from '@/components/ai-chat'
import { CSVUpload } from '@/components/csv-upload'
import { EskwelabsInfo } from '@/components/eskwelabs-info'
import { DataViewer } from '@/components/data-viewer'
import { buildFilterQuery, type FilterState } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'

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

export default function DashboardPage() {
  const [filters, setFilters] = useState<FilterState | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchStats = useCallback(async () => {
    try {
      const filterQs = buildFilterQuery(filters)
      const response = await fetch(`/api/dashboard/stats?t=${Date.now()}${filterQs}`, { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [filters])

  useEffect(() => {
    fetchStats()
  }, [fetchStats, refreshKey])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const handleUploadComplete = () => {
    setRefreshKey(prev => prev + 1)
    // Also dispatch global event to force all components to refresh
    window.dispatchEvent(new Event('dashboard-data-changed'))
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 md:mb-8">
          <DashboardHeader />
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <ThemeToggle />
            <ExportButton stats={stats} filters={filters} disabled={!stats} />
          </div>
        </div>

        <FilterControls onFilterChange={handleFilterChange} />
        <KPISection key={`kpi-${refreshKey}`} filters={filters} />
        
        <div className="grid gap-6 mb-8">
          <AttendanceTrendChart key={`trends-${refreshKey}`} filters={filters} />
          <EventsComparisonChart key={`events-${refreshKey}`} filters={filters} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <DemographicsSection key={`demo-${refreshKey}`} filters={filters} />
          <NoShowsAnalysis key={`noshows-${refreshKey}`} filters={filters} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <AIInsights key={`insights-${refreshKey}`} />
          <EskwelabsInfo />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <CSVUpload onUploadComplete={handleUploadComplete} />
          <AIChat />
        </div>

        <div className="grid gap-6 mb-8">
          <DataViewer refreshKey={refreshKey} onDataChange={handleUploadComplete} />
        </div>
      </div>
    </main>
  )
}
