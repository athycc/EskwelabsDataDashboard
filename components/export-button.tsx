'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { exportEventData, exportAttendanceData, exportNoShowData, downloadDashboardReport, createDashboardSummary } from '@/lib/export-utils'
import { Download } from 'lucide-react'
import { filtersToBody, dashboardPost, type FilterState } from '@/lib/utils'
import { toast } from 'sonner'

interface ExportButtonProps {
  stats?: any
  filters?: FilterState | null
  disabled?: boolean
}

export function ExportButton({ stats, filters, disabled = false }: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleExportEvents = async () => {
    setIsLoading(true)
    try {
      const events = await dashboardPost('events', { limit: '100', ...filtersToBody(filters) })
      exportEventData(events)
      toast.success('Events report exported successfully')
    } catch (error) {
      console.error('Error exporting events:', error)
      toast.error('Failed to export events report')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportTrends = async () => {
    setIsLoading(true)
    try {
      const trends = await dashboardPost('attendance-trends', filtersToBody(filters))
      exportAttendanceData(trends)
      toast.success('Attendance trends exported successfully')
    } catch (error) {
      console.error('Error exporting trends:', error)
      toast.error('Failed to export attendance trends')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportNoShows = async () => {
    setIsLoading(true)
    try {
      const noShows = await dashboardPost('no-shows', { limit: '100', ...filtersToBody(filters) })
      exportNoShowData(noShows)
      toast.success('No-show analysis exported successfully')
    } catch (error) {
      console.error('Error exporting no-shows:', error)
      toast.error('Failed to export no-show analysis')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportSummary = () => {
    if (!stats) return
    const summary = createDashboardSummary(stats)
    downloadDashboardReport(summary, `dashboard-summary-${new Date().toISOString().split('T')[0]}.txt`)
    toast.success('Dashboard summary exported successfully')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || isLoading}>
          <Download className="mr-2 h-4 w-4" />
          {isLoading ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Data</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportEvents}>
          Events Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportTrends}>
          Attendance Trends
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportNoShows}>
          No-Show Analysis
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportSummary}>
          Dashboard Summary
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
