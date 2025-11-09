-- Fix INSERT policy for ticket_scanners
-- This creates a SECURITY DEFINER function to check admin status, avoiding RLS issues
-- Run this in your Supabase SQL Editor

-- Create a function to check if user is admin (bypasses RLS)
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

-- Update the is_ticket_scanner function to use the email function
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

-- Drop existing policies
DROP POLICY IF EXISTS "Allow admin insert on ticket_scanners" ON ticket_scanners;
DROP POLICY IF EXISTS "Allow admin update on ticket_scanners" ON ticket_scanners;
DROP POLICY IF EXISTS "Allow admin delete on ticket_scanners" ON ticket_scanners;

-- Recreate INSERT policy using the function
CREATE POLICY "Allow admin insert on ticket_scanners" ON ticket_scanners FOR INSERT 
  WITH CHECK (is_admin_user());

-- Recreate UPDATE policy using the function
CREATE POLICY "Allow admin update on ticket_scanners" ON ticket_scanners FOR UPDATE 
  USING (is_admin_user());

-- Recreate DELETE policy using the function
CREATE POLICY "Allow admin delete on ticket_scanners" ON ticket_scanners FOR DELETE 
  USING (is_admin_user());

-- Also update the SELECT policy to use the function for consistency
DROP POLICY IF EXISTS "Allow ticket scanners to read own data" ON ticket_scanners;
CREATE POLICY "Allow ticket scanners to read own data" ON ticket_scanners FOR SELECT 
  USING (
    is_admin_user()
    OR
    is_ticket_scanner(get_user_email())
  );

