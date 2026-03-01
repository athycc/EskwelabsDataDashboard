import { dataStore } from '@/lib/data-store'

/**
 * CSV Upload endpoint for adding new event attendance data.
 * Accepts CSV with columns: event_name, event_type, event_date, location, capacity, attendee_name, attendee_email, cohort, attended
 * No external services needed.
 */

interface CSVRow {
  event_name: string
  event_type: string
  event_date: string
  location: string
  capacity: string
  attendee_name: string
  attendee_email: string
  cohort: string
  attended: string
}

// Map flexible header names to canonical column names
const HEADER_ALIASES: Record<string, string> = {
  event_name: 'event_name', eventname: 'event_name', 'event name': 'event_name', name: 'event_name', event: 'event_name',
  event_type: 'event_type', eventtype: 'event_type', 'event type': 'event_type', type: 'event_type',
  event_date: 'event_date', eventdate: 'event_date', 'event date': 'event_date', date: 'event_date',
  location: 'location', venue: 'location', place: 'location',
  capacity: 'capacity', cap: 'capacity', max: 'capacity',
  attendee_name: 'attendee_name', attendeename: 'attendee_name', 'attendee name': 'attendee_name', 'full name': 'attendee_name', fullname: 'attendee_name', full_name: 'attendee_name', attendee: 'attendee_name',
  attendee_email: 'attendee_email', attendeeemail: 'attendee_email', 'attendee email': 'attendee_email', email: 'attendee_email',
  cohort: 'cohort', cohort_name: 'cohort', cohortname: 'cohort', batch: 'cohort', group: 'cohort',
  attended: 'attended', present: 'attended', showed_up: 'attended', 'showed up': 'attended', status: 'attended',
}

function normalizeHeader(h: string): string {
  const cleaned = h.trim().toLowerCase().replace(/['"]/g, '').replace(/\s+/g, '_')
  return HEADER_ALIASES[cleaned] || HEADER_ALIASES[cleaned.replace(/_/g, '')] || HEADER_ALIASES[cleaned.replace(/_/g, ' ')] || cleaned
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"' && (i === 0 || line[i - 1] !== '\\')) {
      inQuote = !inQuote
    } else if (ch === ',' && !inQuote) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

function parseCSV(text: string): { rows: CSVRow[], rawHeaders: string[], normalizedHeaders: string[] } {
  // Handle BOM and normalize line endings
  const cleaned = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = cleaned.trim().split('\n').filter(l => l.trim().length > 0)
  if (lines.length < 2) return { rows: [], rawHeaders: [], normalizedHeaders: [] }

  const rawHeaders = parseCSVLine(lines[0])
  const normalizedHeaders = rawHeaders.map(normalizeHeader)
  const rows: CSVRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === 0) continue

    const row: any = {}
    normalizedHeaders.forEach((h, idx) => {
      row[h] = (values[idx] || '').replace(/^"|"$/g, '')
    })
    rows.push(row)
  }

  return { rows, rawHeaders, normalizedHeaders }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.csv')) {
      return Response.json({ error: 'File must be a CSV' }, { status: 400 })
    }

    const text = await file.text()
    const { rows, rawHeaders, normalizedHeaders } = parseCSV(text)

    if (rows.length === 0) {
      return Response.json({ 
        error: 'CSV file is empty or has invalid format. Make sure it has a header row and at least one data row.',
        detectedHeaders: rawHeaders
      }, { status: 400 })
    }

    // Check if event_name column was detected
    const hasEventName = normalizedHeaders.includes('event_name')
    if (!hasEventName) {
      return Response.json({
        error: `Could not find an "event_name" column. Detected columns: ${rawHeaders.join(', ')}. Please rename your event column to one of: event_name, name, event`,
        detectedHeaders: rawHeaders
      }, { status: 400 })
    }

    // Extract unique event names from CSV
    const csvEventNames = new Set<string>()
    for (const row of rows) {
      const name = (row.event_name || '').trim()
      if (name) csvEventNames.add(name)
    }

    // Check for duplicate events against existing data
    const existingEvents = dataStore.getEvents()
    const duplicateEvents: string[] = []
    const newEvents: string[] = []
    for (const csvName of csvEventNames) {
      const match = existingEvents.find(e => e.name.trim().toLowerCase() === csvName.toLowerCase())
      if (match) {
        duplicateEvents.push(csvName)
      } else {
        newEvents.push(csvName)
      }
    }

    // Check for validate-only mode (pre-check before actual upload)
    const url = new URL(request.url)
    const validateOnly = url.searchParams.get('validate') === 'true'

    if (validateOnly) {
      return Response.json({
        valid: true,
        totalRows: rows.length,
        eventsInCSV: csvEventNames.size,
        duplicateEvents,
        newEvents,
        detectedHeaders: rawHeaders,
        allDuplicate: duplicateEvents.length > 0 && newEvents.length === 0
      })
    }

    // If ALL events in the CSV already exist, reject the upload
    if (duplicateEvents.length > 0 && newEvents.length === 0) {
      // Check if there are any new attendees or registrations
      let hasNewData = false
      for (const [eventName, eventRows] of [...new Map(rows.map(r => [(r.event_name || '').trim(), r])).entries()].length ? [] : []) {
        // Will be checked below
      }
      
      // Do a deeper check: even if events exist, there might be new attendees/registrations
      let potentialNewAttendees = 0
      let potentialNewRegistrations = 0
      
      for (const row of rows) {
        const eventName = (row.event_name || '').trim()
        if (!eventName) continue
        
        const event = existingEvents.find(e => e.name.trim().toLowerCase() === eventName.toLowerCase())
        if (!event) continue

        // Check if attendee exists
        const attendeeExists = row.attendee_email
          ? dataStore.getAttendeeByEmail(row.attendee_email.trim().toLowerCase()) ||
            dataStore.getAttendees().find(a => a.email.toLowerCase() === row.attendee_email.trim().toLowerCase())
          : dataStore.getAttendees().find(a => a.fullName.toLowerCase() === (row.attendee_name || '').trim().toLowerCase())
        
        if (!attendeeExists) {
          potentialNewAttendees++
          potentialNewRegistrations++
        } else {
          // Check if registration exists
          const existingReg = dataStore.getRegistrationsByEvent(event.id)
            .find(r => r.attendeeId === attendeeExists.id)
          if (!existingReg) potentialNewRegistrations++
        }
      }

      if (potentialNewAttendees === 0 && potentialNewRegistrations === 0) {
        return Response.json({
          error: `This file contains only duplicate data. All ${duplicateEvents.length} event(s) already exist in the dashboard: ${duplicateEvents.join(', ')}. All attendees and registrations also already exist. Please upload a CSV with new event data.`,
          detectedHeaders: rawHeaders,
          duplicateEvents
        }, { status: 409 })
      }
    }

    let eventsAdded = 0
    let attendeesAdded = 0
    let registrationsAdded = 0
    const errors: string[] = []
    const skipped: string[] = []
    let eventsExisting = 0
    let attendeesExisting = 0
    let registrationsExisting = 0

    // Group by event
    const eventMap = new Map<string, CSVRow[]>()
    for (const row of rows) {
      const key = (row.event_name || '').trim()
      if (!key) {
        errors.push(`Row skipped: missing event_name`)
        continue
      }
      if (!eventMap.has(key)) eventMap.set(key, [])
      eventMap.get(key)!.push(row)
    }

    for (const [eventName, eventRows] of eventMap) {
      const firstRow = eventRows[0]

      // Find or create event (case-insensitive match, trimmed)
      let event = dataStore.getEvents().find(e => e.name.trim().toLowerCase() === eventName.toLowerCase())
      if (!event) {
        event = dataStore.addEvent({
          name: eventName,
          eventType: firstRow.event_type || 'workshop',
          startDate: firstRow.event_date ? new Date(firstRow.event_date).toISOString() : new Date().toISOString(),
          endDate: firstRow.event_date ? new Date(new Date(firstRow.event_date).getTime() + 8 * 3600000).toISOString() : new Date().toISOString(),
          location: firstRow.location || 'Online',
          capacity: parseInt(firstRow.capacity) || 50
        })
        eventsAdded++
      } else {
        eventsExisting++
        skipped.push(`Event "${eventName}" already exists (matched existing event)`)
      }

      for (const row of eventRows) {
        if (!row.attendee_email && !row.attendee_name) {
          errors.push(`Row skipped for "${eventName}": missing attendee info`)
          continue
        }

        // Find or create attendee (case-insensitive email match)
        let attendee = row.attendee_email
          ? dataStore.getAttendeeByEmail(row.attendee_email.trim().toLowerCase()) ||
            dataStore.getAttendees().find(a => a.email.toLowerCase() === row.attendee_email.trim().toLowerCase())
          : dataStore.getAttendees().find(a => a.fullName.toLowerCase() === (row.attendee_name || '').trim().toLowerCase())

        if (!attendee) {
          // Parse cohort number
          let cohortId = 1
          const cohortMatch = (row.cohort || '').match(/(\d+)/)
          if (cohortMatch) cohortId = Math.min(parseInt(cohortMatch[1]), 5)

          attendee = dataStore.addAttendee({
            email: row.attendee_email || `${(row.attendee_name || 'unknown').toLowerCase().replace(/\s+/g, '.')}@eskwelabs.com`,
            fullName: row.attendee_name || row.attendee_email?.split('@')[0] || 'Unknown',
            cohortId,
            location: row.location || 'Manila',
            status: 'active',
            registrationDate: new Date().toISOString()
          })
          attendeesAdded++
        } else {
          attendeesExisting++
        }

        // Check if registration already exists
        const existingReg = dataStore.getRegistrationsByEvent(event.id)
          .find(r => r.attendeeId === attendee!.id)
        
        if (!existingReg) {
          const attended = ['true', 'yes', '1', 'y'].includes((row.attended || '').toLowerCase())
          dataStore.addRegistration({
            eventId: event.id,
            attendeeId: attendee.id,
            registeredAt: new Date().toISOString(),
            attended,
            checkInTime: attended ? new Date().toISOString() : null
          })
          registrationsAdded++
        } else {
          registrationsExisting++
          skipped.push(`Registration for "${row.attendee_name || row.attendee_email}" at "${eventName}" already exists`)
        }
      }
    }

    const totalProcessed = rows.length
    const totalNew = eventsAdded + attendeesAdded + registrationsAdded
    const totalSkipped = eventsExisting + attendeesExisting + registrationsExisting

    let message = ''
    if (totalNew > 0) {
      message = `Upload complete: ${eventsAdded} new events, ${attendeesAdded} new attendees, ${registrationsAdded} new registrations added.`
    } else if (totalSkipped > 0) {
      message = `All ${totalProcessed} rows matched existing data. No new records were added because the events, attendees, and registrations already exist in the dashboard.`
    } else {
      message = `Upload processed but no valid data rows were found.`
    }

    return Response.json({
      success: true,
      message,
      summary: { eventsAdded, attendeesAdded, registrationsAdded },
      processed: {
        totalRows: totalProcessed,
        eventsInCSV: eventMap.size,
        eventsExisting,
        attendeesExisting,
        registrationsExisting
      },
      detectedHeaders: rawHeaders,
      skipped: skipped.length > 0 ? skipped.slice(0, 15) : undefined,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined
    })
  } catch (error) {
    console.error('Error processing CSV upload:', error)
    return Response.json({ error: 'Failed to process CSV file' }, { status: 500 })
  }
}
