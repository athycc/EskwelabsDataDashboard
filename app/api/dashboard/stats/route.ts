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
    const stats = dataStore.getStats(filters)
    return Response.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return Response.json({ error: 'Failed to fetch statistics' }, { status: 500 })
  }
}
