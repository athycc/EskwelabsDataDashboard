import { dataStore } from '@/lib/data-store'

/**
 * AI Chat endpoint - free, rule-based intelligent chat about dashboard data.
 * No external API services needed. Analyzes questions and provides data-driven responses.
 * All responses use plain text (no markdown) for clean rendering.
 */

function processChat(message: string): string {
  const msg = message.toLowerCase().trim()
  const stats = dataStore.getStats()
  const eventStats = dataStore.getEventsWithStats(20)
  const noShows = dataStore.getNoShows(10)
  const cohortDemo = dataStore.getDemographicsByCohort()
  const locationDemo = dataStore.getDemographicsByLocation()
  const statusDemo = dataStore.getDemographicsByStatus()

  // --- Greeting ---
  if (msg.match(/^(hi|hello|hey|good\s*(morning|afternoon|evening)|greetings|yo|sup)/)) {
    return [
      'Hello! I\'m the ESKWELABS Dashboard Assistant.',
      '',
      'I can help you with:',
      '  - Overall statistics and summaries',
      '  - Event performance and comparisons',
      '  - Attendance rates and trends',
      '  - No-show analysis',
      '  - Cohort breakdowns (Cohort 1-5)',
      '  - Attendee demographics',
      '  - Location data',
      '  - ESKWELABS program info',
      '  - Recommendations for improvement',
      '',
      'What would you like to know?'
    ].join('\n')
  }

  // --- Help ---
  if (msg.match(/^(help|what can you do|about|commands|options|menu|features)/)) {
    return [
      'I can answer questions about the ESKWELABS dashboard data:',
      '',
      '  Stats & Overview - totals, averages, registrations',
      '  Event Performance - best/worst events, by type',
      '  No-Shows - patterns, rates, problem events',
      '  Cohorts - performance per cohort (1-5)',
      '  Demographics - status, location, breakdown',
      '  Locations - attendance by city/venue',
      '  Data in System - what data is being tracked',
      '  ESKWELABS Programs - course/program info',
      '  Recommendations - tips to improve attendance',
      '',
      'Just ask in plain language!'
    ].join('\n')
  }

  // --- What data / what is tracked / what info ---
  if (msg.match(/(what|which)\s*(type|kind|sort).*data|what.*found|what.*track|what.*info|what.*stored|what.*have|what.*contain|data.*available|data.*system/)) {
    return [
      'The dashboard tracks the following data:',
      '',
      `Events: ${stats.totalEvents} events total`,
      '  Each event has: name, type (workshop/webinar/meetup/bootcamp/conference), date, location, capacity',
      '',
      `Attendees: ${stats.totalAttendees} people total`,
      '  Each attendee has: name, email, cohort, location, status (active/graduated/inactive)',
      '',
      `Registrations: ${stats.totalRegistrations} records total`,
      '  Links attendees to events, tracking whether they attended or were a no-show',
      '',
      `Cohorts: 5 cohorts (Cohort 1 through Cohort 5)`,
      '',
      'You can also upload new data via CSV in the Upload section above.'
    ].join('\n')
  }

  // --- Overall stats ---
  if (msg.match(/(overall|summary|overview|stats|statistic|dashboard|how many|total|count|number)/)) {
    const avgRate = parseFloat(stats.averageAttendanceRate)
    const avgPerEvent = (parseInt(stats.totalRegistrations.toString()) / parseInt(stats.totalEvents.toString())).toFixed(1)
    const assessment = avgRate >= 70
      ? 'Overall attendance is strong.'
      : avgRate >= 50
        ? 'Attendance is moderate - there\'s room for improvement.'
        : 'Attendance needs attention.'

    return [
      'Dashboard Overview',
      '─────────────────',
      `Total Events: ${stats.totalEvents}`,
      `Total Attendees: ${stats.totalAttendees}`,
      `Total Registrations: ${stats.totalRegistrations}`,
      `Average Attendance Rate: ${stats.averageAttendanceRate}%`,
      `Average Registrations per Event: ${avgPerEvent}`,
      '',
      assessment
    ].join('\n')
  }

  // --- Best / top events ---
  if (msg.match(/(best|top|highest|most attended|popular|great)\s*(event|performing|attendance|rated)?/)) {
    const sorted = [...eventStats].sort((a, b) => b.attendanceRate - a.attendanceRate)
    const top5 = sorted.slice(0, 5)
    return [
      'Top Performing Events',
      '─────────────────────',
      ...top5.map((e, i) => `${i + 1}. ${e.name} — ${e.attendanceRate}% (${e.attended}/${e.registered}), ${e.type}, ${e.location}`),
      '',
      `The best event is "${top5[0].name}" with ${top5[0].attendanceRate}% attendance.`
    ].join('\n')
  }

  // --- Worst / lowest events ---
  if (msg.match(/(worst|lowest|least|poor|bad|weak|struggling)\s*(event|performing|attendance|rated)?/)) {
    const sorted = [...eventStats].sort((a, b) => a.attendanceRate - b.attendanceRate)
    const bottom5 = sorted.slice(0, 5)
    return [
      'Events Needing Improvement',
      '──────────────────────────',
      ...bottom5.map((e, i) => `${i + 1}. ${e.name} — ${e.attendanceRate}% (${e.attended}/${e.registered}), ${e.type}, ${e.location}`),
      '',
      'Tip: Consider rescheduling, reformatting, or improving content for these events.'
    ].join('\n')
  }

  // --- No-shows ---
  if (msg.match(/(no.?show|absent|miss|didn.?t (come|attend|show)|skipped|not.*attend)/)) {
    const totalNoShows = noShows.reduce((sum, n) => sum + n.noShowCount, 0)
    return [
      'No-Show Analysis',
      '────────────────',
      `Total no-shows across tracked events: ${totalNoShows}`,
      '',
      'Events with highest no-show rates:',
      ...noShows.slice(0, 5).map((n, i) => `  ${i + 1}. ${n.eventName} — ${n.noShowCount}/${n.totalRegistered} no-shows (${n.noShowRate}%)`),
      '',
      'Recommendations:',
      '  - Send reminder emails 24h and 1h before events',
      '  - Implement a waitlist to fill empty spots',
      '  - Follow up with no-shows to understand their reasons'
    ].join('\n')
  }

  // --- Specific cohort ---
  const cohortMatch = msg.match(/cohort\s*(\d+)/)
  if (cohortMatch) {
    const cohortNum = parseInt(cohortMatch[1])
    const cohort = cohortDemo.find(c => c.name === `Cohort ${cohortNum}`)
    if (cohort) {
      const avgEvents = cohort.total_attendees > 0 ? (cohort.attended_events / cohort.total_attendees).toFixed(1) : '0'
      const note = cohort.inactive > 0
        ? `Note: ${cohort.inactive} inactive member(s) — consider a re-engagement campaign.`
        : 'All members are active or graduated.'

      return [
        `Cohort ${cohortNum} Details`,
        '────────────────',
        `Total Members: ${cohort.total_attendees}`,
        `  Active: ${cohort.active}`,
        `  Graduated: ${cohort.graduated}`,
        `  Inactive: ${cohort.inactive}`,
        `Event Attendances: ${cohort.attended_events}`,
        `Avg Events per Member: ${avgEvents}`,
        '',
        note
      ].join('\n')
    }
    return `I don't have data for Cohort ${cohortNum}. The available cohorts are Cohort 1 through Cohort 5.`
  }

  // --- Cohort overview ---
  if (msg.match(/(cohort|cohorts|all cohort|each cohort|batch)/)) {
    const mostEngaged = cohortDemo.reduce((best, c) => c.attended_events > best.attended_events ? c : best, cohortDemo[0])
    return [
      'Cohort Overview',
      '───────────────',
      ...cohortDemo.map(c => `${c.name}: ${c.total_attendees} members (${c.active} active, ${c.graduated} graduated, ${c.inactive} inactive) — ${c.attended_events} event attendances`),
      '',
      `Most engaged: ${mostEngaged.name} with ${mostEngaged.attended_events} total attendances.`
    ].join('\n')
  }

  // --- Demographics ---
  if (msg.match(/(demographic|people|attendee|member|who|profile|breakdown|distribut)/)) {
    return [
      'Attendee Demographics',
      '─────────────────────',
      '',
      'By Status:',
      ...statusDemo.map(s => `  ${s.status.charAt(0).toUpperCase() + s.status.slice(1)}: ${s.count}`),
      '',
      'By Location (top 5):',
      ...locationDemo.slice(0, 5).map(l => `  ${l.location}: ${l.total_attendees} attendees (${l.active} active)`),
      '',
      'By Cohort:',
      ...cohortDemo.map(c => `  ${c.name}: ${c.total_attendees} members`),
      '',
      `Total unique attendees: ${stats.totalAttendees}`
    ].join('\n')
  }

  // --- Location ---
  if (msg.match(/(location|where|city|cities|manila|makati|online|cebu|davao|pasig|venue|place)/)) {
    return [
      'Location Breakdown',
      '──────────────────',
      ...locationDemo.map(l => `${l.location}: ${l.total_attendees} attendees (${l.active} active, ${l.graduated} grad, ${l.inactive} inactive) — ${l.attended_events} attendances`),
      '',
      `Top location: ${locationDemo[0].location} with ${locationDemo[0].total_attendees} attendees.`
    ].join('\n')
  }

  // --- Event type comparison ---
  if (msg.match(/(event type|type|compare|comparison|workshop|webinar|meetup|bootcamp|conference|versus|vs)/)) {
    const typeMap = new Map<string, { count: number; attended: number; registered: number }>()
    for (const e of eventStats) {
      const cur = typeMap.get(e.type) || { count: 0, attended: 0, registered: 0 }
      cur.count++
      cur.attended += e.attended
      cur.registered += e.registered
      typeMap.set(e.type, cur)
    }

    const types = Array.from(typeMap.entries())
      .map(([type, d]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count: d.count,
        rate: d.registered > 0 ? ((d.attended / d.registered) * 100).toFixed(1) : '0',
        attended: d.attended,
        registered: d.registered
      }))
      .sort((a, b) => parseFloat(b.rate) - parseFloat(a.rate))

    return [
      'Event Type Comparison',
      '─────────────────────',
      ...types.map(t => `${t.type}: ${t.count} events, ${t.attended}/${t.registered} attended (${t.rate}%)`),
      '',
      `Best type: ${types[0].type} (${types[0].rate}% attendance)`,
      `Needs improvement: ${types[types.length - 1].type} (${types[types.length - 1].rate}%)`
    ].join('\n')
  }

  // --- ESKWELABS info ---
  if (msg.match(/(eskwelabs|program|course|fellowship|about.*eskwelabs|what.*eskwelabs)/)) {
    return [
      'About ESKWELABS',
      '───────────────',
      'ESKWELABS is a leading Philippine-based data science education platform offering intensive cohort-based programs.',
      '',
      'Programs:',
      '  Data Science Fellowship — Python, statistics, machine learning, deep learning',
      '  Data Analytics Bootcamp — SQL, Tableau, Excel, business intelligence',
      '  Data Engineering Bootcamp — ETL, cloud pipelines, data warehousing',
      '',
      'Key facts:',
      '  - Based in the Philippines',
      '  - Cohort-based learning (Cohort 1, 2, 3...)',
      '  - Industry-relevant curriculum',
      '  - Website: https://www.eskwelabs.com/',
      '',
      'This dashboard tracks attendance across ESKWELABS events and cohorts.'
    ].join('\n')
  }

  // --- Recommendations ---
  if (msg.match(/(recommend|improve|suggestion|advice|what should|how to|tips|fix|increase|boost)/)) {
    const avgRate = parseFloat(stats.averageAttendanceRate)
    const topNoShow = noShows[0]
    return [
      'Recommendations to Improve Attendance',
      '──────────────────────────────────────',
      '',
      '1. Pre-Event Reminders',
      '   Send automated emails 24h and 1h before events — this typically reduces no-shows by 15-20%.',
      '',
      `2. Optimize Scheduling`,
      avgRate < 70
        ? `   Current average is ${avgRate}%. Analyze which time slots and days get the best attendance.`
        : `   Current average is ${avgRate}%, which is solid. Maintain your scheduling approach.`,
      '',
      '3. Address No-Shows',
      topNoShow
        ? `   "${topNoShow.eventName}" has a ${topNoShow.noShowRate}% no-show rate. Survey non-attendees for feedback.`
        : '   No-show rates are manageable.',
      '',
      '4. Content Quality',
      '   Gather post-event feedback and iterate on topics that drive higher attendance.',
      '',
      '5. Engagement',
      '   Use interactive elements like polls, Q&A, and breakout rooms — especially for webinars.',
      '',
      '6. Follow-up',
      '   Share recordings and materials with all registrants to keep them engaged for future events.'
    ].join('\n')
  }

  // --- Attendance rate ---
  if (msg.match(/(attendance rate|rate|percentage|ratio)/)) {
    const totalAttended = eventStats.reduce((sum, e) => sum + e.attended, 0)
    const sorted = [...eventStats].sort((a, b) => b.attendanceRate - a.attendanceRate)
    return [
      'Attendance Rate Analysis',
      '───────────────────────',
      `Overall Average: ${stats.averageAttendanceRate}%`,
      `Total Registrations: ${stats.totalRegistrations}`,
      `Total Attended: ${totalAttended}`,
      '',
      'Top 5 events by attendance rate:',
      ...sorted.slice(0, 5).map((e, i) => `  ${i + 1}. ${e.name}: ${e.attendanceRate}%`),
      '',
      parseFloat(stats.averageAttendanceRate) >= 70
        ? 'Overall attendance is strong.'
        : 'Consider implementing reminder systems to boost attendance.'
    ].join('\n')
  }

  // --- Specific event lookup ---
  if (msg.match(/(tell me about|info on|details|about)\s+(the\s+)?event/i) || msg.match(/(event|events)\s+(list|all|details)/)) {
    const top = eventStats.slice(0, 10)
    return [
      `Events in the System (${stats.totalEvents} total)`,
      '─────────────────────────────────',
      ...top.map((e, i) => `${i + 1}. ${e.name} — ${e.type}, ${e.date}, ${e.location}, ${e.attended}/${e.registered} attended (${e.attendanceRate}%)`),
      '',
      top.length < eventStats.length ? `Showing top ${top.length} of ${eventStats.length}. Ask about a specific event type for more detail.` : ''
    ].join('\n')
  }

  // --- Thank you ---
  if (msg.match(/(thank|thanks|thx|appreciate|great|awesome|nice|good job|well done)/)) {
    return 'You\'re welcome! If you have more questions about the dashboard data, feel free to ask anytime.'
  }

  // --- Fallback ---
  return [
    `I'm not sure how to answer "${message}" specifically, but here's a quick summary:`,
    '',
    `The dashboard currently tracks ${stats.totalEvents} events, ${stats.totalAttendees} attendees, and ${stats.totalRegistrations} registrations with an average attendance rate of ${stats.averageAttendanceRate}%.`,
    '',
    'Try asking things like:',
    '  "What are the overall stats?"',
    '  "Show me no-show data"',
    '  "How is Cohort 1 doing?"',
    '  "Compare event types"',
    '  "What are the demographics?"',
    '  "Which event has the best attendance?"',
    '  "What type of data is in the system?"',
    '  "Give me recommendations"',
  ].join('\n')
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    const response = processChat(message)
    return Response.json({ response })
  } catch (error) {
    console.error('Error processing chat:', error)
    return Response.json({ error: 'Failed to process message' }, { status: 500 })
  }
}
