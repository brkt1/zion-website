-- Fix infinite recursion in ticket_scanners RLS policy
-- Run this in your Supabase SQL Editor to fix the issue

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Allow ticket scanners to read own data" ON ticket_scanners;

-- Create a function to check if user is a ticket scanner (bypasses RLS to avoid recursion)
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

-- Recreate the policy using the function to avoid recursion
CREATE POLICY "Allow ticket scanners to read own data" ON ticket_scanners FOR SELECT 
  USING (
    -- Allow if user is admin
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
    OR
    -- Allow if user's email matches a ticket scanner's email (using function to avoid recursion)
    is_ticket_scanner((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

