/**
 * Utility functions for exporting dashboard data to CSV
 */

export interface ExportData {
  events?: any[]
  demographics?: any[]
  noShows?: any[]
  trends?: any[]
}

export function convertToCSV(data: any[], headers: string[]): string {
  if (data.length === 0) return ''

  // Create header row
  const headerRow = headers.join(',')

  // Create data rows
  const dataRows = data.map(item => {
    return headers.map(header => {
      const value = item[header] || ''
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value).replace(/"/g, '""')
      return escaped.includes(',') ? `"${escaped}"` : escaped
    }).join(',')
  })

  return [headerRow, ...dataRows].join('\n')
}

export function downloadCSV(csvContent: string, filename: string): void {
  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent))
  element.setAttribute('download', filename)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

export function exportEventData(events: any[]): void {
  const headers = ['name', 'type', 'date', 'location', 'capacity', 'attended', 'registered', 'attendanceRate']
  const csv = convertToCSV(events, headers)
  downloadCSV(csv, `events-report-${new Date().toISOString().split('T')[0]}.csv`)
}

export function exportAttendanceData(data: any[]): void {
  const headers = ['date', 'eventsCount', 'attended', 'registered', 'attendanceRate']
  const csv = convertToCSV(data, headers)
  downloadCSV(csv, `attendance-trends-${new Date().toISOString().split('T')[0]}.csv`)
}

export function exportNoShowData(data: any[]): void {
  const headers = ['eventName', 'eventType', 'date', 'noShowCount', 'totalRegistered', 'noShowRate']
  const csv = convertToCSV(data, headers)
  downloadCSV(csv, `no-shows-report-${new Date().toISOString().split('T')[0]}.csv`)
}

export function createDashboardSummary(stats: any): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  return `ESKWELABS Event Attendance Report - ${date}

Executive Summary
-----------------
Total Events: ${stats.totalEvents}
Total Attendees: ${stats.totalAttendees}
Total Registrations: ${stats.totalRegistrations}
Average Attendance Rate: ${stats.averageAttendanceRate}%

Generated: ${new Date().toLocaleString()}
`
}

export function downloadDashboardReport(summary: string, filename: string): void {
  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(summary))
  element.setAttribute('download', filename)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}
