-- Visits Table for Website Analytics
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_path ON visits(path);
-- Note: Date-based queries can use the created_at index efficiently

-- Enable Row Level Security
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert visits (public tracking)
DROP POLICY IF EXISTS "Allow public insert on visits" ON visits;
CREATE POLICY "Allow public insert on visits" ON visits
  FOR INSERT
  WITH CHECK (true);

-- Allow admins to read all visits
DROP POLICY IF EXISTS "Allow admin read access on visits" ON visits;
CREATE POLICY "Allow admin read access on visits" ON visits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create function to check if user is admin (if not already exists)
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

