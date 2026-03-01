-- Event Attendance Analytics Schema for ESKwelabs

-- Drop existing tables if they exist
DROP TABLE IF EXISTS attendance_summary CASCADE;
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS attendees CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS cohorts CASCADE;

-- Create Events table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  event_type VARCHAR(50) NOT NULL, -- workshop, webinar, meetup, bootcamp, conference
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  capacity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Cohorts table
CREATE TABLE cohorts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Attendees table
CREATE TABLE attendees (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  cohort_id INTEGER REFERENCES cohorts(id),
  location VARCHAR(100),
  status VARCHAR(50), -- active, graduated, inactive
  registration_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Event Registrations table
CREATE TABLE event_registrations (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id),
  attendee_id INTEGER NOT NULL REFERENCES attendees(id),
  registered_at TIMESTAMP NOT NULL,
  attended BOOLEAN DEFAULT FALSE,
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  notes VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, attendee_id)
);

-- Create Attendance Summary table (for faster queries)
CREATE TABLE attendance_summary (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL UNIQUE REFERENCES events(id),
  total_registered INTEGER,
  total_attended INTEGER,
  attendance_rate DECIMAL(5, 2),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_events_date ON events(start_date);
CREATE INDEX idx_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_registrations_attendee ON event_registrations(attendee_id);
CREATE INDEX idx_attendees_cohort ON attendees(cohort_id);
CREATE INDEX idx_registrations_attended ON event_registrations(attended);

-- Insert Cohorts
INSERT INTO cohorts (name, start_date, end_date) VALUES
('Alpha Cohort', '2024-01-15', '2024-06-15'),
('Beta Cohort', '2024-03-01', '2024-08-01'),
('Gamma Cohort', '2024-05-15', '2024-10-15'),
('Delta Cohort', '2024-07-01', '2024-12-01'),
('Epsilon Cohort', '2024-09-01', '2025-02-01');

-- Insert Events (ESKwelabs themed)
INSERT INTO events (name, event_type, start_date, end_date, location, capacity) VALUES
('React Fundamentals Workshop', 'workshop', '2024-02-01 09:00:00', '2024-02-01 17:00:00', 'Manila', 50),
('TypeScript Masterclass', 'webinar', '2024-02-15 18:00:00', '2024-02-15 20:00:00', 'Online', 200),
('Web Performance Optimization', 'workshop', '2024-03-01 09:00:00', '2024-03-01 17:00:00', 'Manila', 40),
('Full Stack Development Bootcamp Day 1', 'bootcamp', '2024-03-15 08:00:00', '2024-03-15 17:00:00', 'Makati', 60),
('Database Design Fundamentals', 'webinar', '2024-03-20 18:00:00', '2024-03-20 20:00:00', 'Online', 150),
('Next.js Advanced Patterns', 'workshop', '2024-04-05 10:00:00', '2024-04-05 16:00:00', 'Manila', 35),
('AWS Cloud Essentials', 'webinar', '2024-04-10 19:00:00', '2024-04-10 21:00:00', 'Online', 180),
('Career Development Meetup', 'meetup', '2024-04-20 17:00:00', '2024-04-20 19:00:00', 'Makati', 80),
('Testing Strategies Workshop', 'workshop', '2024-05-01 09:00:00', '2024-05-01 17:00:00', 'Manila', 45),
('DevOps Fundamentals', 'webinar', '2024-05-15 18:00:00', '2024-05-15 20:00:00', 'Online', 120),
('Mobile Development Track', 'workshop', '2024-06-01 10:00:00', '2024-06-01 16:00:00', 'Manila', 30),
('Monthly Tech Talk Series', 'meetup', '2024-06-15 17:30:00', '2024-06-15 19:30:00', 'Makati', 100),
('API Design Workshop', 'workshop', '2024-07-01 09:00:00', '2024-07-01 17:00:00', 'Manila', 40),
('Security Best Practices', 'webinar', '2024-07-10 18:00:00', '2024-07-10 20:00:00', 'Online', 160),
('Networking Bootcamp', 'bootcamp', '2024-07-20 08:00:00', '2024-07-20 17:00:00', 'Makati', 70),
('Machine Learning Intro', 'webinar', '2024-08-05 19:00:00', '2024-08-05 21:00:00', 'Online', 140),
('Git & GitHub Mastery', 'workshop', '2024-08-15 10:00:00', '2024-08-15 16:00:00', 'Manila', 50),
('Agile Methodologies', 'webinar', '2024-08-25 18:00:00', '2024-08-25 20:00:00', 'Online', 110),
('ESKwelabs Hackathon 2024', 'conference', '2024-09-01 08:00:00', '2024-09-02 18:00:00', 'Makati', 200),
('Monthly Standup Meeting', 'meetup', '2024-09-20 17:00:00', '2024-09-20 18:00:00', 'Makati', 150);

-- Insert Attendees (synthetic ESKwelabs learners)
INSERT INTO attendees (email, full_name, cohort_id, location, status, registration_date) VALUES
('juan.santos@eskwelabs.com', 'Juan Santos', 1, 'Manila', 'active', '2024-01-10 10:00:00'),
('maria.garcia@eskwelabs.com', 'Maria Garcia', 1, 'Makati', 'active', '2024-01-12 14:30:00'),
('carlos.reyes@eskwelabs.com', 'Carlos Reyes', 1, 'Quezon City', 'active', '2024-01-15 09:00:00'),
('ana.lopez@eskwelabs.com', 'Ana Lopez', 2, 'Manila', 'active', '2024-02-20 11:00:00'),
('david.cruz@eskwelabs.com', 'David Cruz', 2, 'Makati', 'active', '2024-02-25 15:30:00'),
('susan.torres@eskwelabs.com', 'Susan Torres', 2, 'Cebu', 'active', '2024-03-01 08:00:00'),
('michael.chan@eskwelabs.com', 'Michael Chan', 3, 'Manila', 'active', '2024-04-01 13:00:00'),
('jessica.smith@eskwelabs.com', 'Jessica Smith', 3, 'Makati', 'active', '2024-04-05 10:00:00'),
('roberto.fernandez@eskwelabs.com', 'Roberto Fernandez', 3, 'Pasig', 'active', '2024-04-10 16:00:00'),
('lisa.wong@eskwelabs.com', 'Lisa Wong', 4, 'Manila', 'active', '2024-05-15 09:30:00'),
('antonio.morales@eskwelabs.com', 'Antonio Morales', 4, 'Makati', 'active', '2024-05-20 14:00:00'),
('jennifer.lee@eskwelabs.com', 'Jennifer Lee', 4, 'Makati', 'graduated', '2024-06-01 10:00:00'),
('marcus.johnson@eskwelabs.com', 'Marcus Johnson', 1, 'Manila', 'graduated', '2024-01-10 10:00:00'),
('clara.hernandez@eskwelabs.com', 'Clara Hernandez', 2, 'Makati', 'graduated', '2024-03-15 12:00:00'),
('richard.thompson@eskwelabs.com', 'Richard Thompson', 3, 'Pasig', 'inactive', '2024-04-20 15:00:00'),
('victoria.martin@eskwelabs.com', 'Victoria Martin', 5, 'Davao', 'active', '2024-08-10 11:00:00'),
('henry.jackson@eskwelabs.com', 'Henry Jackson', 5, 'Manila', 'active', '2024-08-15 09:00:00'),
('sophia.white@eskwelabs.com', 'Sophia White', 5, 'Makati', 'active', '2024-08-20 14:30:00'),
('daniel.harris@eskwelabs.com', 'Daniel Harris', 1, 'Makati', 'active', '2024-01-18 10:30:00'),
('olivia.clark@eskwelabs.com', 'Olivia Clark', 2, 'Manila', 'active', '2024-03-05 15:00:00'),
('james.rodriguez@eskwelabs.com', 'James Rodriguez', 3, 'Makati', 'active', '2024-04-15 11:00:00'),
('emma.martinez@eskwelabs.com', 'Emma Martinez', 4, 'Quezon City', 'active', '2024-06-10 13:00:00'),
('william.taylor@eskwelabs.com', 'William Taylor', 5, 'Manila', 'active', '2024-08-25 10:00:00'),
('isabella.anderson@eskwelabs.com', 'Isabella Anderson', 1, 'Pasig', 'active', '2024-01-20 14:00:00'),
('alexander.thomas@eskwelabs.com', 'Alexander Thomas', 2, 'Makati', 'active', '2024-03-10 09:30:00'),
('charlotte.moore@eskwelabs.com', 'Charlotte Moore', 3, 'Manila', 'graduated', '2024-05-01 15:30:00'),
('benjamin.jackson@eskwelabs.com', 'Benjamin Jackson', 4, 'Makati', 'active', '2024-06-15 11:00:00'),
('amelia.white@eskwelabs.com', 'Amelia White', 5, 'Cebu', 'active', '2024-09-01 10:00:00'),
('lucas.harris@eskwelabs.com', 'Lucas Harris', 1, 'Manila', 'inactive', '2024-02-01 12:00:00'),
('mia.martin@eskwelabs.com', 'Mia Martin', 2, 'Makati', 'active', '2024-03-20 16:00:00');

-- Insert Event Registrations with realistic attendance patterns
INSERT INTO event_registrations (event_id, attendee_id, registered_at, attended, check_in_time) VALUES
-- React Fundamentals Workshop (Feb 1)
(1, 1, '2024-01-25 10:00:00', true, '2024-02-01 08:55:00'),
(1, 2, '2024-01-26 14:00:00', true, '2024-02-01 09:05:00'),
(1, 3, '2024-01-27 11:00:00', false, NULL),
(1, 4, '2024-01-25 09:00:00', true, '2024-02-01 09:00:00'),
(1, 5, '2024-01-28 15:00:00', false, NULL),
(1, 6, '2024-01-26 10:00:00', true, '2024-02-01 09:10:00'),
(1, 7, '2024-01-29 12:00:00', true, '2024-02-01 09:02:00'),
(1, 8, '2024-01-25 13:00:00', true, '2024-02-01 09:08:00'),
(1, 9, '2024-01-30 10:00:00', false, NULL),
(1, 10, '2024-01-27 14:00:00', true, '2024-02-01 09:12:00'),

-- TypeScript Masterclass (Feb 15)
(2, 1, '2024-02-10 11:00:00', true, '2024-02-15 17:55:00'),
(2, 2, '2024-02-11 09:00:00', true, '2024-02-15 18:00:00'),
(2, 4, '2024-02-08 15:00:00', true, '2024-02-15 18:05:00'),
(2, 7, '2024-02-12 10:00:00', false, NULL),
(2, 10, '2024-02-09 14:00:00', true, '2024-02-15 18:02:00'),
(2, 11, '2024-02-13 16:00:00', true, '2024-02-15 18:08:00'),
(2, 13, '2024-02-06 12:00:00', true, '2024-02-15 18:00:00'),
(2, 14, '2024-02-11 10:00:00', false, NULL),
(2, 16, '2024-02-14 13:00:00', true, '2024-02-15 18:10:00'),
(2, 18, '2024-02-12 11:00:00', true, '2024-02-15 18:03:00'),

-- Web Performance Optimization (Mar 1)
(3, 1, '2024-02-20 10:00:00', true, '2024-03-01 08:50:00'),
(3, 3, '2024-02-22 14:00:00', true, '2024-03-01 09:00:00'),
(3, 4, '2024-02-21 11:00:00', true, '2024-03-01 09:05:00'),
(3, 6, '2024-02-23 15:00:00', false, NULL),
(3, 7, '2024-02-19 09:00:00', true, '2024-03-01 08:58:00'),
(3, 8, '2024-02-24 13:00:00', true, '2024-03-01 09:10:00'),
(3, 11, '2024-02-20 16:00:00', true, '2024-03-01 09:02:00'),
(3, 15, '2024-02-25 12:00:00', false, NULL),

-- Full Stack Development Bootcamp Day 1 (Mar 15)
(4, 2, '2024-03-01 14:00:00', true, '2024-03-15 07:55:00'),
(4, 4, '2024-03-05 10:00:00', true, '2024-03-15 08:00:00'),
(4, 5, '2024-03-03 11:00:00', true, '2024-03-15 08:05:00'),
(4, 6, '2024-03-02 15:00:00', false, NULL),
(4, 9, '2024-03-08 09:00:00', true, '2024-03-15 08:10:00'),
(4, 11, '2024-03-04 13:00:00', true, '2024-03-15 08:02:00'),
(4, 14, '2024-03-06 16:00:00', true, '2024-03-15 08:08:00'),
(4, 16, '2024-03-07 12:00:00', false, NULL),

-- Career Development Meetup (Apr 20)
(8, 1, '2024-04-10 10:00:00', true, '2024-04-20 16:55:00'),
(8, 2, '2024-04-12 14:00:00', true, '2024-04-20 17:02:00'),
(8, 4, '2024-04-08 11:00:00', true, '2024-04-20 17:00:00'),
(8, 7, '2024-04-15 15:00:00', false, NULL),
(8, 10, '2024-04-11 09:00:00', true, '2024-04-20 17:05:00'),
(8, 13, '2024-04-14 13:00:00', true, '2024-04-20 17:08:00'),
(8, 18, '2024-04-13 16:00:00', true, '2024-04-20 17:03:00'),
(8, 20, '2024-04-09 12:00:00', false, NULL),

-- ESKwelabs Hackathon 2024 (Sep 1-2)
(19, 1, '2024-08-15 10:00:00', true, '2024-09-01 07:50:00'),
(19, 2, '2024-08-20 14:00:00', true, '2024-09-01 08:00:00'),
(19, 4, '2024-08-18 11:00:00', true, '2024-09-01 08:05:00'),
(19, 7, '2024-08-22 15:00:00', true, '2024-09-01 08:10:00'),
(19, 10, '2024-08-16 09:00:00', true, '2024-09-01 07:55:00'),
(19, 12, '2024-08-25 13:00:00', false, NULL),
(19, 16, '2024-08-21 16:00:00', true, '2024-09-01 08:15:00'),
(19, 18, '2024-08-23 12:00:00', true, '2024-09-01 08:08:00'),
(19, 19, '2024-08-24 10:00:00', true, '2024-09-01 08:02:00'),
(19, 20, '2024-08-19 11:00:00', false, NULL),
(19, 22, '2024-08-26 14:00:00', true, '2024-09-01 08:12:00'),
(19, 23, '2024-08-17 15:00:00', true, '2024-09-01 08:20:00'),
(19, 25, '2024-08-28 09:00:00', true, '2024-09-01 08:06:00'),
(19, 27, '2024-08-29 13:00:00', false, NULL),
(19, 28, '2024-08-27 16:00:00', true, '2024-09-01 08:18:00'),

-- Monthly Tech Talk Series (Jun 15)
(12, 1, '2024-06-01 10:00:00', true, '2024-06-15 17:25:00'),
(12, 2, '2024-06-05 14:00:00', true, '2024-06-15 17:32:00'),
(12, 4, '2024-06-03 11:00:00', true, '2024-06-15 17:30:00'),
(12, 7, '2024-06-08 15:00:00', false, NULL),
(12, 10, '2024-06-02 09:00:00', true, '2024-06-15 17:28:00'),
(12, 12, '2024-06-10 13:00:00', true, '2024-06-15 17:35:00'),
(12, 19, '2024-06-04 16:00:00', true, '2024-06-15 17:33:00'),
(12, 21, '2024-06-07 12:00:00', false, NULL),
(12, 23, '2024-06-06 10:00:00', true, '2024-06-15 17:31:00'),
(12, 25, '2024-06-09 11:00:00', true, '2024-06-15 17:29:00');

-- Update Attendance Summary table
INSERT INTO attendance_summary (event_id, total_registered, total_attended, attendance_rate)
SELECT 
  e.id,
  COUNT(er.id) as total_registered,
  COUNT(CASE WHEN er.attended THEN 1 END) as total_attended,
  CASE 
    WHEN COUNT(er.id) > 0 THEN ROUND(COUNT(CASE WHEN er.attended THEN 1 END)::DECIMAL / COUNT(er.id) * 100, 2)
    ELSE 0
  END as attendance_rate
FROM events e
LEFT JOIN event_registrations er ON e.id = er.event_id
GROUP BY e.id;
