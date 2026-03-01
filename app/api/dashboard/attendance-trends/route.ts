import { dataStore } from '@/lib/data-store'
import type { FilterParams } from '@/lib/data-store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filters: FilterParams = {
      dateRange: (searchParams.get('dateRange') as FilterParams['dateRange']) || 'all',
      eventType: searchParams.get('eventType') || 'all',
      cohort: searchParams.get('cohort') || 'all',
      location: searchParams.get('location') || 'all',
    }
    const trends = dataStore.getAttendanceTrends(filters)
    return Response.json(trends)
  } catch (error) {
    console.error('Error fetching attendance trends:', error)
    return Response.json({ error: 'Failed to fetch attendance trends' }, { status: 500 })
  }
}
