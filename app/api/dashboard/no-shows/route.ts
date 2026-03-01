import { dataStore } from '@/lib/data-store'
import type { FilterParams } from '@/lib/data-store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const filters: FilterParams = {
      dateRange: (searchParams.get('dateRange') as FilterParams['dateRange']) || 'all',
      eventType: searchParams.get('eventType') || 'all',
      cohort: searchParams.get('cohort') || 'all',
      location: searchParams.get('location') || 'all',
    }

    const noShows = dataStore.getNoShows(limit, filters)
    return Response.json(noShows)
  } catch (error) {
    console.error('Error fetching no-show data:', error)
    return Response.json({ error: 'Failed to fetch no-show data' }, { status: 500 })
  }
}
