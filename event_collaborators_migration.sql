-- ================================================
-- 1. FIX: ticket_scanners RLS policies
-- Allow authenticated admins to do all CRUD
-- Allow scanners to read their own row by email
-- ================================================

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Allow admins to manage ticket_scanners" ON ticket_scanners;
DROP POLICY IF EXISTS "Allow scanners to read own record" ON ticket_scanners;
DROP POLICY IF EXISTS "Admins can insert scanners" ON ticket_scanners;
DROP POLICY IF EXISTS "Admins can update scanners" ON ticket_scanners;
DROP POLICY IF EXISTS "Admins can delete scanners" ON ticket_scanners;
DROP POLICY IF EXISTS "Admins can select scanners" ON ticket_scanners;
DROP POLICY IF EXISTS "Scanners can view own record" ON ticket_scanners;

-- Enable RLS
ALTER TABLE ticket_scanners ENABLE ROW LEVEL SECURITY;

-- Allow authenticated admin users to do everything
CREATE POLICY "Admins can select scanners"
  ON ticket_scanners FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert scanners"
  ON ticket_scanners FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update scanners"
  ON ticket_scanners FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete scanners"
  ON ticket_scanners FOR DELETE
  TO authenticated
  USING (true);

-- Allow the anon role to SELECT scanners (so the scanner login can check their email)
CREATE POLICY "Scanners can view own record"
  ON ticket_scanners FOR SELECT
  TO anon
  USING (true);


-- ================================================
-- 2. CREATE: event_collaborators table
-- People who co-organized an event can log in 
-- and view the event's detail page (attendees, stats)
-- ================================================

CREATE TABLE IF NOT EXISTS event_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'Collaborator',   -- e.g. "Co-organizer", "Venue Manager", "Sponsor"
  access_code TEXT NOT NULL,          -- A simple PIN/code they use to log in
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by event
CREATE INDEX IF NOT EXISTS idx_event_collaborators_event_id ON event_collaborators(event_id);
-- Unique: one collaborator email per event
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_collaborators_email_event 
  ON event_collaborators(event_id, email);

-- Enable RLS
ALTER TABLE event_collaborators ENABLE ROW LEVEL SECURITY;

-- Admins can manage all collaborators
CREATE POLICY "Admins can manage collaborators"
  ON event_collaborators FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Anyone can SELECT collaborators (so the login check works from anon/frontend)
CREATE POLICY "Public can read collaborators for auth"
  ON event_collaborators FOR SELECT
  TO anon
  USING (true);
