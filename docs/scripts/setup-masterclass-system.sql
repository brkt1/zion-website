-- Masterclass Reservation System Database Setup
-- Run this in your Supabase SQL Editor

-- 1. Create masterclass_reservations table
CREATE TABLE IF NOT EXISTS masterclass_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  place TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE masterclass_reservations ENABLE ROW LEVEL SECURITY;

-- 2. Update user_roles check constraint to include new roles
-- We need to drop and recreate the constraint because 'CHECK' constraints can't be modified easily
DO $$
BEGIN
    ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
    ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check 
        CHECK (role IN ('admin', 'user', 'event_organizer', 'sponsorship_manager', 'masterclass_manager'));
EXCEPTION
    WHEN undefined_table THEN
        -- Table doesn't exist yet, it will be handled by our create table logic if needed
END $$;

-- 3. RLS Policies for masterclass_reservations

-- Policy: Anyone can insert their own reservation
DROP POLICY IF EXISTS "Anyone can insert reservation" ON masterclass_reservations;
CREATE POLICY "Anyone can insert reservation" ON masterclass_reservations
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admins and Masterclass Managers can view all reservations
DROP POLICY IF EXISTS "Admins and Managers can view reservations" ON masterclass_reservations;
CREATE POLICY "Admins and Managers can view reservations" ON masterclass_reservations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() 
      AND (role = 'admin' OR role = 'masterclass_manager')
    )
  );

-- Policy: Admins and Masterclass Managers can update reservations
DROP POLICY IF EXISTS "Admins and Managers can update reservations" ON masterclass_reservations;
CREATE POLICY "Admins and Managers can update reservations" ON masterclass_reservations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() 
      AND (role = 'admin' OR role = 'masterclass_manager')
    )
  );

-- Policy: Admins and Masterclass Managers can delete reservations
DROP POLICY IF EXISTS "Admins and Managers can delete reservations" ON masterclass_reservations;
CREATE POLICY "Admins and Managers can delete reservations" ON masterclass_reservations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() 
      AND (role = 'admin' OR role = 'masterclass_manager')
    )
  );

-- 4. Helper function to make a user a Masterclass Manager
-- Replace 'USER_EMAIL' with the actual email in your Supabase dashboard
-- INSERT INTO user_roles (user_id, role)
-- SELECT id, 'masterclass_manager'
-- FROM auth.users
-- WHERE email = 'USER_EMAIL'
-- ON CONFLICT (user_id) DO UPDATE SET role = 'masterclass_manager';
