-- Fix Applications RLS Policy to Allow Public Inserts (Version 2)
-- Run this in your Supabase SQL Editor if you're still getting 401 errors

-- First, let's check what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'applications';

-- Drop ALL existing policies on applications table
DROP POLICY IF EXISTS "Allow public insert on applications" ON applications;
DROP POLICY IF EXISTS "Allow admin read access on applications" ON applications;
DROP POLICY IF EXISTS "Allow admin update access on applications" ON applications;
DROP POLICY IF EXISTS "Allow admin delete access on applications" ON applications;

-- Option 1: Create a permissive policy that allows public inserts
-- This explicitly allows anonymous users (anon role) to insert
CREATE POLICY "Allow public insert on applications" ON applications
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Alternative: If the above doesn't work, try this more explicit version:
-- CREATE POLICY "Allow public insert on applications" ON applications
--   FOR INSERT
--   TO anon, authenticated
--   WITH CHECK (true);

-- Recreate admin read policy using the is_admin_user function
CREATE POLICY "Allow admin read access on applications" ON applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Recreate admin update policy
CREATE POLICY "Allow admin update access on applications" ON applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Recreate admin delete policy
CREATE POLICY "Allow admin delete access on applications" ON applications
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Verify the policies were created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'applications'
ORDER BY policyname;

-- Test query to verify RLS is working (this should return true if policy allows inserts)
SELECT has_table_privilege('anon', 'applications', 'INSERT') as anon_can_insert,
       has_table_privilege('authenticated', 'applications', 'INSERT') as auth_can_insert;

