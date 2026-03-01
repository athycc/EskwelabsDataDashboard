import { dataStore } from '@/lib/data-store'
import type { FilterParams } from '@/lib/data-store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const filters: FilterParams = {
      dateRange: (searchParams.get('dateRange') as FilterParams['dateRange']) || 'all',
      eventType: searchParams.get('eventType') || 'all',
      cohort: searchParams.get('cohort') || 'all',
      location: searchParams.get('location') || 'all',
    }

    const formattedEvents = dataStore.getEventsWithStats(limit, filters)
    return Response.json(formattedEvents)
  } catch (error) {
    console.error('Error fetching events:', error)
    return Response.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}
