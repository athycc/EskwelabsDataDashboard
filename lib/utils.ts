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

// ── Client-side upload persistence (survives Vercel serverless cold starts) ──

interface StoredUpload { id: string; csv: string }

/** Retrieve previously uploaded CSVs from localStorage */
export function getStoredUploads(): StoredUpload[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('eskwelabs_csv_uploads')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

/** Save an uploaded CSV to localStorage so future requests can rehydrate cold instances */
export function saveUpload(csv: string): void {
  if (typeof window === 'undefined') return
  try {
    const uploads = getStoredUploads()
    const id = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    uploads.push({ id, csv })
    localStorage.setItem('eskwelabs_csv_uploads', JSON.stringify(uploads))
  } catch { /* localStorage full or unavailable */ }
}

/** Clear all stored uploads (e.g. after a dashboard reset) */
export function clearStoredUploads(): void {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem('eskwelabs_csv_uploads') } catch {}
}

// ── Client-side deletion persistence (survives Vercel serverless cold starts) ──

interface StoredDeletion { type: string; identifier: string }

/** Retrieve previously recorded deletions from localStorage */
export function getStoredDeletions(): StoredDeletion[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('eskwelabs_deletions')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

/** Save a deletion so future requests can replay it on cold instances.
 *  identifier = event name | attendee email | "eventName|attendeeEmail" for registrations */
export function saveDeletion(type: string, identifier: string): void {
  if (typeof window === 'undefined') return
  try {
    const deletions = getStoredDeletions()
    // Avoid duplicates
    if (deletions.some(d => d.type === type && d.identifier === identifier)) return
    deletions.push({ type, identifier })
    localStorage.setItem('eskwelabs_deletions', JSON.stringify(deletions))
  } catch {}
}

/** Clear all stored deletions */
export function clearStoredDeletions(): void {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem('eskwelabs_deletions') } catch {}
}

/** POST to the consolidated /api/dashboard endpoint.
 *  Automatically includes any client-stored uploads so cold Vercel instances
 *  can rebuild the full DataStore before responding. */
export async function dashboardPost(action: string, body: Record<string, unknown> = {}) {
  const storedUploads = getStoredUploads()
  const storedDeletions = getStoredDeletions()
  const response = await fetch('/api/dashboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action, ...body,
      ...(storedUploads.length > 0 ? { _storedUploads: storedUploads } : {}),
      ...(storedDeletions.length > 0 ? { _storedDeletions: storedDeletions } : {}),
    }),
    cache: 'no-store',
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `API error: ${response.status}`)
  }
  return response.json()
}
