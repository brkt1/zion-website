-- Ticket Scanners Table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS ticket_scanners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ticket_scanners_email ON ticket_scanners(email);
CREATE INDEX IF NOT EXISTS idx_ticket_scanners_is_active ON ticket_scanners(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE ticket_scanners ENABLE ROW LEVEL SECURITY;

-- Create functions to check user roles (bypasses RLS to avoid recursion)
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

-- Create a function to get user email (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_email()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_ticket_scanner(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM ticket_scanners
    WHERE email = user_email
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies
-- Allow ticket scanners to read their own data
DROP POLICY IF EXISTS "Allow ticket scanners to read own data" ON ticket_scanners;
CREATE POLICY "Allow ticket scanners to read own data" ON ticket_scanners FOR SELECT 
  USING (
    is_admin_user()
    OR
    is_ticket_scanner(get_user_email())
  );

-- Only admins can insert, update, or delete
DROP POLICY IF EXISTS "Allow admin insert on ticket_scanners" ON ticket_scanners;
CREATE POLICY "Allow admin insert on ticket_scanners" ON ticket_scanners FOR INSERT 
  WITH CHECK (is_admin_user());

DROP POLICY IF EXISTS "Allow admin update on ticket_scanners" ON ticket_scanners;
CREATE POLICY "Allow admin update on ticket_scanners" ON ticket_scanners FOR UPDATE 
  USING (is_admin_user());

DROP POLICY IF EXISTS "Allow admin delete on ticket_scanners" ON ticket_scanners;
CREATE POLICY "Allow admin delete on ticket_scanners" ON ticket_scanners FOR DELETE 
  USING (is_admin_user());

