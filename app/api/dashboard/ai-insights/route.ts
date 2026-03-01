import { dataStore } from '@/lib/data-store'

/**
 * Free AI insights - uses rule-based analysis instead of paid API.
 * No external services needed. 100% open-source.
 */

function generateInsights(): string {
  const stats = dataStore.getStats()
  const noShows = dataStore.getNoShows(5)
  const eventStats = dataStore.getEventsWithStats(20)
  const cohortDemo = dataStore.getDemographicsByCohort()
  const locationDemo = dataStore.getDemographicsByLocation()

  const avgRate = parseFloat(stats.averageAttendanceRate)
  const bestEvent = eventStats.reduce((best, e) => e.attendanceRate > best.attendanceRate ? e : best, eventStats[0])
  const worstEvent = eventStats.reduce((worst, e) => e.attendanceRate < worst.attendanceRate ? e : worst, eventStats[0])

  // Event type analysis
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

  // Location analysis
  const topLocation = locationDemo[0]
  const mostActiveCohort = cohortDemo.reduce((best, c) =>
    c.attended_events > best.attended_events ? c : best, cohortDemo[0])

  const totalNoShows = noShows.reduce((sum, n) => sum + n.noShowCount, 0)

  const insights = `Key Insights
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

  return insights
}

export async function POST() {
  try {
    const insights = generateInsights()
    return Response.json({ insights })
  } catch (error) {
    console.error('Error generating AI insights:', error)
    return Response.json({
      insights: 'Key Insights:\n- Dashboard is tracking attendance across multiple event types.\n- Mixed attendance patterns suggest need for improved engagement strategies.\n\nRecommendations:\n- Analyze low-attendance events for improvement opportunities.\n- Implement reminder systems for registered attendees.\n\nIssues to Monitor:\n- No-shows remain a concern in several events.'
    })
  }
}
