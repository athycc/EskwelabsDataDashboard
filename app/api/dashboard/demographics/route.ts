import { dataStore } from '@/lib/data-store'
import type { FilterParams } from '@/lib/data-store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'cohort'
    const filters: FilterParams = {
      dateRange: (searchParams.get('dateRange') as FilterParams['dateRange']) || 'all',
      eventType: searchParams.get('eventType') || 'all',
      cohort: searchParams.get('cohort') || 'all',
      location: searchParams.get('location') || 'all',
    }

    let data

    if (type === 'location') {
      data = dataStore.getDemographicsByLocation(filters)
    } else if (type === 'status') {
      data = dataStore.getDemographicsByStatus(filters)
    } else {
      data = dataStore.getDemographicsByCohort(filters)
    }

    return Response.json(data)
  } catch (error) {
    console.error('Error fetching demographics:', error)
    return Response.json({ error: 'Failed to fetch demographics' }, { status: 500 })
  }
}
