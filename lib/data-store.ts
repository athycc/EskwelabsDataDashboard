/**
 * In-memory data store - replaces Neon database dependency
 * This is a 100% free, open-source solution with no external services needed.
 * Data persists during the server session and can be extended via CSV upload.
 */

export interface Cohort {
  id: number
  name: string
  startDate: string
  endDate: string
}

export interface Event {
  id: number
  name: string
  eventType: string
  startDate: string
  endDate: string
  location: string
  capacity: number
}

export interface Attendee {
  id: number
  email: string
  fullName: string
  cohortId: number
  location: string
  status: 'active' | 'graduated' | 'inactive'
  registrationDate: string
}

export interface EventRegistration {
  id: number
  eventId: number
  attendeeId: number
  registeredAt: string
  attended: boolean
  checkInTime: string | null
}

// --- Seed Data ---

const cohorts: Cohort[] = [
  { id: 1, name: 'Cohort 1', startDate: '2024-01-15', endDate: '2024-06-15' },
  { id: 2, name: 'Cohort 2', startDate: '2024-03-01', endDate: '2024-08-01' },
  { id: 3, name: 'Cohort 3', startDate: '2024-05-15', endDate: '2024-10-15' },
  { id: 4, name: 'Cohort 4', startDate: '2024-07-01', endDate: '2024-12-01' },
  { id: 5, name: 'Cohort 5', startDate: '2024-09-01', endDate: '2025-02-01' },
]

const events: Event[] = [
  { id: 1, name: 'Data Science Fellowship Orientation', eventType: 'workshop', startDate: '2024-02-01T09:00:00', endDate: '2024-02-01T17:00:00', location: 'Manila', capacity: 50 },
  { id: 2, name: 'Python for Data Analytics Masterclass', eventType: 'webinar', startDate: '2024-02-15T18:00:00', endDate: '2024-02-15T20:00:00', location: 'Online', capacity: 200 },
  { id: 3, name: 'SQL & Database Fundamentals Workshop', eventType: 'workshop', startDate: '2024-03-01T09:00:00', endDate: '2024-03-01T17:00:00', location: 'Manila', capacity: 40 },
  { id: 4, name: 'Data Engineering Bootcamp Day 1', eventType: 'bootcamp', startDate: '2024-03-15T08:00:00', endDate: '2024-03-15T17:00:00', location: 'Makati', capacity: 60 },
  { id: 5, name: 'Statistics & Probability Fundamentals', eventType: 'webinar', startDate: '2024-03-20T18:00:00', endDate: '2024-03-20T20:00:00', location: 'Online', capacity: 150 },
  { id: 6, name: 'Machine Learning with Scikit-Learn', eventType: 'workshop', startDate: '2024-04-05T10:00:00', endDate: '2024-04-05T16:00:00', location: 'Manila', capacity: 35 },
  { id: 7, name: 'Cloud Computing for Data Teams', eventType: 'webinar', startDate: '2024-04-10T19:00:00', endDate: '2024-04-10T21:00:00', location: 'Online', capacity: 180 },
  { id: 8, name: 'Data Career Development Meetup', eventType: 'meetup', startDate: '2024-04-20T17:00:00', endDate: '2024-04-20T19:00:00', location: 'Makati', capacity: 80 },
  { id: 9, name: 'Data Visualization with Tableau', eventType: 'workshop', startDate: '2024-05-01T09:00:00', endDate: '2024-05-01T17:00:00', location: 'Manila', capacity: 45 },
  { id: 10, name: 'Deep Learning Fundamentals', eventType: 'webinar', startDate: '2024-05-15T18:00:00', endDate: '2024-05-15T20:00:00', location: 'Online', capacity: 120 },
  { id: 11, name: 'NLP & Text Analytics Workshop', eventType: 'workshop', startDate: '2024-06-01T10:00:00', endDate: '2024-06-01T16:00:00', location: 'Manila', capacity: 30 },
  { id: 12, name: 'Monthly Data Science Talk Series', eventType: 'meetup', startDate: '2024-06-15T17:30:00', endDate: '2024-06-15T19:30:00', location: 'Makati', capacity: 100 },
  { id: 13, name: 'Data Pipeline Design Workshop', eventType: 'workshop', startDate: '2024-07-01T09:00:00', endDate: '2024-07-01T17:00:00', location: 'Manila', capacity: 40 },
  { id: 14, name: 'Data Ethics & Privacy Seminar', eventType: 'webinar', startDate: '2024-07-10T18:00:00', endDate: '2024-07-10T20:00:00', location: 'Online', capacity: 160 },
  { id: 15, name: 'Analytics Engineering Bootcamp', eventType: 'bootcamp', startDate: '2024-07-20T08:00:00', endDate: '2024-07-20T17:00:00', location: 'Makati', capacity: 70 },
  { id: 16, name: 'AI & Generative Models Introduction', eventType: 'webinar', startDate: '2024-08-05T19:00:00', endDate: '2024-08-05T21:00:00', location: 'Online', capacity: 140 },
  { id: 17, name: 'Git & Version Control for Data Projects', eventType: 'workshop', startDate: '2024-08-15T10:00:00', endDate: '2024-08-15T16:00:00', location: 'Manila', capacity: 50 },
  { id: 18, name: 'Agile Data Science Methodologies', eventType: 'webinar', startDate: '2024-08-25T18:00:00', endDate: '2024-08-25T20:00:00', location: 'Online', capacity: 110 },
  { id: 19, name: 'ESKWELABS Data Summit 2024', eventType: 'conference', startDate: '2024-09-01T08:00:00', endDate: '2024-09-02T18:00:00', location: 'Makati', capacity: 200 },
  { id: 20, name: 'Monthly Community Standup', eventType: 'meetup', startDate: '2024-09-20T17:00:00', endDate: '2024-09-20T18:00:00', location: 'Makati', capacity: 150 },
]

const attendees: Attendee[] = [
  { id: 1, email: 'juan.santos@eskwelabs.com', fullName: 'Juan Santos', cohortId: 1, location: 'Manila', status: 'active', registrationDate: '2024-01-10T10:00:00' },
  { id: 2, email: 'maria.garcia@eskwelabs.com', fullName: 'Maria Garcia', cohortId: 1, location: 'Makati', status: 'active', registrationDate: '2024-01-12T14:30:00' },
  { id: 3, email: 'carlos.reyes@eskwelabs.com', fullName: 'Carlos Reyes', cohortId: 1, location: 'Quezon City', status: 'active', registrationDate: '2024-01-15T09:00:00' },
  { id: 4, email: 'ana.lopez@eskwelabs.com', fullName: 'Ana Lopez', cohortId: 2, location: 'Manila', status: 'active', registrationDate: '2024-02-20T11:00:00' },
  { id: 5, email: 'david.cruz@eskwelabs.com', fullName: 'David Cruz', cohortId: 2, location: 'Makati', status: 'active', registrationDate: '2024-02-25T15:30:00' },
  { id: 6, email: 'susan.torres@eskwelabs.com', fullName: 'Susan Torres', cohortId: 2, location: 'Cebu', status: 'active', registrationDate: '2024-03-01T08:00:00' },
  { id: 7, email: 'michael.chan@eskwelabs.com', fullName: 'Michael Chan', cohortId: 3, location: 'Manila', status: 'active', registrationDate: '2024-04-01T13:00:00' },
  { id: 8, email: 'jessica.smith@eskwelabs.com', fullName: 'Jessica Smith', cohortId: 3, location: 'Makati', status: 'active', registrationDate: '2024-04-05T10:00:00' },
  { id: 9, email: 'roberto.fernandez@eskwelabs.com', fullName: 'Roberto Fernandez', cohortId: 3, location: 'Pasig', status: 'active', registrationDate: '2024-04-10T16:00:00' },
  { id: 10, email: 'lisa.wong@eskwelabs.com', fullName: 'Lisa Wong', cohortId: 4, location: 'Manila', status: 'active', registrationDate: '2024-05-15T09:30:00' },
  { id: 11, email: 'antonio.morales@eskwelabs.com', fullName: 'Antonio Morales', cohortId: 4, location: 'Makati', status: 'active', registrationDate: '2024-05-20T14:00:00' },
  { id: 12, email: 'jennifer.lee@eskwelabs.com', fullName: 'Jennifer Lee', cohortId: 4, location: 'Makati', status: 'graduated', registrationDate: '2024-06-01T10:00:00' },
  { id: 13, email: 'marcus.johnson@eskwelabs.com', fullName: 'Marcus Johnson', cohortId: 1, location: 'Manila', status: 'graduated', registrationDate: '2024-01-10T10:00:00' },
  { id: 14, email: 'clara.hernandez@eskwelabs.com', fullName: 'Clara Hernandez', cohortId: 2, location: 'Makati', status: 'graduated', registrationDate: '2024-03-15T12:00:00' },
  { id: 15, email: 'richard.thompson@eskwelabs.com', fullName: 'Richard Thompson', cohortId: 3, location: 'Pasig', status: 'inactive', registrationDate: '2024-04-20T15:00:00' },
  { id: 16, email: 'victoria.martin@eskwelabs.com', fullName: 'Victoria Martin', cohortId: 5, location: 'Davao', status: 'active', registrationDate: '2024-08-10T11:00:00' },
  { id: 17, email: 'henry.jackson@eskwelabs.com', fullName: 'Henry Jackson', cohortId: 5, location: 'Manila', status: 'active', registrationDate: '2024-08-15T09:00:00' },
  { id: 18, email: 'sophia.white@eskwelabs.com', fullName: 'Sophia White', cohortId: 5, location: 'Makati', status: 'active', registrationDate: '2024-08-20T14:30:00' },
  { id: 19, email: 'daniel.harris@eskwelabs.com', fullName: 'Daniel Harris', cohortId: 1, location: 'Makati', status: 'active', registrationDate: '2024-01-18T10:30:00' },
  { id: 20, email: 'olivia.clark@eskwelabs.com', fullName: 'Olivia Clark', cohortId: 2, location: 'Manila', status: 'active', registrationDate: '2024-03-05T15:00:00' },
  { id: 21, email: 'james.rodriguez@eskwelabs.com', fullName: 'James Rodriguez', cohortId: 3, location: 'Makati', status: 'active', registrationDate: '2024-04-15T11:00:00' },
  { id: 22, email: 'emma.martinez@eskwelabs.com', fullName: 'Emma Martinez', cohortId: 4, location: 'Quezon City', status: 'active', registrationDate: '2024-06-10T13:00:00' },
  { id: 23, email: 'william.taylor@eskwelabs.com', fullName: 'William Taylor', cohortId: 5, location: 'Manila', status: 'active', registrationDate: '2024-08-25T10:00:00' },
  { id: 24, email: 'isabella.anderson@eskwelabs.com', fullName: 'Isabella Anderson', cohortId: 1, location: 'Pasig', status: 'active', registrationDate: '2024-01-20T14:00:00' },
  { id: 25, email: 'alexander.thomas@eskwelabs.com', fullName: 'Alexander Thomas', cohortId: 2, location: 'Makati', status: 'active', registrationDate: '2024-03-10T09:30:00' },
  { id: 26, email: 'charlotte.moore@eskwelabs.com', fullName: 'Charlotte Moore', cohortId: 3, location: 'Manila', status: 'graduated', registrationDate: '2024-05-01T15:30:00' },
  { id: 27, email: 'benjamin.jackson@eskwelabs.com', fullName: 'Benjamin Jackson', cohortId: 4, location: 'Makati', status: 'active', registrationDate: '2024-06-15T11:00:00' },
  { id: 28, email: 'amelia.white@eskwelabs.com', fullName: 'Amelia White', cohortId: 5, location: 'Cebu', status: 'active', registrationDate: '2024-09-01T10:00:00' },
  { id: 29, email: 'lucas.harris@eskwelabs.com', fullName: 'Lucas Harris', cohortId: 1, location: 'Manila', status: 'inactive', registrationDate: '2024-02-01T12:00:00' },
  { id: 30, email: 'mia.martin@eskwelabs.com', fullName: 'Mia Martin', cohortId: 2, location: 'Makati', status: 'active', registrationDate: '2024-03-20T16:00:00' },
]

const registrations: EventRegistration[] = [
  // Data Science Fellowship Orientation (Feb 1)
  { id: 1, eventId: 1, attendeeId: 1, registeredAt: '2024-01-25T10:00:00', attended: true, checkInTime: '2024-02-01T08:55:00' },
  { id: 2, eventId: 1, attendeeId: 2, registeredAt: '2024-01-26T14:00:00', attended: true, checkInTime: '2024-02-01T09:05:00' },
  { id: 3, eventId: 1, attendeeId: 3, registeredAt: '2024-01-27T11:00:00', attended: false, checkInTime: null },
  { id: 4, eventId: 1, attendeeId: 4, registeredAt: '2024-01-25T09:00:00', attended: true, checkInTime: '2024-02-01T09:00:00' },
  { id: 5, eventId: 1, attendeeId: 5, registeredAt: '2024-01-28T15:00:00', attended: false, checkInTime: null },
  { id: 6, eventId: 1, attendeeId: 6, registeredAt: '2024-01-26T10:00:00', attended: true, checkInTime: '2024-02-01T09:10:00' },
  { id: 7, eventId: 1, attendeeId: 7, registeredAt: '2024-01-29T12:00:00', attended: true, checkInTime: '2024-02-01T09:02:00' },
  { id: 8, eventId: 1, attendeeId: 8, registeredAt: '2024-01-25T13:00:00', attended: true, checkInTime: '2024-02-01T09:08:00' },
  { id: 9, eventId: 1, attendeeId: 9, registeredAt: '2024-01-30T10:00:00', attended: false, checkInTime: null },
  { id: 10, eventId: 1, attendeeId: 10, registeredAt: '2024-01-27T14:00:00', attended: true, checkInTime: '2024-02-01T09:12:00' },

  // Python for Data Analytics Masterclass (Feb 15)
  { id: 11, eventId: 2, attendeeId: 1, registeredAt: '2024-02-10T11:00:00', attended: true, checkInTime: '2024-02-15T17:55:00' },
  { id: 12, eventId: 2, attendeeId: 2, registeredAt: '2024-02-11T09:00:00', attended: true, checkInTime: '2024-02-15T18:00:00' },
  { id: 13, eventId: 2, attendeeId: 4, registeredAt: '2024-02-08T15:00:00', attended: true, checkInTime: '2024-02-15T18:05:00' },
  { id: 14, eventId: 2, attendeeId: 7, registeredAt: '2024-02-12T10:00:00', attended: false, checkInTime: null },
  { id: 15, eventId: 2, attendeeId: 10, registeredAt: '2024-02-09T14:00:00', attended: true, checkInTime: '2024-02-15T18:02:00' },
  { id: 16, eventId: 2, attendeeId: 11, registeredAt: '2024-02-13T16:00:00', attended: true, checkInTime: '2024-02-15T18:08:00' },
  { id: 17, eventId: 2, attendeeId: 13, registeredAt: '2024-02-06T12:00:00', attended: true, checkInTime: '2024-02-15T18:00:00' },
  { id: 18, eventId: 2, attendeeId: 14, registeredAt: '2024-02-11T10:00:00', attended: false, checkInTime: null },
  { id: 19, eventId: 2, attendeeId: 16, registeredAt: '2024-02-14T13:00:00', attended: true, checkInTime: '2024-02-15T18:10:00' },
  { id: 20, eventId: 2, attendeeId: 18, registeredAt: '2024-02-12T11:00:00', attended: true, checkInTime: '2024-02-15T18:03:00' },

  // SQL & Database Fundamentals Workshop (Mar 1)
  { id: 21, eventId: 3, attendeeId: 1, registeredAt: '2024-02-20T10:00:00', attended: true, checkInTime: '2024-03-01T08:50:00' },
  { id: 22, eventId: 3, attendeeId: 3, registeredAt: '2024-02-22T14:00:00', attended: true, checkInTime: '2024-03-01T09:00:00' },
  { id: 23, eventId: 3, attendeeId: 4, registeredAt: '2024-02-21T11:00:00', attended: true, checkInTime: '2024-03-01T09:05:00' },
  { id: 24, eventId: 3, attendeeId: 6, registeredAt: '2024-02-23T15:00:00', attended: false, checkInTime: null },
  { id: 25, eventId: 3, attendeeId: 7, registeredAt: '2024-02-19T09:00:00', attended: true, checkInTime: '2024-03-01T08:58:00' },
  { id: 26, eventId: 3, attendeeId: 8, registeredAt: '2024-02-24T13:00:00', attended: true, checkInTime: '2024-03-01T09:10:00' },
  { id: 27, eventId: 3, attendeeId: 11, registeredAt: '2024-02-20T16:00:00', attended: true, checkInTime: '2024-03-01T09:02:00' },
  { id: 28, eventId: 3, attendeeId: 15, registeredAt: '2024-02-25T12:00:00', attended: false, checkInTime: null },

  // Data Engineering Bootcamp Day 1 (Mar 15)
  { id: 29, eventId: 4, attendeeId: 2, registeredAt: '2024-03-01T14:00:00', attended: true, checkInTime: '2024-03-15T07:55:00' },
  { id: 30, eventId: 4, attendeeId: 4, registeredAt: '2024-03-05T10:00:00', attended: true, checkInTime: '2024-03-15T08:00:00' },
  { id: 31, eventId: 4, attendeeId: 5, registeredAt: '2024-03-03T11:00:00', attended: true, checkInTime: '2024-03-15T08:05:00' },
  { id: 32, eventId: 4, attendeeId: 6, registeredAt: '2024-03-02T15:00:00', attended: false, checkInTime: null },
  { id: 33, eventId: 4, attendeeId: 9, registeredAt: '2024-03-08T09:00:00', attended: true, checkInTime: '2024-03-15T08:10:00' },
  { id: 34, eventId: 4, attendeeId: 11, registeredAt: '2024-03-04T13:00:00', attended: true, checkInTime: '2024-03-15T08:02:00' },
  { id: 35, eventId: 4, attendeeId: 14, registeredAt: '2024-03-06T16:00:00', attended: true, checkInTime: '2024-03-15T08:08:00' },
  { id: 36, eventId: 4, attendeeId: 16, registeredAt: '2024-03-07T12:00:00', attended: false, checkInTime: null },

  // Statistics & Probability Fundamentals (Mar 20)
  { id: 37, eventId: 5, attendeeId: 1, registeredAt: '2024-03-15T10:00:00', attended: true, checkInTime: '2024-03-20T17:55:00' },
  { id: 38, eventId: 5, attendeeId: 3, registeredAt: '2024-03-16T14:00:00', attended: true, checkInTime: '2024-03-20T18:00:00' },
  { id: 39, eventId: 5, attendeeId: 5, registeredAt: '2024-03-14T11:00:00', attended: false, checkInTime: null },
  { id: 40, eventId: 5, attendeeId: 8, registeredAt: '2024-03-17T15:00:00', attended: true, checkInTime: '2024-03-20T18:05:00' },
  { id: 41, eventId: 5, attendeeId: 10, registeredAt: '2024-03-13T09:00:00', attended: true, checkInTime: '2024-03-20T18:02:00' },
  { id: 42, eventId: 5, attendeeId: 20, registeredAt: '2024-03-18T13:00:00', attended: true, checkInTime: '2024-03-20T18:08:00' },

  // Machine Learning with Scikit-Learn (Apr 5)
  { id: 43, eventId: 6, attendeeId: 1, registeredAt: '2024-03-28T10:00:00', attended: true, checkInTime: '2024-04-05T09:55:00' },
  { id: 44, eventId: 6, attendeeId: 4, registeredAt: '2024-03-29T14:00:00', attended: true, checkInTime: '2024-04-05T10:00:00' },
  { id: 45, eventId: 6, attendeeId: 7, registeredAt: '2024-03-30T11:00:00', attended: true, checkInTime: '2024-04-05T10:05:00' },
  { id: 46, eventId: 6, attendeeId: 9, registeredAt: '2024-04-01T15:00:00', attended: false, checkInTime: null },
  { id: 47, eventId: 6, attendeeId: 11, registeredAt: '2024-03-27T09:00:00', attended: true, checkInTime: '2024-04-05T10:02:00' },

  // Cloud Computing for Data Teams (Apr 10)
  { id: 48, eventId: 7, attendeeId: 2, registeredAt: '2024-04-03T10:00:00', attended: true, checkInTime: '2024-04-10T18:55:00' },
  { id: 49, eventId: 7, attendeeId: 5, registeredAt: '2024-04-04T14:00:00', attended: false, checkInTime: null },
  { id: 50, eventId: 7, attendeeId: 8, registeredAt: '2024-04-05T11:00:00', attended: true, checkInTime: '2024-04-10T19:00:00' },
  { id: 51, eventId: 7, attendeeId: 13, registeredAt: '2024-04-06T15:00:00', attended: true, checkInTime: '2024-04-10T19:05:00' },
  { id: 52, eventId: 7, attendeeId: 19, registeredAt: '2024-04-02T09:00:00', attended: true, checkInTime: '2024-04-10T19:02:00' },
  { id: 53, eventId: 7, attendeeId: 22, registeredAt: '2024-04-07T13:00:00', attended: false, checkInTime: null },

  // Data Career Development Meetup (Apr 20)
  { id: 54, eventId: 8, attendeeId: 1, registeredAt: '2024-04-10T10:00:00', attended: true, checkInTime: '2024-04-20T16:55:00' },
  { id: 55, eventId: 8, attendeeId: 2, registeredAt: '2024-04-12T14:00:00', attended: true, checkInTime: '2024-04-20T17:02:00' },
  { id: 56, eventId: 8, attendeeId: 4, registeredAt: '2024-04-08T11:00:00', attended: true, checkInTime: '2024-04-20T17:00:00' },
  { id: 57, eventId: 8, attendeeId: 7, registeredAt: '2024-04-15T15:00:00', attended: false, checkInTime: null },
  { id: 58, eventId: 8, attendeeId: 10, registeredAt: '2024-04-11T09:00:00', attended: true, checkInTime: '2024-04-20T17:05:00' },
  { id: 59, eventId: 8, attendeeId: 13, registeredAt: '2024-04-14T13:00:00', attended: true, checkInTime: '2024-04-20T17:08:00' },
  { id: 60, eventId: 8, attendeeId: 18, registeredAt: '2024-04-13T16:00:00', attended: true, checkInTime: '2024-04-20T17:03:00' },
  { id: 61, eventId: 8, attendeeId: 20, registeredAt: '2024-04-09T12:00:00', attended: false, checkInTime: null },

  // Data Visualization with Tableau (May 1)
  { id: 62, eventId: 9, attendeeId: 3, registeredAt: '2024-04-22T10:00:00', attended: true, checkInTime: '2024-05-01T08:55:00' },
  { id: 63, eventId: 9, attendeeId: 6, registeredAt: '2024-04-23T14:00:00', attended: true, checkInTime: '2024-05-01T09:00:00' },
  { id: 64, eventId: 9, attendeeId: 10, registeredAt: '2024-04-24T11:00:00', attended: true, checkInTime: '2024-05-01T09:05:00' },
  { id: 65, eventId: 9, attendeeId: 12, registeredAt: '2024-04-25T15:00:00', attended: false, checkInTime: null },
  { id: 66, eventId: 9, attendeeId: 21, registeredAt: '2024-04-26T09:00:00', attended: true, checkInTime: '2024-05-01T09:02:00' },
  { id: 67, eventId: 9, attendeeId: 24, registeredAt: '2024-04-27T13:00:00', attended: true, checkInTime: '2024-05-01T09:10:00' },

  // Deep Learning Fundamentals (May 15)
  { id: 68, eventId: 10, attendeeId: 1, registeredAt: '2024-05-08T10:00:00', attended: true, checkInTime: '2024-05-15T17:55:00' },
  { id: 69, eventId: 10, attendeeId: 4, registeredAt: '2024-05-09T14:00:00', attended: true, checkInTime: '2024-05-15T18:00:00' },
  { id: 70, eventId: 10, attendeeId: 7, registeredAt: '2024-05-10T11:00:00', attended: false, checkInTime: null },
  { id: 71, eventId: 10, attendeeId: 11, registeredAt: '2024-05-11T15:00:00', attended: true, checkInTime: '2024-05-15T18:05:00' },
  { id: 72, eventId: 10, attendeeId: 15, registeredAt: '2024-05-07T09:00:00', attended: false, checkInTime: null },
  { id: 73, eventId: 10, attendeeId: 25, registeredAt: '2024-05-12T13:00:00', attended: true, checkInTime: '2024-05-15T18:08:00' },

  // NLP & Text Analytics Workshop (Jun 1)
  { id: 74, eventId: 11, attendeeId: 2, registeredAt: '2024-05-22T10:00:00', attended: true, checkInTime: '2024-06-01T09:55:00' },
  { id: 75, eventId: 11, attendeeId: 8, registeredAt: '2024-05-23T14:00:00', attended: true, checkInTime: '2024-06-01T10:00:00' },
  { id: 76, eventId: 11, attendeeId: 14, registeredAt: '2024-05-24T11:00:00', attended: false, checkInTime: null },
  { id: 77, eventId: 11, attendeeId: 21, registeredAt: '2024-05-25T15:00:00', attended: true, checkInTime: '2024-06-01T10:05:00' },

  // Monthly Data Science Talk Series (Jun 15)
  { id: 78, eventId: 12, attendeeId: 1, registeredAt: '2024-06-01T10:00:00', attended: true, checkInTime: '2024-06-15T17:25:00' },
  { id: 79, eventId: 12, attendeeId: 2, registeredAt: '2024-06-05T14:00:00', attended: true, checkInTime: '2024-06-15T17:32:00' },
  { id: 80, eventId: 12, attendeeId: 4, registeredAt: '2024-06-03T11:00:00', attended: true, checkInTime: '2024-06-15T17:30:00' },
  { id: 81, eventId: 12, attendeeId: 7, registeredAt: '2024-06-08T15:00:00', attended: false, checkInTime: null },
  { id: 82, eventId: 12, attendeeId: 10, registeredAt: '2024-06-02T09:00:00', attended: true, checkInTime: '2024-06-15T17:28:00' },
  { id: 83, eventId: 12, attendeeId: 12, registeredAt: '2024-06-10T13:00:00', attended: true, checkInTime: '2024-06-15T17:35:00' },
  { id: 84, eventId: 12, attendeeId: 19, registeredAt: '2024-06-04T16:00:00', attended: true, checkInTime: '2024-06-15T17:33:00' },
  { id: 85, eventId: 12, attendeeId: 21, registeredAt: '2024-06-07T12:00:00', attended: false, checkInTime: null },
  { id: 86, eventId: 12, attendeeId: 23, registeredAt: '2024-06-06T10:00:00', attended: true, checkInTime: '2024-06-15T17:31:00' },
  { id: 87, eventId: 12, attendeeId: 25, registeredAt: '2024-06-09T11:00:00', attended: true, checkInTime: '2024-06-15T17:29:00' },

  // Data Pipeline Design Workshop (Jul 1)
  { id: 88, eventId: 13, attendeeId: 3, registeredAt: '2024-06-22T10:00:00', attended: true, checkInTime: '2024-07-01T08:55:00' },
  { id: 89, eventId: 13, attendeeId: 9, registeredAt: '2024-06-23T14:00:00', attended: true, checkInTime: '2024-07-01T09:00:00' },
  { id: 90, eventId: 13, attendeeId: 11, registeredAt: '2024-06-24T11:00:00', attended: false, checkInTime: null },
  { id: 91, eventId: 13, attendeeId: 19, registeredAt: '2024-06-25T15:00:00', attended: true, checkInTime: '2024-07-01T09:05:00' },
  { id: 92, eventId: 13, attendeeId: 27, registeredAt: '2024-06-26T09:00:00', attended: true, checkInTime: '2024-07-01T09:02:00' },

  // Data Ethics & Privacy Seminar (Jul 10)
  { id: 93, eventId: 14, attendeeId: 2, registeredAt: '2024-07-03T10:00:00', attended: true, checkInTime: '2024-07-10T17:55:00' },
  { id: 94, eventId: 14, attendeeId: 6, registeredAt: '2024-07-04T14:00:00', attended: true, checkInTime: '2024-07-10T18:00:00' },
  { id: 95, eventId: 14, attendeeId: 10, registeredAt: '2024-07-05T11:00:00', attended: false, checkInTime: null },
  { id: 96, eventId: 14, attendeeId: 14, registeredAt: '2024-07-06T15:00:00', attended: true, checkInTime: '2024-07-10T18:05:00' },
  { id: 97, eventId: 14, attendeeId: 22, registeredAt: '2024-07-02T09:00:00', attended: true, checkInTime: '2024-07-10T18:02:00' },
  { id: 98, eventId: 14, attendeeId: 26, registeredAt: '2024-07-07T13:00:00', attended: false, checkInTime: null },

  // Analytics Engineering Bootcamp (Jul 20)
  { id: 99, eventId: 15, attendeeId: 1, registeredAt: '2024-07-12T10:00:00', attended: true, checkInTime: '2024-07-20T07:55:00' },
  { id: 100, eventId: 15, attendeeId: 5, registeredAt: '2024-07-13T14:00:00', attended: true, checkInTime: '2024-07-20T08:00:00' },
  { id: 101, eventId: 15, attendeeId: 8, registeredAt: '2024-07-14T11:00:00', attended: true, checkInTime: '2024-07-20T08:05:00' },
  { id: 102, eventId: 15, attendeeId: 13, registeredAt: '2024-07-15T15:00:00', attended: false, checkInTime: null },
  { id: 103, eventId: 15, attendeeId: 17, registeredAt: '2024-07-11T09:00:00', attended: true, checkInTime: '2024-07-20T08:10:00' },
  { id: 104, eventId: 15, attendeeId: 23, registeredAt: '2024-07-16T13:00:00', attended: true, checkInTime: '2024-07-20T08:02:00' },
  { id: 105, eventId: 15, attendeeId: 28, registeredAt: '2024-07-17T16:00:00', attended: false, checkInTime: null },

  // AI & Generative Models Introduction (Aug 5)
  { id: 106, eventId: 16, attendeeId: 4, registeredAt: '2024-07-28T10:00:00', attended: true, checkInTime: '2024-08-05T18:55:00' },
  { id: 107, eventId: 16, attendeeId: 7, registeredAt: '2024-07-29T14:00:00', attended: true, checkInTime: '2024-08-05T19:00:00' },
  { id: 108, eventId: 16, attendeeId: 11, registeredAt: '2024-07-30T11:00:00', attended: true, checkInTime: '2024-08-05T19:05:00' },
  { id: 109, eventId: 16, attendeeId: 16, registeredAt: '2024-07-31T15:00:00', attended: true, checkInTime: '2024-08-05T19:02:00' },
  { id: 110, eventId: 16, attendeeId: 20, registeredAt: '2024-08-01T09:00:00', attended: false, checkInTime: null },
  { id: 111, eventId: 16, attendeeId: 24, registeredAt: '2024-08-02T13:00:00', attended: true, checkInTime: '2024-08-05T19:08:00' },

  // Git & Version Control for Data Projects (Aug 15)
  { id: 112, eventId: 17, attendeeId: 3, registeredAt: '2024-08-08T10:00:00', attended: true, checkInTime: '2024-08-15T09:55:00' },
  { id: 113, eventId: 17, attendeeId: 9, registeredAt: '2024-08-09T14:00:00', attended: false, checkInTime: null },
  { id: 114, eventId: 17, attendeeId: 15, registeredAt: '2024-08-10T11:00:00', attended: false, checkInTime: null },
  { id: 115, eventId: 17, attendeeId: 18, registeredAt: '2024-08-11T15:00:00', attended: true, checkInTime: '2024-08-15T10:00:00' },
  { id: 116, eventId: 17, attendeeId: 26, registeredAt: '2024-08-07T09:00:00', attended: true, checkInTime: '2024-08-15T10:05:00' },

  // Agile Data Science Methodologies (Aug 25)
  { id: 117, eventId: 18, attendeeId: 2, registeredAt: '2024-08-18T10:00:00', attended: true, checkInTime: '2024-08-25T17:55:00' },
  { id: 118, eventId: 18, attendeeId: 6, registeredAt: '2024-08-19T14:00:00', attended: false, checkInTime: null },
  { id: 119, eventId: 18, attendeeId: 12, registeredAt: '2024-08-20T11:00:00', attended: true, checkInTime: '2024-08-25T18:00:00' },
  { id: 120, eventId: 18, attendeeId: 17, registeredAt: '2024-08-21T15:00:00', attended: true, checkInTime: '2024-08-25T18:05:00' },
  { id: 121, eventId: 18, attendeeId: 25, registeredAt: '2024-08-17T09:00:00', attended: true, checkInTime: '2024-08-25T18:02:00' },
  { id: 122, eventId: 18, attendeeId: 30, registeredAt: '2024-08-22T13:00:00', attended: false, checkInTime: null },

  // ESKwelabs Data Summit 2024 (Sep 1-2)
  { id: 123, eventId: 19, attendeeId: 1, registeredAt: '2024-08-15T10:00:00', attended: true, checkInTime: '2024-09-01T07:50:00' },
  { id: 124, eventId: 19, attendeeId: 2, registeredAt: '2024-08-20T14:00:00', attended: true, checkInTime: '2024-09-01T08:00:00' },
  { id: 125, eventId: 19, attendeeId: 4, registeredAt: '2024-08-18T11:00:00', attended: true, checkInTime: '2024-09-01T08:05:00' },
  { id: 126, eventId: 19, attendeeId: 7, registeredAt: '2024-08-22T15:00:00', attended: true, checkInTime: '2024-09-01T08:10:00' },
  { id: 127, eventId: 19, attendeeId: 10, registeredAt: '2024-08-16T09:00:00', attended: true, checkInTime: '2024-09-01T07:55:00' },
  { id: 128, eventId: 19, attendeeId: 12, registeredAt: '2024-08-25T13:00:00', attended: false, checkInTime: null },
  { id: 129, eventId: 19, attendeeId: 16, registeredAt: '2024-08-21T16:00:00', attended: true, checkInTime: '2024-09-01T08:15:00' },
  { id: 130, eventId: 19, attendeeId: 18, registeredAt: '2024-08-23T12:00:00', attended: true, checkInTime: '2024-09-01T08:08:00' },
  { id: 131, eventId: 19, attendeeId: 19, registeredAt: '2024-08-24T10:00:00', attended: true, checkInTime: '2024-09-01T08:02:00' },
  { id: 132, eventId: 19, attendeeId: 20, registeredAt: '2024-08-19T11:00:00', attended: false, checkInTime: null },
  { id: 133, eventId: 19, attendeeId: 22, registeredAt: '2024-08-26T14:00:00', attended: true, checkInTime: '2024-09-01T08:12:00' },
  { id: 134, eventId: 19, attendeeId: 23, registeredAt: '2024-08-17T15:00:00', attended: true, checkInTime: '2024-09-01T08:20:00' },
  { id: 135, eventId: 19, attendeeId: 25, registeredAt: '2024-08-28T09:00:00', attended: true, checkInTime: '2024-09-01T08:06:00' },
  { id: 136, eventId: 19, attendeeId: 27, registeredAt: '2024-08-29T13:00:00', attended: false, checkInTime: null },
  { id: 137, eventId: 19, attendeeId: 28, registeredAt: '2024-08-27T16:00:00', attended: true, checkInTime: '2024-09-01T08:18:00' },

  // Monthly Community Standup (Sep 20)
  { id: 138, eventId: 20, attendeeId: 1, registeredAt: '2024-09-10T10:00:00', attended: true, checkInTime: '2024-09-20T16:55:00' },
  { id: 139, eventId: 20, attendeeId: 5, registeredAt: '2024-09-11T14:00:00', attended: false, checkInTime: null },
  { id: 140, eventId: 20, attendeeId: 10, registeredAt: '2024-09-12T11:00:00', attended: true, checkInTime: '2024-09-20T17:00:00' },
  { id: 141, eventId: 20, attendeeId: 16, registeredAt: '2024-09-13T15:00:00', attended: true, checkInTime: '2024-09-20T17:05:00' },
  { id: 142, eventId: 20, attendeeId: 23, registeredAt: '2024-09-09T09:00:00', attended: true, checkInTime: '2024-09-20T17:02:00' },
  { id: 143, eventId: 20, attendeeId: 28, registeredAt: '2024-09-14T13:00:00', attended: false, checkInTime: null },
  { id: 144, eventId: 20, attendeeId: 30, registeredAt: '2024-09-15T16:00:00', attended: true, checkInTime: '2024-09-20T17:08:00' },
]

// --- Filter Parameters ---

export interface FilterParams {
  dateRange?: 'all' | '7days' | '30days' | '90days'
  eventType?: 'all' | string
  cohort?: 'all' | string   // e.g. 'cohort-1' => cohortId 1
  location?: 'all' | string // e.g. 'manila', 'makati', 'quezon-city'
}

// --- Data Store Class ---

class DataStore {
  private cohorts: Cohort[]
  private events: Event[]
  private attendees: Attendee[]
  private registrations: EventRegistration[]

  constructor() {
    this.cohorts = [...cohorts]
    this.events = [...events]
    this.attendees = [...attendees]
    this.registrations = [...registrations]
  }

  // --- Filtering helper ---
  private getFilteredData(filters?: FilterParams) {
    let filteredEvents = [...this.events]
    let filteredAttendees = [...this.attendees]
    let filteredRegistrations = [...this.registrations]

    if (!filters) return { events: filteredEvents, attendees: filteredAttendees, registrations: filteredRegistrations }

    // Filter by date range — relative to the most recent event in the dataset
    if (filters.dateRange && filters.dateRange !== 'all') {
      // Find the latest event date in the dataset as the reference point
      const latestEventDate = filteredEvents.reduce((latest, e) => {
        const d = new Date(e.startDate)
        return d > latest ? d : latest
      }, new Date(0))

      let cutoff: Date
      switch (filters.dateRange) {
        case '7days':
          cutoff = new Date(latestEventDate.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30days':
          cutoff = new Date(latestEventDate.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case '90days':
          cutoff = new Date(latestEventDate.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        default:
          cutoff = new Date(0)
      }
      filteredEvents = filteredEvents.filter(e => new Date(e.startDate) >= cutoff)
    }

    // Filter by event type
    if (filters.eventType && filters.eventType !== 'all') {
      filteredEvents = filteredEvents.filter(e => e.eventType === filters.eventType)
    }

    // Filter by location (event location)
    if (filters.location && filters.location !== 'all') {
      const loc = filters.location.replace(/-/g, ' ').toLowerCase()
      filteredEvents = filteredEvents.filter(e => e.location.toLowerCase() === loc)
    }

    // Filter registrations to only those for filtered events
    const filteredEventIds = new Set(filteredEvents.map(e => e.id))
    filteredRegistrations = filteredRegistrations.filter(r => filteredEventIds.has(r.eventId))

    // Filter by cohort (attendee's cohort)
    if (filters.cohort && filters.cohort !== 'all') {
      const cohortId = parseInt(filters.cohort.replace('cohort-', ''))
      if (!isNaN(cohortId)) {
        filteredAttendees = filteredAttendees.filter(a => a.cohortId === cohortId)
        const attendeeIds = new Set(filteredAttendees.map(a => a.id))
        filteredRegistrations = filteredRegistrations.filter(r => attendeeIds.has(r.attendeeId))
      }
    }

    // Narrow attendees to only those who have registrations in the filtered event set.
    // This ensures demographics totals match the KPI "Total Attendees" count.
    const registeredAttendeeIds = new Set(filteredRegistrations.map(r => r.attendeeId))
    filteredAttendees = filteredAttendees.filter(a => registeredAttendeeIds.has(a.id))

    return { events: filteredEvents, attendees: filteredAttendees, registrations: filteredRegistrations }
  }

  // --- Cohorts ---
  getCohorts() { return this.cohorts }
  getCohortById(id: number) { return this.cohorts.find(c => c.id === id) }

  // --- Events ---
  getEvents() { return this.events }
  getEventById(id: number) { return this.events.find(e => e.id === id) }
  addEvent(event: Omit<Event, 'id'>): Event {
    const newId = Math.max(...this.events.map(e => e.id), 0) + 1
    const newEvent = { ...event, id: newId }
    this.events.push(newEvent)
    return newEvent
  }
  deleteEvent(id: number): boolean {
    const idx = this.events.findIndex(e => e.id === id)
    if (idx === -1) return false
    this.events.splice(idx, 1)
    // Also remove all registrations for this event
    this.registrations = this.registrations.filter(r => r.eventId !== id)
    return true
  }

  // --- Attendees ---
  getAttendees() { return this.attendees }
  getAttendeeById(id: number) { return this.attendees.find(a => a.id === id) }
  getAttendeeByEmail(email: string) { return this.attendees.find(a => a.email === email) }
  addAttendee(attendee: Omit<Attendee, 'id'>): Attendee {
    const newId = Math.max(...this.attendees.map(a => a.id), 0) + 1
    const newAttendee = { ...attendee, id: newId }
    this.attendees.push(newAttendee)
    return newAttendee
  }
  deleteAttendee(id: number): boolean {
    const idx = this.attendees.findIndex(a => a.id === id)
    if (idx === -1) return false
    this.attendees.splice(idx, 1)
    // Also remove all registrations for this attendee
    this.registrations = this.registrations.filter(r => r.attendeeId !== id)
    return true
  }

  // --- Registrations ---
  getRegistrations() { return this.registrations }
  getRegistrationsByEvent(eventId: number) { return this.registrations.filter(r => r.eventId === eventId) }
  getRegistrationsByAttendee(attendeeId: number) { return this.registrations.filter(r => r.attendeeId === attendeeId) }
  addRegistration(reg: Omit<EventRegistration, 'id'>): EventRegistration {
    const newId = Math.max(...this.registrations.map(r => r.id), 0) + 1
    const newReg = { ...reg, id: newId }
    this.registrations.push(newReg)
    return newReg
  }
  deleteRegistration(id: number): boolean {
    const idx = this.registrations.findIndex(r => r.id === id)
    if (idx === -1) return false
    this.registrations.splice(idx, 1)
    return true
  }

  // --- Computed Stats ---
  getStats(filters?: FilterParams) {
    const { events: fEvents, registrations: fRegs } = this.getFilteredData(filters)
    const totalEvents = fEvents.length
    // Count unique attendees who have registrations in the filtered results
    const uniqueAttendeeIds = new Set(fRegs.map(r => r.attendeeId))
    const totalAttendees = uniqueAttendeeIds.size
    const totalRegistrations = fRegs.length
    
    const eventRates = fEvents.map(e => {
      const regs = fRegs.filter(r => r.eventId === e.id)
      const attended = regs.filter(r => r.attended).length
      return regs.length > 0 ? (attended / regs.length) * 100 : 0
    }).filter(r => r > 0)

    const avgRate = eventRates.length > 0
      ? eventRates.reduce((a, b) => a + b, 0) / eventRates.length
      : 0

    // Calculate trends by comparing first half vs second half of events
    const sortedEvents = [...fEvents].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    const midpoint = Math.floor(sortedEvents.length / 2)
    const firstHalfEvents = sortedEvents.slice(0, midpoint)
    const secondHalfEvents = sortedEvents.slice(midpoint)

    const firstHalfEventIds = new Set(firstHalfEvents.map(e => e.id))
    const secondHalfEventIds = new Set(secondHalfEvents.map(e => e.id))

    const firstRegs = fRegs.filter(r => firstHalfEventIds.has(r.eventId))
    const secondRegs = fRegs.filter(r => secondHalfEventIds.has(r.eventId))

    const firstAttendees = new Set(firstRegs.map(r => r.attendeeId)).size
    const secondAttendees = new Set(secondRegs.map(r => r.attendeeId)).size

    const firstAttendedRate = firstHalfEvents.length > 0
      ? firstHalfEvents.map(e => {
          const regs = firstRegs.filter(r => r.eventId === e.id)
          const att = regs.filter(r => r.attended).length
          return regs.length > 0 ? (att / regs.length) * 100 : 0
        }).filter(r => r > 0).reduce((a, b, _, arr) => a + b / arr.length, 0)
      : 0

    const secondAttendedRate = secondHalfEvents.length > 0
      ? secondHalfEvents.map(e => {
          const regs = secondRegs.filter(r => r.eventId === e.id)
          const att = regs.filter(r => r.attended).length
          return regs.length > 0 ? (att / regs.length) * 100 : 0
        }).filter(r => r > 0).reduce((a, b, _, arr) => a + b / arr.length, 0)
      : 0

    const calcTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return parseFloat((((current - previous) / previous) * 100).toFixed(1))
    }

    return {
      totalEvents,
      totalAttendees,
      totalRegistrations,
      averageAttendanceRate: avgRate.toFixed(2),
      trends: {
        events: calcTrend(secondHalfEvents.length, firstHalfEvents.length),
        attendees: calcTrend(secondAttendees, firstAttendees),
        registrations: calcTrend(secondRegs.length, firstRegs.length),
        attendanceRate: calcTrend(secondAttendedRate, firstAttendedRate),
      }
    }
  }

  getAttendanceTrends(filters?: FilterParams) {
    const { events: fEvents, registrations: fRegs } = this.getFilteredData(filters)
    const dateMap = new Map<string, { events: Set<number>, attended: number, registered: number }>()

    for (const event of fEvents) {
      const dateStr = event.startDate.split('T')[0]
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { events: new Set(), attended: 0, registered: 0 })
      }
      const entry = dateMap.get(dateStr)!
      entry.events.add(event.id)

      const regs = fRegs.filter(r => r.eventId === event.id)
      entry.registered += regs.length
      entry.attended += regs.filter(r => r.attended).length
    }

    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        eventsCount: data.events.size,
        attended: data.attended,
        registered: data.registered,
        attendanceRate: data.registered > 0 ? parseFloat(((data.attended / data.registered) * 100).toFixed(2)) : 0
      }))
  }

  getEventsWithStats(limit: number = 20, filters?: FilterParams) {
    const { events: fEvents, registrations: fRegs } = this.getFilteredData(filters)
    return fEvents
      .map(e => {
        const regs = fRegs.filter(r => r.eventId === e.id)
        const attended = regs.filter(r => r.attended).length
        return {
          id: e.id,
          name: e.name,
          type: e.eventType,
          date: new Date(e.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          location: e.location,
          capacity: e.capacity,
          attended,
          registered: regs.length,
          attendanceRate: regs.length > 0 ? parseFloat(((attended / regs.length) * 100).toFixed(2)) : 0
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
  }

  getNoShows(limit: number = 10, filters?: FilterParams) {
    const { events: fEvents, registrations: fRegs } = this.getFilteredData(filters)
    return fEvents
      .map(e => {
        const regs = fRegs.filter(r => r.eventId === e.id)
        const noShows = regs.filter(r => !r.attended).length
        return {
          eventName: e.name,
          eventType: e.eventType,
          date: new Date(e.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
          noShowCount: noShows,
          totalRegistered: regs.length,
          noShowRate: regs.length > 0 ? parseFloat(((noShows / regs.length) * 100).toFixed(2)) : 0
        }
      })
      .filter(e => e.noShowCount > 0)
      .sort((a, b) => b.noShowRate - a.noShowRate || b.noShowCount - a.noShowCount)
      .slice(0, limit)
  }

  getDemographicsByCohort(filters?: FilterParams) {
    const { attendees: fAttendees, registrations: fRegs } = this.getFilteredData(filters)
    return this.cohorts.map(c => {
      const members = fAttendees.filter(a => a.cohortId === c.id)
      const memberIds = members.map(m => m.id)
      const attendedEvents = fRegs.filter(r => memberIds.includes(r.attendeeId) && r.attended).length
      return {
        name: c.name,
        total_attendees: members.length,
        active: members.filter(m => m.status === 'active').length,
        graduated: members.filter(m => m.status === 'graduated').length,
        inactive: members.filter(m => m.status === 'inactive').length,
        attended_events: attendedEvents
      }
    })
  }

  getDemographicsByLocation(filters?: FilterParams) {
    const { attendees: fAttendees, registrations: fRegs } = this.getFilteredData(filters)
    const locations = [...new Set(fAttendees.map(a => a.location))]
    return locations.map(loc => {
      const members = fAttendees.filter(a => a.location === loc)
      const memberIds = members.map(m => m.id)
      const attendedEvents = fRegs.filter(r => memberIds.includes(r.attendeeId) && r.attended).length
      return {
        location: loc,
        total_attendees: members.length,
        active: members.filter(m => m.status === 'active').length,
        graduated: members.filter(m => m.status === 'graduated').length,
        inactive: members.filter(m => m.status === 'inactive').length,
        attended_events: attendedEvents
      }
    }).sort((a, b) => b.total_attendees - a.total_attendees)
  }

  getDemographicsByStatus(filters?: FilterParams) {
    const { attendees: fAttendees } = this.getFilteredData(filters)
    const statuses = ['active', 'graduated', 'inactive'] as const
    return statuses.map(s => ({
      status: s,
      count: fAttendees.filter(a => a.status === s).length
    })).sort((a, b) => b.count - a.count)
  }

  // --- Full summary for AI ---
  getFullSummary(): string {
    const stats = this.getStats()
    const noShows = this.getNoShows(5)
    const cohortDemo = this.getDemographicsByCohort()
    const locationDemo = this.getDemographicsByLocation()
    const statusDemo = this.getDemographicsByStatus()
    const eventStats = this.getEventsWithStats(20)

    const bestEvent = eventStats.reduce((best, e) => e.attendanceRate > best.attendanceRate ? e : best, eventStats[0])
    const worstEvent = eventStats.reduce((worst, e) => e.attendanceRate < worst.attendanceRate ? e : worst, eventStats[0])

    return `
ESKWELABS Event Attendance Dashboard Data Summary:

OVERVIEW:
- Total Events: ${stats.totalEvents}
- Total Attendees: ${stats.totalAttendees}
- Total Registrations: ${stats.totalRegistrations}
- Average Attendance Rate: ${stats.averageAttendanceRate}%

COHORT BREAKDOWN:
${cohortDemo.map(c => `- ${c.name}: ${c.total_attendees} members (${c.active} active, ${c.graduated} graduated, ${c.inactive} inactive), ${c.attended_events} event attendances`).join('\n')}

LOCATION BREAKDOWN:
${locationDemo.map(l => `- ${l.location}: ${l.total_attendees} attendees (${l.active} active, ${l.graduated} graduated, ${l.inactive} inactive)`).join('\n')}

STATUS BREAKDOWN:
${statusDemo.map(s => `- ${s.status}: ${s.count}`).join('\n')}

TOP NO-SHOW EVENTS:
${noShows.map(n => `- ${n.eventName}: ${n.noShowCount}/${n.totalRegistered} no-shows (${n.noShowRate}%)`).join('\n')}

EVENT PERFORMANCE:
${eventStats.map(e => `- ${e.name}: ${e.attended}/${e.registered} attended (${e.attendanceRate}%), Type: ${e.type}, Location: ${e.location}`).join('\n')}

BEST PERFORMING EVENT: ${bestEvent?.name} (${bestEvent?.attendanceRate}%)
WORST PERFORMING EVENT: ${worstEvent?.name} (${worstEvent?.attendanceRate}%)

EVENT TYPES: ${[...new Set(eventStats.map(e => e.type))].join(', ')}
LOCATIONS: ${[...new Set(eventStats.map(e => e.location))].join(', ')}
`
  }
}

// Singleton instance — use globalThis to survive HMR in Next.js dev mode
const globalForDataStore = globalThis as unknown as { __dataStore?: DataStore }
export const dataStore = globalForDataStore.__dataStore ?? new DataStore()
globalForDataStore.__dataStore = dataStore
