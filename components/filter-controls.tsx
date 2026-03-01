'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Calendar } from 'lucide-react'
import type { FilterState } from '@/lib/utils'
import { toast } from 'sonner'

export type { FilterState }

interface FilterControlsProps {
  onFilterChange?: (filters: FilterState) => void
}

export function FilterControls({ onFilterChange }: FilterControlsProps) {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'all',
    eventType: 'all',
    cohort: 'all',
    location: 'all'
  })

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const handleReset = () => {
    const defaultFilters: FilterState = {
      dateRange: 'all',
      eventType: 'all',
      cohort: 'all',
      location: 'all'
    }
    setFilters(defaultFilters)
    onFilterChange?.(defaultFilters)
    toast.info('Filters reset to defaults')
  }

  return (
    <Card className="p-3 sm:p-4 mb-4 sm:mb-6 bg-background border-border">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Date Range</label>
          <Select value={filters.dateRange} onValueChange={(val) => handleFilterChange('dateRange', val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Event Type</label>
          <Select value={filters.eventType} onValueChange={(val) => handleFilterChange('eventType', val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="webinar">Webinar</SelectItem>
              <SelectItem value="meetup">Meetup</SelectItem>
              <SelectItem value="bootcamp">Bootcamp</SelectItem>
              <SelectItem value="conference">Conference</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Cohort</label>
          <Select value={filters.cohort} onValueChange={(val) => handleFilterChange('cohort', val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cohorts</SelectItem>
              <SelectItem value="cohort-1">Cohort 1</SelectItem>
              <SelectItem value="cohort-2">Cohort 2</SelectItem>
              <SelectItem value="cohort-3">Cohort 3</SelectItem>
              <SelectItem value="cohort-4">Cohort 4</SelectItem>
              <SelectItem value="cohort-5">Cohort 5</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Location</label>
          <Select value={filters.location} onValueChange={(val) => handleFilterChange('location', val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="manila">Manila</SelectItem>
              <SelectItem value="makati">Makati</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="quezon-city">Quezon City</SelectItem>
              <SelectItem value="pasig">Pasig</SelectItem>
              <SelectItem value="cebu">Cebu</SelectItem>
              <SelectItem value="davao">Davao</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={handleReset}>
          Reset Filters
        </Button>
      </div>
    </Card>
  )
}
