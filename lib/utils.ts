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

/** Convert FilterState to a plain object for POST body */
export function filtersToBody(filters?: FilterState | null): Record<string, string> {
  if (!filters) return {}
  const body: Record<string, string> = {}
  if (filters.dateRange) body.dateRange = filters.dateRange
  if (filters.eventType) body.eventType = filters.eventType
  if (filters.cohort) body.cohort = filters.cohort
  if (filters.location) body.location = filters.location
  return body
}

/** POST to the consolidated /api/dashboard endpoint */
export async function dashboardPost(action: string, body: Record<string, unknown> = {}) {
  const response = await fetch('/api/dashboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...body }),
    cache: 'no-store',
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `API error: ${response.status}`)
  }
  return response.json()
}
