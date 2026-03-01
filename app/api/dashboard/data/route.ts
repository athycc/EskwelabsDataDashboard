import { dataStore } from '@/lib/data-store'

/**
 * Data viewer endpoint - returns all current data in the system.
 * GET: ?view=events|attendees|registrations (default: all)
 * DELETE: { type: 'event'|'attendee'|'registration', id: number }
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') || 'all'

    const events = dataStore.getEvents()
    const attendees = dataStore.getAttendees()
    const registrations = dataStore.getRegistrations()
    const cohorts = dataStore.getCohorts()

    if (view === 'events') {
      return Response.json({
        type: 'events',
        count: events.length,
        data: events.map(e => ({
          id: e.id,
          name: e.name,
          type: e.eventType,
          date: e.startDate.split('T')[0],
          location: e.location,
          capacity: e.capacity,
          registered: registrations.filter(r => r.eventId === e.id).length,
          attended: registrations.filter(r => r.eventId === e.id && r.attended).length,
        }))
      })
    }

    if (view === 'attendees') {
      return Response.json({
        type: 'attendees',
        count: attendees.length,
        data: attendees.map(a => {
          const cohort = cohorts.find(c => c.id === a.cohortId)
          const regs = registrations.filter(r => r.attendeeId === a.id)
          return {
            id: a.id,
            name: a.fullName,
            email: a.email,
            cohort: cohort?.name || `Cohort ${a.cohortId}`,
            location: a.location,
            status: a.status,
            eventsRegistered: regs.length,
            eventsAttended: regs.filter(r => r.attended).length,
          }
        })
      })
    }

    if (view === 'registrations') {
      return Response.json({
        type: 'registrations',
        count: registrations.length,
        data: registrations.map(r => {
          const event = events.find(e => e.id === r.eventId)
          const attendee = attendees.find(a => a.id === r.attendeeId)
          return {
            id: r.id,
            event: event?.name || 'Unknown',
            attendee: attendee?.fullName || 'Unknown',
            email: attendee?.email || '',
            attended: r.attended,
            registeredAt: r.registeredAt.split('T')[0],
          }
        })
      })
    }

    // All view - return summary counts + recent data
    return Response.json({
      type: 'all',
      counts: {
        events: events.length,
        attendees: attendees.length,
        registrations: registrations.length,
        cohorts: cohorts.length,
      },
      recentEvents: events.slice(-5).map(e => ({
        id: e.id,
        name: e.name,
        type: e.eventType,
        date: e.startDate.split('T')[0],
        location: e.location,
      })),
      recentAttendees: attendees.slice(-5).map(a => ({
        id: a.id,
        name: a.fullName,
        email: a.email,
        cohort: cohorts.find(c => c.id === a.cohortId)?.name || `Cohort ${a.cohortId}`,
      })),
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { type, id } = body

    if (!type || !id) {
      return Response.json({ error: 'Missing type or id' }, { status: 400 })
    }

    let success = false
    let message = ''

    switch (type) {
      case 'event': {
        const event = dataStore.getEventById(id)
        if (!event) {
          return Response.json({ error: 'Event not found' }, { status: 404 })
        }
        const regCount = dataStore.getRegistrationsByEvent(id).length
        success = dataStore.deleteEvent(id)
        message = `Deleted event "${event.name}" and ${regCount} associated registration(s).`
        break
      }
      case 'attendee': {
        const attendee = dataStore.getAttendeeById(id)
        if (!attendee) {
          return Response.json({ error: 'Attendee not found' }, { status: 404 })
        }
        const regCount = dataStore.getRegistrationsByAttendee(id).length
        success = dataStore.deleteAttendee(id)
        message = `Deleted attendee "${attendee.fullName}" and ${regCount} associated registration(s).`
        break
      }
      case 'registration': {
        success = dataStore.deleteRegistration(id)
        message = success ? `Deleted registration #${id}.` : 'Registration not found.'
        break
      }
      default:
        return Response.json({ error: 'Invalid type. Use: event, attendee, or registration' }, { status: 400 })
    }

    if (!success) {
      return Response.json({ error: 'Item not found' }, { status: 404 })
    }

    return Response.json({ success: true, message })
  } catch (error) {
    console.error('Error deleting data:', error)
    return Response.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
