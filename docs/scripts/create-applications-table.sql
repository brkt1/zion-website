-- Applications Table for Internship/Volunteer Applications
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('internship', 'volunteer')),
  position TEXT,
  experience TEXT,
  motivation TEXT NOT NULL,
  availability TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_type ON applications(type);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin (bypasses RLS)
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

-- Allow anyone to insert applications (public form) - including anonymous users
DROP POLICY IF EXISTS "Allow public insert on applications" ON applications;
CREATE POLICY "Allow public insert on applications" ON applications
  FOR INSERT
  WITH CHECK (true);

-- Allow admins to read all applications
DROP POLICY IF EXISTS "Allow admin read access on applications" ON applications;
CREATE POLICY "Allow admin read access on applications" ON applications
  FOR SELECT
  USING (is_admin_user());

-- Allow admins to update applications
DROP POLICY IF EXISTS "Allow admin update access on applications" ON applications;
CREATE POLICY "Allow admin update access on applications" ON applications
  FOR UPDATE
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- Allow admins to delete applications
DROP POLICY IF EXISTS "Allow admin delete access on applications" ON applications;
CREATE POLICY "Allow admin delete access on applications" ON applications
  FOR DELETE
  USING (is_admin_user());

