import { dataStore } from '@/lib/data-store'
import type { FilterParams } from '@/lib/data-store'

/**
 * CONSOLIDATED API ROUTE
 * All dashboard operations go through this single endpoint so they share
 * the same serverless function instance on Vercel (same in-memory DataStore).
 * 
 * POST /api/dashboard { action: "stats"|"data"|"demographics"|"attendance-trends"|"events"|"no-shows"|"ai-insights"|"chat"|"upload"|"delete", ... }
 */

// ============ HELPERS ============

function extractFilters(body: Record<string, unknown>): FilterParams {
  return {
    dateRange: (body.dateRange as FilterParams['dateRange']) || 'all',
    eventType: (body.eventType as string) || 'all',
    cohort: (body.cohort as string) || 'all',
    location: (body.location as string) || 'all',
  }
}

// ============ AI INSIGHTS (rule-based) ============

function generateInsights(): string {
  const stats = dataStore.getStats()
  const noShows = dataStore.getNoShows(5)
  const eventStats = dataStore.getEventsWithStats(20)
  const cohortDemo = dataStore.getDemographicsByCohort()
  const locationDemo = dataStore.getDemographicsByLocation()

  const avgRate = parseFloat(stats.averageAttendanceRate)
  const bestEvent = eventStats.reduce((best, e) => e.attendanceRate > best.attendanceRate ? e : best, eventStats[0])
  const worstEvent = eventStats.reduce((worst, e) => e.attendanceRate < worst.attendanceRate ? e : worst, eventStats[0])

  const typeMap = new Map<string, { attended: number; registered: number }>()
  for (const e of eventStats) {
    const cur = typeMap.get(e.type) || { attended: 0, registered: 0 }
    cur.attended += e.attended
    cur.registered += e.registered
    typeMap.set(e.type, cur)
  }
  const typeRates = Array.from(typeMap.entries()).map(([type, data]) => ({
    type,
    rate: data.registered > 0 ? ((data.attended / data.registered) * 100).toFixed(1) : '0'
  })).sort((a, b) => parseFloat(b.rate) - parseFloat(a.rate))

  const bestType = typeRates[0]
  const worstType = typeRates[typeRates.length - 1]
  const topLocation = locationDemo[0]
  const mostActiveCohort = cohortDemo.reduce((best, c) =>
    c.attended_events > best.attended_events ? c : best, cohortDemo[0])
  const totalNoShows = noShows.reduce((sum, n) => sum + n.noShowCount, 0)

  return `Key Insights
─────────────

1. Overall Performance: The average attendance rate across ${stats.totalEvents} events is ${avgRate}%. ${avgRate >= 70 ? 'This is a strong rate, indicating good engagement.' : avgRate >= 50 ? 'There is room for improvement in overall attendance.' : 'Attendance rates are concerning and need immediate attention.'}

2. Best Performing Event: "${bestEvent.name}" achieved a ${bestEvent.attendanceRate}% attendance rate with ${bestEvent.attended}/${bestEvent.registered} attendees.

3. Event Type Trends: ${bestType.type.charAt(0).toUpperCase() + bestType.type.slice(1)}s have the highest attendance rate at ${bestType.rate}%, while ${worstType.type}s are lowest at ${worstType.rate}%.

4. Geographic Distribution: ${topLocation.location} has the most attendees (${topLocation.total_attendees}) with ${topLocation.active} currently active.

5. Cohort Engagement: ${mostActiveCohort.name} is the most engaged cohort with ${mostActiveCohort.attended_events} total event attendances.


Recommendations
────────────────

1. ${worstEvent.attendanceRate < 60 ? `Focus on improving "${worstEvent.name}" — with only ${worstEvent.attendanceRate}% attendance, consider rescheduling or reformatting.` : 'All events are performing reasonably well. Continue current strategies.'}

2. ${totalNoShows > 10 ? `Address the ${totalNoShows} total no-shows across top events. Consider sending reminder emails 24 hours and 1 hour before events.` : 'No-show rates are manageable. Maintain current reminder systems.'}

3. ${worstType.type.charAt(0).toUpperCase() + worstType.type.slice(1)}s have the lowest attendance (${worstType.rate}%). Consider making them more interactive or offering them in hybrid format.

4. Leverage ${topLocation.location}'s strong presence for in-person events, while ensuring online options for remote participants.


Issues to Monitor
──────────────────

1. ${noShows.length > 0 ? `Top no-show event: "${noShows[0].eventName}" with ${noShows[0].noShowCount} no-shows (${noShows[0].noShowRate}% rate).` : 'No significant no-show patterns detected.'}

2. ${cohortDemo.filter(c => c.inactive > 0).length > 0 ? `${cohortDemo.reduce((sum, c) => sum + c.inactive, 0)} inactive member(s) detected across cohorts — consider re-engagement campaigns.` : 'All cohort members are active or graduated.'}

3. Total of ${stats.totalRegistrations} registrations across ${stats.totalEvents} events (avg ${(parseInt(stats.totalRegistrations.toString()) / parseInt(stats.totalEvents.toString())).toFixed(1)} per event).`
}

// ============ CHAT (rule-based) ============

function processChat(message: string): string {
  const msg = message.toLowerCase().trim()
  const stats = dataStore.getStats()
  const eventStats = dataStore.getEventsWithStats(20)
  const noShows = dataStore.getNoShows(10)
  const cohortDemo = dataStore.getDemographicsByCohort()
  const locationDemo = dataStore.getDemographicsByLocation()
  const statusDemo = dataStore.getDemographicsByStatus()

  if (msg.match(/^(hi|hello|hey|good\s*(morning|afternoon|evening)|greetings|yo|sup)/)) {
    return ['Hello! I\'m the ESKWELABS Dashboard Assistant.', '', 'I can help you with:', '  - Overall statistics and summaries', '  - Event performance and comparisons', '  - Attendance rates and trends', '  - No-show analysis', '  - Cohort breakdowns (Cohort 1-5)', '  - Attendee demographics', '  - Location data', '  - ESKWELABS program info', '  - Recommendations for improvement', '', 'What would you like to know?'].join('\n')
  }

  if (msg.match(/^(help|what can you do|about|commands|options|menu|features)/)) {
    return ['I can answer questions about the ESKWELABS dashboard data:', '', '  Stats & Overview - totals, averages, registrations', '  Event Performance - best/worst events, by type', '  No-Shows - patterns, rates, problem events', '  Cohorts - performance per cohort (1-5)', '  Demographics - status, location, breakdown', '  Locations - attendance by city/venue', '  Data in System - what data is being tracked', '  ESKWELABS Programs - course/program info', '  Recommendations - tips to improve attendance', '', 'Just ask in plain language!'].join('\n')
  }

  if (msg.match(/(what|which)\s*(type|kind|sort).*data|what.*found|what.*track|what.*info|what.*stored|what.*have|what.*contain|data.*available|data.*system/)) {
    return ['The dashboard tracks the following data:', '', `Events: ${stats.totalEvents} events total`, '  Each event has: name, type (workshop/webinar/meetup/bootcamp/conference), date, location, capacity', '', `Attendees: ${stats.totalAttendees} people total`, '  Each attendee has: name, email, cohort, location, status (active/graduated/inactive)', '', `Registrations: ${stats.totalRegistrations} records total`, '  Links attendees to events, tracking whether they attended or were a no-show', '', `Cohorts: 5 cohorts (Cohort 1 through Cohort 5)`, '', 'You can also upload new data via CSV in the Upload section above.'].join('\n')
  }

  if (msg.match(/(overall|summary|overview|stats|statistic|dashboard|how many|total|count|number)/)) {
    const avgRate = parseFloat(stats.averageAttendanceRate)
    const avgPerEvent = (parseInt(stats.totalRegistrations.toString()) / parseInt(stats.totalEvents.toString())).toFixed(1)
    const assessment = avgRate >= 70 ? 'Overall attendance is strong.' : avgRate >= 50 ? 'Attendance is moderate - there\'s room for improvement.' : 'Attendance needs attention.'
    return ['Dashboard Overview', '─────────────────', `Total Events: ${stats.totalEvents}`, `Total Attendees: ${stats.totalAttendees}`, `Total Registrations: ${stats.totalRegistrations}`, `Average Attendance Rate: ${stats.averageAttendanceRate}%`, `Average Registrations per Event: ${avgPerEvent}`, '', assessment].join('\n')
  }

  if (msg.match(/(best|top|highest|most attended|popular|great)\s*(event|performing|attendance|rated)?/)) {
    const sorted = [...eventStats].sort((a, b) => b.attendanceRate - a.attendanceRate)
    const top5 = sorted.slice(0, 5)
    return ['Top Performing Events', '─────────────────────', ...top5.map((e, i) => `${i + 1}. ${e.name} — ${e.attendanceRate}% (${e.attended}/${e.registered}), ${e.type}, ${e.location}`), '', `The best event is "${top5[0].name}" with ${top5[0].attendanceRate}% attendance.`].join('\n')
  }

  if (msg.match(/(worst|lowest|least|poor|bad|weak|struggling)\s*(event|performing|attendance|rated)?/)) {
    const sorted = [...eventStats].sort((a, b) => a.attendanceRate - b.attendanceRate)
    const bottom5 = sorted.slice(0, 5)
    return ['Events Needing Improvement', '──────────────────────────', ...bottom5.map((e, i) => `${i + 1}. ${e.name} — ${e.attendanceRate}% (${e.attended}/${e.registered}), ${e.type}, ${e.location}`), '', 'Tip: Consider rescheduling, reformatting, or improving content for these events.'].join('\n')
  }

  if (msg.match(/(no.?show|absent|miss|didn.?t (come|attend|show)|skipped|not.*attend)/)) {
    const totalNoShows = noShows.reduce((sum, n) => sum + n.noShowCount, 0)
    return ['No-Show Analysis', '────────────────', `Total no-shows across tracked events: ${totalNoShows}`, '', 'Events with highest no-show rates:', ...noShows.slice(0, 5).map((n, i) => `  ${i + 1}. ${n.eventName} — ${n.noShowCount}/${n.totalRegistered} no-shows (${n.noShowRate}%)`), '', 'Recommendations:', '  - Send reminder emails 24h and 1h before events', '  - Implement a waitlist to fill empty spots', '  - Follow up with no-shows to understand their reasons'].join('\n')
  }

  const cohortMatch = msg.match(/cohort\s*(\d+)/)
  if (cohortMatch) {
    const cohortNum = parseInt(cohortMatch[1])
    const cohort = cohortDemo.find(c => c.name === `Cohort ${cohortNum}`)
    if (cohort) {
      const avgEvents = cohort.total_attendees > 0 ? (cohort.attended_events / cohort.total_attendees).toFixed(1) : '0'
      const note = cohort.inactive > 0 ? `Note: ${cohort.inactive} inactive member(s) — consider a re-engagement campaign.` : 'All members are active or graduated.'
      return [`Cohort ${cohortNum} Details`, '────────────────', `Total Members: ${cohort.total_attendees}`, `  Active: ${cohort.active}`, `  Graduated: ${cohort.graduated}`, `  Inactive: ${cohort.inactive}`, `Event Attendances: ${cohort.attended_events}`, `Avg Events per Member: ${avgEvents}`, '', note].join('\n')
    }
    return `I don't have data for Cohort ${cohortNum}. The available cohorts are Cohort 1 through Cohort 5.`
  }

  if (msg.match(/(cohort|cohorts|all cohort|each cohort|batch)/)) {
    const mostEngaged = cohortDemo.reduce((best, c) => c.attended_events > best.attended_events ? c : best, cohortDemo[0])
    return ['Cohort Overview', '───────────────', ...cohortDemo.map(c => `${c.name}: ${c.total_attendees} members (${c.active} active, ${c.graduated} graduated, ${c.inactive} inactive) — ${c.attended_events} event attendances`), '', `Most engaged: ${mostEngaged.name} with ${mostEngaged.attended_events} total attendances.`].join('\n')
  }

  if (msg.match(/(demographic|people|attendee|member|who|profile|breakdown|distribut)/)) {
    return ['Attendee Demographics', '─────────────────────', '', 'By Status:', ...statusDemo.map(s => `  ${s.status.charAt(0).toUpperCase() + s.status.slice(1)}: ${s.count}`), '', 'By Location (top 5):', ...locationDemo.slice(0, 5).map(l => `  ${l.location}: ${l.total_attendees} attendees (${l.active} active)`), '', 'By Cohort:', ...cohortDemo.map(c => `  ${c.name}: ${c.total_attendees} members`), '', `Total unique attendees: ${stats.totalAttendees}`].join('\n')
  }

  if (msg.match(/(location|where|city|cities|manila|makati|online|cebu|davao|pasig|venue|place)/)) {
    return ['Location Breakdown', '──────────────────', ...locationDemo.map(l => `${l.location}: ${l.total_attendees} attendees (${l.active} active, ${l.graduated} grad, ${l.inactive} inactive) — ${l.attended_events} attendances`), '', `Top location: ${locationDemo[0].location} with ${locationDemo[0].total_attendees} attendees.`].join('\n')
  }

  if (msg.match(/(event type|type|compare|comparison|workshop|webinar|meetup|bootcamp|conference|versus|vs)/)) {
    const typeMap = new Map<string, { count: number; attended: number; registered: number }>()
    for (const e of eventStats) {
      const cur = typeMap.get(e.type) || { count: 0, attended: 0, registered: 0 }
      cur.count++; cur.attended += e.attended; cur.registered += e.registered
      typeMap.set(e.type, cur)
    }
    const types = Array.from(typeMap.entries()).map(([type, d]) => ({ type: type.charAt(0).toUpperCase() + type.slice(1), count: d.count, rate: d.registered > 0 ? ((d.attended / d.registered) * 100).toFixed(1) : '0', attended: d.attended, registered: d.registered })).sort((a, b) => parseFloat(b.rate) - parseFloat(a.rate))
    return ['Event Type Comparison', '─────────────────────', ...types.map(t => `${t.type}: ${t.count} events, ${t.attended}/${t.registered} attended (${t.rate}%)`), '', `Best type: ${types[0].type} (${types[0].rate}% attendance)`, `Needs improvement: ${types[types.length - 1].type} (${types[types.length - 1].rate}%)`].join('\n')
  }

  if (msg.match(/(eskwelabs|program|course|fellowship|about.*eskwelabs|what.*eskwelabs)/)) {
    return ['About ESKWELABS', '───────────────', 'ESKWELABS is a leading Philippine-based data science education platform offering intensive cohort-based programs.', '', 'Programs:', '  Data Science Fellowship — Python, statistics, machine learning, deep learning', '  Data Analytics Bootcamp — SQL, Tableau, Excel, business intelligence', '  Data Engineering Bootcamp — ETL, cloud pipelines, data warehousing', '', 'Key facts:', '  - Based in the Philippines', '  - Cohort-based learning (Cohort 1, 2, 3...)', '  - Industry-relevant curriculum', '  - Website: https://www.eskwelabs.com/', '', 'This dashboard tracks attendance across ESKWELABS events and cohorts.'].join('\n')
  }

  if (msg.match(/(recommend|improve|suggestion|advice|what should|how to|tips|fix|increase|boost)/)) {
    const avgRate = parseFloat(stats.averageAttendanceRate)
    const topNoShow = noShows[0]
    return ['Recommendations to Improve Attendance', '──────────────────────────────────────', '', '1. Pre-Event Reminders', '   Send automated emails 24h and 1h before events — this typically reduces no-shows by 15-20%.', '', '2. Optimize Scheduling', avgRate < 70 ? `   Current average is ${avgRate}%. Analyze which time slots and days get the best attendance.` : `   Current average is ${avgRate}%, which is solid. Maintain your scheduling approach.`, '', '3. Address No-Shows', topNoShow ? `   "${topNoShow.eventName}" has a ${topNoShow.noShowRate}% no-show rate. Survey non-attendees for feedback.` : '   No-show rates are manageable.', '', '4. Content Quality', '   Gather post-event feedback and iterate on topics that drive higher attendance.', '', '5. Engagement', '   Use interactive elements like polls, Q&A, and breakout rooms — especially for webinars.', '', '6. Follow-up', '   Share recordings and materials with all registrants to keep them engaged for future events.'].join('\n')
  }

  if (msg.match(/(attendance rate|rate|percentage|ratio)/)) {
    const totalAttended = eventStats.reduce((sum, e) => sum + e.attended, 0)
    const sorted = [...eventStats].sort((a, b) => b.attendanceRate - a.attendanceRate)
    return ['Attendance Rate Analysis', '───────────────────────', `Overall Average: ${stats.averageAttendanceRate}%`, `Total Registrations: ${stats.totalRegistrations}`, `Total Attended: ${totalAttended}`, '', 'Top 5 events by attendance rate:', ...sorted.slice(0, 5).map((e, i) => `  ${i + 1}. ${e.name}: ${e.attendanceRate}%`), '', parseFloat(stats.averageAttendanceRate) >= 70 ? 'Overall attendance is strong.' : 'Consider implementing reminder systems to boost attendance.'].join('\n')
  }

  if (msg.match(/(tell me about|info on|details|about)\s+(the\s+)?event/i) || msg.match(/(event|events)\s+(list|all|details)/)) {
    const top = eventStats.slice(0, 10)
    return [`Events in the System (${stats.totalEvents} total)`, '─────────────────────────────────', ...top.map((e, i) => `${i + 1}. ${e.name} — ${e.type}, ${e.date}, ${e.location}, ${e.attended}/${e.registered} attended (${e.attendanceRate}%)`), '', top.length < eventStats.length ? `Showing top ${top.length} of ${eventStats.length}. Ask about a specific event type for more detail.` : ''].join('\n')
  }

  if (msg.match(/(thank|thanks|thx|appreciate|great|awesome|nice|good job|well done)/)) {
    return 'You\'re welcome! If you have more questions about the dashboard data, feel free to ask anytime.'
  }

  return [`I'm not sure how to answer "${message}" specifically, but here's a quick summary:`, '', `The dashboard currently tracks ${stats.totalEvents} events, ${stats.totalAttendees} attendees, and ${stats.totalRegistrations} registrations with an average attendance rate of ${stats.averageAttendanceRate}%.`, '', 'Try asking things like:', '  "What are the overall stats?"', '  "Show me no-show data"', '  "How is Cohort 1 doing?"', '  "Compare event types"', '  "What are the demographics?"', '  "Which event has the best attendance?"', '  "What type of data is in the system?"', '  "Give me recommendations"'].join('\n')
}

// ============ CSV PARSING ============

interface CSVRow {
  event_name: string; event_type: string; event_date: string; location: string
  capacity: string; attendee_name: string; attendee_email: string; cohort: string; attended: string
}

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
  const result: string[] = []; let current = ''; let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"' && (i === 0 || line[i - 1] !== '\\')) { inQuote = !inQuote }
    else if (ch === ',' && !inQuote) { result.push(current.trim()); current = '' }
    else { current += ch }
  }
  result.push(current.trim()); return result
}

function parseCSV(text: string): { rows: CSVRow[], rawHeaders: string[], normalizedHeaders: string[] } {
  const cleaned = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = cleaned.trim().split('\n').filter(l => l.trim().length > 0)
  if (lines.length < 2) return { rows: [], rawHeaders: [], normalizedHeaders: [] }
  const rawHeaders = parseCSVLine(lines[0])
  const normalizedHeaders = rawHeaders.map(normalizeHeader)
  const rows: CSVRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === 0) continue
    const row: Record<string, string> = {}
    normalizedHeaders.forEach((h, idx) => { row[h] = (values[idx] || '').replace(/^"|"$/g, '') })
    rows.push(row as unknown as CSVRow)
  }
  return { rows, rawHeaders, normalizedHeaders }
}

// ============ ACTION HANDLERS ============

function handleStats(body: Record<string, unknown>) {
  const filters = extractFilters(body)
  return Response.json(dataStore.getStats(filters))
}

function handleData(body: Record<string, unknown>) {
  const view = (body.view as string) || 'all'
  const events = dataStore.getEvents()
  const attendees = dataStore.getAttendees()
  const registrations = dataStore.getRegistrations()
  const cohorts = dataStore.getCohorts()

  if (view === 'events') {
    return Response.json({
      type: 'events', count: events.length,
      data: events.map(e => ({
        id: e.id, name: e.name, type: e.eventType, date: e.startDate.split('T')[0],
        location: e.location, capacity: e.capacity,
        registered: registrations.filter(r => r.eventId === e.id).length,
        attended: registrations.filter(r => r.eventId === e.id && r.attended).length,
      }))
    })
  }
  if (view === 'attendees') {
    return Response.json({
      type: 'attendees', count: attendees.length,
      data: attendees.map(a => {
        const cohort = cohorts.find(c => c.id === a.cohortId)
        const regs = registrations.filter(r => r.attendeeId === a.id)
        return {
          id: a.id, name: a.fullName, email: a.email,
          cohort: cohort?.name || `Cohort ${a.cohortId}`, location: a.location, status: a.status,
          eventsRegistered: regs.length, eventsAttended: regs.filter(r => r.attended).length,
        }
      })
    })
  }
  if (view === 'registrations') {
    return Response.json({
      type: 'registrations', count: registrations.length,
      data: registrations.map(r => {
        const event = events.find(e => e.id === r.eventId)
        const attendee = attendees.find(a => a.id === r.attendeeId)
        return {
          id: r.id, event: event?.name || 'Unknown', attendee: attendee?.fullName || 'Unknown',
          email: attendee?.email || '', attended: r.attended, registeredAt: r.registeredAt.split('T')[0],
        }
      })
    })
  }
  return Response.json({
    type: 'all',
    counts: { events: events.length, attendees: attendees.length, registrations: registrations.length, cohorts: cohorts.length },
    recentEvents: events.slice(-5).map(e => ({ id: e.id, name: e.name, type: e.eventType, date: e.startDate.split('T')[0], location: e.location })),
    recentAttendees: attendees.slice(-5).map(a => ({ id: a.id, name: a.fullName, email: a.email, cohort: cohorts.find(c => c.id === a.cohortId)?.name || `Cohort ${a.cohortId}` })),
  })
}

function handleDelete(body: Record<string, unknown>) {
  const { type, id } = body as { type: string; id: number }
  if (!type || !id) return Response.json({ error: 'Missing type or id' }, { status: 400 })

  let success = false; let message = ''; let identifier = ''
  switch (type) {
    case 'event': {
      const event = dataStore.getEventById(id)
      if (!event) return Response.json({ error: 'Event not found' }, { status: 404 })
      identifier = event.name
      const regCount = dataStore.getRegistrationsByEvent(id).length
      success = dataStore.deleteEvent(id)
      message = `Deleted event "${event.name}" and ${regCount} associated registration(s).`
      break
    }
    case 'attendee': {
      const attendee = dataStore.getAttendeeById(id)
      if (!attendee) return Response.json({ error: 'Attendee not found' }, { status: 404 })
      identifier = attendee.email
      const regCount = dataStore.getRegistrationsByAttendee(id).length
      success = dataStore.deleteAttendee(id)
      message = `Deleted attendee "${attendee.fullName}" and ${regCount} associated registration(s).`
      break
    }
    case 'registration': {
      const reg = dataStore.getRegistrations().find(r => r.id === id)
      if (reg) {
        const event = dataStore.getEventById(reg.eventId)
        const attendee = dataStore.getAttendeeById(reg.attendeeId)
        identifier = `${event?.name || ''}|${attendee?.email || ''}`
      }
      success = dataStore.deleteRegistration(id)
      message = success ? `Deleted registration #${id}.` : 'Registration not found.'
      break
    }
    default:
      return Response.json({ error: 'Invalid type' }, { status: 400 })
  }
  if (!success) return Response.json({ error: 'Item not found' }, { status: 404 })
  return Response.json({ success: true, message, identifier })
}

function handleDemographics(body: Record<string, unknown>) {
  const type = (body.type as string) || 'cohort'
  const filters = extractFilters(body)
  if (type === 'location') return Response.json(dataStore.getDemographicsByLocation(filters))
  if (type === 'status') return Response.json(dataStore.getDemographicsByStatus(filters))
  return Response.json(dataStore.getDemographicsByCohort(filters))
}

function handleAttendanceTrends(body: Record<string, unknown>) {
  const filters = extractFilters(body)
  return Response.json(dataStore.getAttendanceTrends(filters))
}

function handleEvents(body: Record<string, unknown>) {
  const limit = parseInt((body.limit as string) || '20')
  const filters = extractFilters(body)
  return Response.json(dataStore.getEventsWithStats(limit, filters))
}

function handleNoShows(body: Record<string, unknown>) {
  const limit = parseInt((body.limit as string) || '10')
  const filters = extractFilters(body)
  return Response.json(dataStore.getNoShows(limit, filters))
}

function handleAiInsights() {
  try {
    return Response.json({ insights: generateInsights() })
  } catch {
    return Response.json({ insights: 'Key Insights:\n- Dashboard is tracking attendance across multiple event types.\n- Mixed attendance patterns suggest need for improved engagement strategies.\n\nRecommendations:\n- Analyze low-attendance events for improvement opportunities.\n- Implement reminder systems for registered attendees.\n\nIssues to Monitor:\n- No-shows remain a concern in several events.' })
  }
}

function handleChat(body: Record<string, unknown>) {
  const message = body.message as string
  if (!message || typeof message !== 'string') return Response.json({ error: 'Message is required' }, { status: 400 })
  return Response.json({ response: processChat(message) })
}

function handleUpload(body: Record<string, unknown>) {
  const csvText = body.csvText as string
  const validateOnly = body.validateOnly === true

  if (!csvText) return Response.json({ error: 'No CSV data provided' }, { status: 400 })

  const { rows, rawHeaders, normalizedHeaders } = parseCSV(csvText)

  if (rows.length === 0) {
    return Response.json({ error: 'CSV file is empty or has invalid format.', detectedHeaders: rawHeaders }, { status: 400 })
  }

  const hasEventName = normalizedHeaders.includes('event_name')
  if (!hasEventName) {
    return Response.json({ error: `Could not find an "event_name" column. Detected columns: ${rawHeaders.join(', ')}`, detectedHeaders: rawHeaders }, { status: 400 })
  }

  const csvEventNames = new Set<string>()
  for (const row of rows) { const name = (row.event_name || '').trim(); if (name) csvEventNames.add(name) }

  const existingEvents = dataStore.getEvents()
  const duplicateEvents: string[] = []
  const newEvents: string[] = []
  for (const csvName of csvEventNames) {
    if (existingEvents.find(e => e.name.trim().toLowerCase() === csvName.toLowerCase())) duplicateEvents.push(csvName)
    else newEvents.push(csvName)
  }

  if (validateOnly) {
    return Response.json({ valid: true, totalRows: rows.length, eventsInCSV: csvEventNames.size, duplicateEvents, newEvents, detectedHeaders: rawHeaders, allDuplicate: duplicateEvents.length > 0 && newEvents.length === 0 })
  }

  // Deep duplicate check
  if (duplicateEvents.length > 0 && newEvents.length === 0) {
    let potentialNewAttendees = 0; let potentialNewRegistrations = 0
    for (const row of rows) {
      const eventName = (row.event_name || '').trim()
      if (!eventName) continue
      const event = existingEvents.find(e => e.name.trim().toLowerCase() === eventName.toLowerCase())
      if (!event) continue
      const attendeeExists = row.attendee_email
        ? dataStore.getAttendeeByEmail(row.attendee_email.trim().toLowerCase()) || dataStore.getAttendees().find(a => a.email.toLowerCase() === row.attendee_email.trim().toLowerCase())
        : dataStore.getAttendees().find(a => a.fullName.toLowerCase() === (row.attendee_name || '').trim().toLowerCase())
      if (!attendeeExists) { potentialNewAttendees++; potentialNewRegistrations++ }
      else {
        const existingReg = dataStore.getRegistrationsByEvent(event.id).find(r => r.attendeeId === attendeeExists.id)
        if (!existingReg) potentialNewRegistrations++
      }
    }
    if (potentialNewAttendees === 0 && potentialNewRegistrations === 0) {
      return Response.json({ error: `This file contains only duplicate data. All ${duplicateEvents.length} event(s) already exist.`, detectedHeaders: rawHeaders, duplicateEvents }, { status: 409 })
    }
  }

  let eventsAdded = 0, attendeesAdded = 0, registrationsAdded = 0
  const errors: string[] = []; const skipped: string[] = []
  let eventsExisting = 0, attendeesExisting = 0, registrationsExisting = 0

  const eventMap = new Map<string, CSVRow[]>()
  for (const row of rows) {
    const key = (row.event_name || '').trim()
    if (!key) { errors.push('Row skipped: missing event_name'); continue }
    if (!eventMap.has(key)) eventMap.set(key, [])
    eventMap.get(key)!.push(row)
  }

  for (const [eventName, eventRows] of eventMap) {
    const firstRow = eventRows[0]
    let event = dataStore.getEvents().find(e => e.name.trim().toLowerCase() === eventName.toLowerCase())
    if (!event) {
      event = dataStore.addEvent({
        name: eventName, eventType: firstRow.event_type || 'workshop',
        startDate: firstRow.event_date ? new Date(firstRow.event_date).toISOString() : new Date().toISOString(),
        endDate: firstRow.event_date ? new Date(new Date(firstRow.event_date).getTime() + 8 * 3600000).toISOString() : new Date().toISOString(),
        location: firstRow.location || 'Online', capacity: parseInt(firstRow.capacity) || 50
      })
      eventsAdded++
    } else { eventsExisting++; skipped.push(`Event "${eventName}" already exists`) }

    for (const row of eventRows) {
      if (!row.attendee_email && !row.attendee_name) { errors.push(`Row skipped for "${eventName}": missing attendee info`); continue }
      let attendee = row.attendee_email
        ? dataStore.getAttendeeByEmail(row.attendee_email.trim().toLowerCase()) || dataStore.getAttendees().find(a => a.email.toLowerCase() === row.attendee_email.trim().toLowerCase())
        : dataStore.getAttendees().find(a => a.fullName.toLowerCase() === (row.attendee_name || '').trim().toLowerCase())

      if (!attendee) {
        let cohortId = 1
        const cohortMatch = (row.cohort || '').match(/(\d+)/)
        if (cohortMatch) cohortId = Math.min(parseInt(cohortMatch[1]), 5)
        attendee = dataStore.addAttendee({
          email: row.attendee_email || `${(row.attendee_name || 'unknown').toLowerCase().replace(/\s+/g, '.')}@eskwelabs.com`,
          fullName: row.attendee_name || row.attendee_email?.split('@')[0] || 'Unknown',
          cohortId, location: row.location || 'Manila', status: 'active', registrationDate: new Date().toISOString()
        })
        attendeesAdded++
      } else { attendeesExisting++ }

      const existingReg = dataStore.getRegistrationsByEvent(event.id).find(r => r.attendeeId === attendee!.id)
      if (!existingReg) {
        const attended = ['true', 'yes', '1', 'y'].includes((row.attended || '').toLowerCase())
        dataStore.addRegistration({ eventId: event.id, attendeeId: attendee.id, registeredAt: new Date().toISOString(), attended, checkInTime: attended ? new Date().toISOString() : null })
        registrationsAdded++
      } else { registrationsExisting++; skipped.push(`Registration for "${row.attendee_name || row.attendee_email}" at "${eventName}" already exists`) }
    }
  }

  const totalNew = eventsAdded + attendeesAdded + registrationsAdded
  const totalSkipped = eventsExisting + attendeesExisting + registrationsExisting
  let message = ''
  if (totalNew > 0) message = `Upload complete: ${eventsAdded} new events, ${attendeesAdded} new attendees, ${registrationsAdded} new registrations added.`
  else if (totalSkipped > 0) message = `All ${rows.length} rows matched existing data. No new records were added.`
  else message = 'Upload processed but no valid data rows were found.'

  return Response.json({
    success: true, message,
    summary: { eventsAdded, attendeesAdded, registrationsAdded },
    processed: { totalRows: rows.length, eventsInCSV: eventMap.size, eventsExisting, attendeesExisting, registrationsExisting },
    detectedHeaders: rawHeaders,
    skipped: skipped.length > 0 ? skipped.slice(0, 15) : undefined,
    errors: errors.length > 0 ? errors.slice(0, 10) : undefined
  })
}

// ============ REHYDRATION (cold-start recovery) ============

/**
 * On Vercel serverless, each function instance has its own in-memory DataStore.
 * When a cold instance starts, it only has the seed data. The client stores
 * previously-uploaded CSV text in localStorage and sends it with every request.
 * This function re-applies those uploads so the instance has the full dataset.
 */
function rehydrateUploads(storedUploads: Array<{ id: string; csv: string }>) {
  if (!Array.isArray(storedUploads)) return
  for (const upload of storedUploads) {
    if (!upload.id || !upload.csv) continue
    if (dataStore.hasAppliedUpload(upload.id)) continue
    // Re-apply the upload; handleUpload mutates dataStore as a side effect
    // and its duplicate-detection logic prevents re-adding existing data.
    handleUpload({ csvText: upload.csv, validateOnly: false })
    dataStore.markUploadApplied(upload.id)
  }
}

// ============ DELETION REHYDRATION ============

/**
 * Re-apply client-stored deletions so every Vercel instance reflects
 * items the user has removed (from seed data or uploaded CSVs).
 * Must run AFTER upload rehydration.
 */
function rehydrateDeletions(storedDeletions: Array<{ type: string; identifier: string }>) {
  if (!Array.isArray(storedDeletions)) return
  for (const del of storedDeletions) {
    if (!del.type || !del.identifier) continue
    switch (del.type) {
      case 'event': {
        const event = dataStore.getEvents().find(e => e.name.trim().toLowerCase() === del.identifier.trim().toLowerCase())
        if (event) dataStore.deleteEvent(event.id)
        break
      }
      case 'attendee': {
        const attendee = dataStore.getAttendees().find(a => a.email.trim().toLowerCase() === del.identifier.trim().toLowerCase())
        if (attendee) dataStore.deleteAttendee(attendee.id)
        break
      }
      case 'registration': {
        const [eventName, email] = del.identifier.split('|')
        if (!eventName || !email) break
        const event = dataStore.getEvents().find(e => e.name.trim().toLowerCase() === eventName.trim().toLowerCase())
        const attendee = dataStore.getAttendees().find(a => a.email.trim().toLowerCase() === email.trim().toLowerCase())
        if (event && attendee) {
          const reg = dataStore.getRegistrationsByEvent(event.id).find(r => r.attendeeId === attendee.id)
          if (reg) dataStore.deleteRegistration(reg.id)
        }
        break
      }
    }
  }
}

// ============ MAIN HANDLER ============

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || ''

    // Handle FormData uploads (CSV file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()

      // Rehydrate stored uploads from client so cold instances have full data
      const storedUploadsField = formData.get('storedUploads') as string
      if (storedUploadsField) {
        try { rehydrateUploads(JSON.parse(storedUploadsField)) } catch {}
      }

      // Rehydrate stored deletions
      const storedDeletionsField = formData.get('storedDeletions') as string
      if (storedDeletionsField) {
        try { rehydrateDeletions(JSON.parse(storedDeletionsField)) } catch {}
      }

      const file = formData.get('file') as File
      const validateOnly = formData.get('validateOnly') === 'true'
      if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })
      if (!file.name.endsWith('.csv')) return Response.json({ error: 'File must be a CSV' }, { status: 400 })
      const csvText = await file.text()
      return handleUpload({ csvText, validateOnly })
    }

    // Handle JSON requests
    const body = await request.json()

    // Rehydrate stored uploads from client so cold instances have full data
    if (body._storedUploads) {
      rehydrateUploads(body._storedUploads as Array<{ id: string; csv: string }>)
    }

    // Rehydrate stored deletions (AFTER uploads, so deletions take precedence)
    if (body._storedDeletions) {
      rehydrateDeletions(body._storedDeletions as Array<{ type: string; identifier: string }>)
    }

    const action = body.action as string

    switch (action) {
      case 'stats': return handleStats(body)
      case 'data': return handleData(body)
      case 'delete': return handleDelete(body)
      case 'demographics': return handleDemographics(body)
      case 'attendance-trends': return handleAttendanceTrends(body)
      case 'events': return handleEvents(body)
      case 'no-shows': return handleNoShows(body)
      case 'ai-insights': return handleAiInsights()
      case 'chat': return handleChat(body)
      case 'upload': return handleUpload(body)
      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error) {
    console.error('Dashboard API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
