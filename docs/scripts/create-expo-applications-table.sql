-- Expo Applications Table (Exhibitor Registrations)
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS expo_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  social_media TEXT,
  category TEXT NOT NULL,
  booth_type TEXT NOT NULL,
  payment_option TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_expo_applications_email ON expo_applications(email);
CREATE INDEX IF NOT EXISTS idx_expo_applications_status ON expo_applications(status);
CREATE INDEX IF NOT EXISTS idx_expo_applications_created_at ON expo_applications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE expo_applications ENABLE ROW LEVEL SECURITY;

-- Helper: check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: check if the current user is an active ticket scanner
CREATE OR REPLACE FUNCTION is_active_scanner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM ticket_scanners
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow ANYONE (including anonymous) to INSERT applications (public registration form)
DROP POLICY IF EXISTS "Allow public insert on expo_applications" ON expo_applications;
CREATE POLICY "Allow public insert on expo_applications" ON expo_applications
  FOR INSERT
  WITH CHECK (true);

-- Allow admins AND active scanners to READ all applications
DROP POLICY IF EXISTS "Allow admin read access on expo_applications" ON expo_applications;
CREATE POLICY "Allow admin read access on expo_applications" ON expo_applications
  FOR SELECT
  USING (is_admin_user() OR is_active_scanner());

-- Allow admins AND active scanners to UPDATE applications (approve/reject/notes)
DROP POLICY IF EXISTS "Allow admin update access on expo_applications" ON expo_applications;
CREATE POLICY "Allow admin update access on expo_applications" ON expo_applications
  FOR UPDATE
  USING (is_admin_user() OR is_active_scanner())
  WITH CHECK (is_admin_user() OR is_active_scanner());

-- Allow admins AND active scanners to DELETE applications
DROP POLICY IF EXISTS "Allow admin delete access on expo_applications" ON expo_applications;
CREATE POLICY "Allow admin delete access on expo_applications" ON expo_applications
  FOR DELETE
  USING (is_admin_user() OR is_active_scanner());
