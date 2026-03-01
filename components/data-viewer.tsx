'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Database, RefreshCw, CalendarDays, Users, ClipboardList, Trash2, AlertTriangle, Search, X, MapPin, Clock, UserCheck, UserX, ChevronDown } from 'lucide-react'
import { dashboardPost } from '@/lib/utils'

interface EventRow {
  id: number; name: string; type: string; date: string; location: string; capacity: number; registered: number; attended: number
}
interface AttendeeRow {
  id: number; name: string; email: string; cohort: string; location: string; status: string; eventsRegistered: number; eventsAttended: number
}
interface RegistrationRow {
  id: number; event: string; attendee: string; email: string; attended: boolean; registeredAt: string
}

export function DataViewer({ refreshKey, onDataChange }: { refreshKey?: number; onDataChange?: () => void }) {
  const [tab, setTab] = useState('events')
  const [events, setEvents] = useState<EventRow[]>([])
  const [attendees, setAttendees] = useState<AttendeeRow[]>([])
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [counts, setCounts] = useState({ events: 0, attendees: 0, registrations: 0 })
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: number; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState<{ text: string; success: boolean } | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null)

  const searchResults = searchQuery.trim().length > 0
    ? events.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  const getEventRegistrations = (eventId: number) => {
    return registrations.filter(r => {
      const event = events.find(e => e.id === eventId)
      return event && r.event === event.name
    })
  }

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [evData, atData, regData] = await Promise.all([
        dashboardPost('data', { view: 'events' }),
        dashboardPost('data', { view: 'attendees' }),
        dashboardPost('data', { view: 'registrations' }),
      ])

      setEvents(evData.data || [])
      setAttendees(atData.data || [])
      setRegistrations(regData.data || [])

      // Show actual counts of what's displayed in each tab
      setCounts({
        events: (evData.data || []).length,
        attendees: (atData.data || []).length,
        registrations: (regData.data || []).length,
      })
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [refreshKey, fetchData])

  // Listen for global data change events (from CSV upload) with retry
  useEffect(() => {
    const handleDataChange = () => {
      // Immediate fetch
      fetchData()
      // Retry after delays to handle serverless instance warm-up
      const t1 = setTimeout(() => fetchData(), 800)
      const t2 = setTimeout(() => fetchData(), 2500)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
    window.addEventListener('dashboard-data-changed', handleDataChange)
    return () => window.removeEventListener('dashboard-data-changed', handleDataChange)
  }, [fetchData])

  // Auto-clear delete message after 3s
  useEffect(() => {
    if (deleteMessage) {
      const timer = setTimeout(() => setDeleteMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [deleteMessage])

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setIsDeleting(true)
    try {
      const data = await dashboardPost('delete', { type: deleteConfirm.type, id: deleteConfirm.id })
      if (data.message) {
        setDeleteMessage({ text: data.message, success: true })
        fetchData()
        onDataChange?.()
      } else {
        setDeleteMessage({ text: data.error || 'Delete failed', success: false })
      }
    } catch (error) {
      setDeleteMessage({ text: 'Failed to delete. Please try again.', success: false })
    } finally {
      setIsDeleting(false)
      setDeleteConfirm(null)
    }
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      workshop: 'bg-blue-100 text-blue-800',
      webinar: 'bg-green-100 text-green-800',
      meetup: 'bg-purple-100 text-purple-800',
      bootcamp: 'bg-orange-100 text-orange-800',
      conference: 'bg-red-100 text-red-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Database className="h-4 w-4 sm:h-5 sm:w-5" />
            Data Viewer
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Browse, verify, and manage all events, attendees, and registrations in the system
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading} className="w-full sm:w-auto">
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {/* Delete confirmation overlay */}
        {deleteConfirm && (
          <div className="mb-4 p-4 rounded-lg border-2 border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Delete {deleteConfirm.type}: &quot;{deleteConfirm.name}&quot;?
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {deleteConfirm.type === 'event'
                    ? 'This will also remove all registrations associated with this event.'
                    : deleteConfirm.type === 'attendee'
                    ? 'This will also remove all registrations for this attendee.'
                    : 'This registration record will be permanently removed.'}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteConfirm(null)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete result message */}
        {deleteMessage && (
          <div className={`mb-4 p-3 rounded-lg text-sm border ${
            deleteMessage.success
              ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800'
              : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800'
          }`}>
            {deleteMessage.text}
          </div>
        )}

        {/* Event search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events by name..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSelectedEvent(null) }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => { setSearchQuery(''); setSelectedEvent(null) }}
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Search dropdown */}
            {searchFocused && searchQuery.trim().length > 0 && !selectedEvent && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg max-h-[240px] overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground text-center">No events found matching "{searchQuery}"</div>
                ) : (
                  searchResults.map((e) => (
                    <button
                      key={e.id}
                      className="w-full text-left px-4 py-2.5 hover:bg-muted/50 border-b last:border-b-0 transition-colors"
                      onMouseDown={(ev) => { ev.preventDefault(); setSelectedEvent(e); setSearchQuery(e.name) }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{e.name}</span>
                        <Badge className={getTypeColor(e.type)}>{e.type}</Badge>
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{e.date}</span>
                        <span>{e.location}</span>
                        <span>{e.attended}/{e.registered} attended</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected event detail card */}
          {selectedEvent && (
            <div className="mt-3 p-4 rounded-lg border bg-muted/30">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold">{selectedEvent.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge className={getTypeColor(selectedEvent.type)}>{selectedEvent.type}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedEvent(null); setSearchQuery('') }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEvent.date}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  <span>{selectedEvent.location}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  <span>Capacity: {selectedEvent.capacity}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                  <span>Rate: {selectedEvent.registered > 0 ? ((selectedEvent.attended / selectedEvent.registered) * 100).toFixed(1) : 0}%</span>
                </div>
              </div>

              {/* Attendance summary */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{selectedEvent.registered}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Registered</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                  <p className="text-lg font-bold text-green-700 dark:text-green-300">{selectedEvent.attended}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Attended</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                  <p className="text-lg font-bold text-red-700 dark:text-red-300">{selectedEvent.registered - selectedEvent.attended}</p>
                  <p className="text-xs text-red-600 dark:text-red-400">No-shows</p>
                </div>
              </div>

              {/* Attendee list for this event */}
              {(() => {
                const eventRegs = getEventRegistrations(selectedEvent.id)
                if (eventRegs.length === 0) return (
                  <p className="text-sm text-muted-foreground">No registration records found for this event.</p>
                )
                return (
                  <div>
                    <p className="text-sm font-medium mb-2">Registrations ({eventRegs.length})</p>
                    <div className="overflow-x-auto max-h-[200px] overflow-y-auto rounded-lg border">
                      <Table className="min-w-[400px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Attendee</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {eventRegs.map((r) => (
                            <TableRow key={r.id}>
                              <TableCell className="text-sm font-medium">{r.attendee}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{r.email}</TableCell>
                              <TableCell>
                                {r.attended
                                  ? <Badge className="bg-green-100 text-green-800">Present</Badge>
                                  : <Badge className="bg-red-100 text-red-800">No-show</Badge>
                                }
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>

        {/* Summary badges */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-sm">
            <CalendarDays className="h-4 w-4 text-blue-500" />
            <span className="font-semibold">{counts.events}</span>
            <span className="text-muted-foreground">Events</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="h-4 w-4 text-green-500" />
            <span className="font-semibold">{counts.attendees}</span>
            <span className="text-muted-foreground">Attendees</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <ClipboardList className="h-4 w-4 text-purple-500" />
            <span className="font-semibold">{counts.registrations}</span>
            <span className="text-muted-foreground">Registrations</span>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="events" className="text-xs sm:text-sm">Events ({counts.events})</TabsTrigger>
            <TabsTrigger value="attendees" className="text-xs sm:text-sm">Attendees ({counts.attendees})</TabsTrigger>
            <TabsTrigger value="registrations" className="text-xs sm:text-sm">Regs ({counts.registrations})</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <>
              <TabsContent value="events">
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <Table className="min-w-[650px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Event Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Cap</TableHead>
                        <TableHead className="text-right">Reg</TableHead>
                        <TableHead className="text-right">Att</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground py-8">No events yet</TableCell>
                        </TableRow>
                      ) : (
                        events.map((e, index) => (
                          <TableRow key={e.id}>
                            <TableCell className="text-xs text-muted-foreground">{index + 1}</TableCell>
                            <TableCell className="font-medium text-sm max-w-[200px] truncate">{e.name}</TableCell>
                            <TableCell><Badge className={getTypeColor(e.type)}>{e.type}</Badge></TableCell>
                            <TableCell className="text-sm">{e.date}</TableCell>
                            <TableCell className="text-sm">{e.location}</TableCell>
                            <TableCell className="text-right">{e.capacity}</TableCell>
                            <TableCell className="text-right">{e.registered}</TableCell>
                            <TableCell className="text-right font-semibold">{e.attended}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-red-600"
                                onClick={() => setDeleteConfirm({ type: 'event', id: e.id, name: e.name })}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                    {events.length > 0 && (
                      <tfoot>
                        <TableRow className="bg-muted/50 font-semibold">
                          <TableCell colSpan={6} className="text-right text-sm">Totals:</TableCell>
                          <TableCell className="text-right text-sm">{events.reduce((sum, e) => sum + e.registered, 0)}</TableCell>
                          <TableCell className="text-right text-sm">{events.reduce((sum, e) => sum + e.attended, 0)}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </tfoot>
                    )}
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="attendees">
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Cohort</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Events</TableHead>
                        <TableHead className="text-right">Attended</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendees.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground py-8">No attendees yet</TableCell>
                        </TableRow>
                      ) : (
                        attendees.map((a, index) => (
                          <TableRow key={a.id}>
                            <TableCell className="text-xs text-muted-foreground">{index + 1}</TableCell>
                            <TableCell className="font-medium text-sm">{a.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{a.email}</TableCell>
                            <TableCell><Badge variant="secondary">{a.cohort}</Badge></TableCell>
                            <TableCell className="text-sm">{a.location}</TableCell>
                            <TableCell>
                              <Badge variant={a.status === 'active' ? 'default' : a.status === 'graduated' ? 'secondary' : 'outline'}>
                                {a.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{a.eventsRegistered}</TableCell>
                            <TableCell className="text-right font-semibold">{a.eventsAttended}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-red-600"
                                onClick={() => setDeleteConfirm({ type: 'attendee', id: a.id, name: a.name })}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="registrations">
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <Table className="min-w-[550px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Attendee</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Attended</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No registrations yet</TableCell>
                        </TableRow>
                      ) : (
                        registrations.map((r, index) => (
                          <TableRow key={r.id}>
                            <TableCell className="text-xs text-muted-foreground">{index + 1}</TableCell>
                            <TableCell className="font-medium text-sm max-w-[180px] truncate">{r.event}</TableCell>
                            <TableCell className="text-sm">{r.attendee}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{r.email}</TableCell>
                            <TableCell className="text-sm">{r.registeredAt}</TableCell>
                            <TableCell>
                              {r.attended
                                ? <Badge className="bg-green-100 text-green-800">Present</Badge>
                                : <Badge className="bg-red-100 text-red-800">No-show</Badge>
                              }
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-red-600"
                                onClick={() => setDeleteConfirm({ type: 'registration', id: r.id, name: `${r.attendee} - ${r.event}` })}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {registrations.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">Showing all {registrations.length} registrations</p>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
