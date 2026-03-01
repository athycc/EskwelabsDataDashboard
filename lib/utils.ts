import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export interface FilterState {
  dateRange: 'all' | '7days' | '30days' | '90days'
  eventType: 'all' | 'workshop' | 'webinar' | 'meetup' | 'bootcamp' | 'conference'
  cohort: 'all' | string
  location: 'all' | string
}

export function buildFilterQuery(filters?: FilterState | null): string {
  if (!filters) return ''
  const params = new URLSearchParams()
  if (filters.dateRange && filters.dateRange !== 'all') params.set('dateRange', filters.dateRange)
  if (filters.eventType && filters.eventType !== 'all') params.set('eventType', filters.eventType)
  if (filters.cohort && filters.cohort !== 'all') params.set('cohort', filters.cohort)
  if (filters.location && filters.location !== 'all') params.set('location', filters.location)
  const qs = params.toString()
  return qs ? `&${qs}` : ''
}
