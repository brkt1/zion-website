-- Yenege Unity Attendee Portal Backend Updates & RLS Fixes
-- Run this in your Supabase SQL Editor

-----------------------------------------------------------
-- 1. FIX: yenege_unity_attendees RLS Policies
-----------------------------------------------------------
ALTER TABLE yenege_unity_attendees ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit an application (INSERT)
DROP POLICY IF EXISTS "Allow public insert to attendees" ON yenege_unity_attendees;
CREATE POLICY "Allow public insert to attendees" 
  ON yenege_unity_attendees FOR INSERT 
  WITH CHECK (true);

-- Allow anyone to read (SELECT) so they can login via Portal
DROP POLICY IF EXISTS "Allow public read access to attendees" ON yenege_unity_attendees;
CREATE POLICY "Allow public read access to attendees" 
  ON yenege_unity_attendees FOR SELECT 
  USING (true);

-- Allow attendees to update their own record (Optional)
DROP POLICY IF EXISTS "Allow public update to attendees" ON yenege_unity_attendees;
CREATE POLICY "Allow public update to attendees" 
  ON yenege_unity_attendees FOR UPDATE 
  USING (true);

-----------------------------------------------------------
-- 2. FIX: Visits Table (for VisitTracker 400 Error)
-----------------------------------------------------------
-- Make sure the visits table exists if it doesn't already
CREATE TABLE IF NOT EXISTS visits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  path TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert to visits" ON visits;
CREATE POLICY "Allow public insert to visits" 
  ON visits FOR INSERT 
  WITH CHECK (true);

-----------------------------------------------------------
-- 3. ATTENDEE PORTAL: Matches Table & Access Code
-----------------------------------------------------------
-- Add Access Code column to attendees table for Portal Login (Ignores if already exists)
ALTER TABLE yenege_unity_attendees ADD COLUMN IF NOT EXISTS access_code VARCHAR(20);

-- Create the Matches table
CREATE TABLE IF NOT EXISTS yenege_unity_matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  attendee_id UUID REFERENCES yenege_unity_attendees(id) ON DELETE CASCADE,
  matched_attendee_id UUID REFERENCES yenege_unity_attendees(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'met', 'follow_up', 'closed'
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(attendee_id, matched_attendee_id)
);

ALTER TABLE yenege_unity_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to matches" ON yenege_unity_matches;
CREATE POLICY "Allow public read access to matches"
  ON yenege_unity_matches FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert to matches" ON yenege_unity_matches;
CREATE POLICY "Allow public insert to matches"
  ON yenege_unity_matches FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to matches" ON yenege_unity_matches;
CREATE POLICY "Allow public update to matches"
  ON yenege_unity_matches FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Allow public delete to matches" ON yenege_unity_matches;
CREATE POLICY "Allow public delete to matches"
  ON yenege_unity_matches FOR DELETE
  USING (true);

-- 4. Add Welcome Email Sent column
ALTER TABLE yenege_unity_attendees ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT false;
