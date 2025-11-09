-- Fix Applications RLS Policy to Allow Public Inserts
-- Run this in your Supabase SQL Editor if you're getting 401 errors

-- Drop ALL existing policies on applications table first
DROP POLICY IF EXISTS "Allow public insert on applications" ON applications;
DROP POLICY IF EXISTS "Allow admin read access on applications" ON applications;
DROP POLICY IF EXISTS "Allow admin update access on applications" ON applications;
DROP POLICY IF EXISTS "Allow admin delete access on applications" ON applications;

-- Recreate the insert policy - explicitly allow public (includes anon and authenticated)
-- Using TO public ensures both anonymous and authenticated users can insert
CREATE POLICY "Allow public insert on applications" ON applications
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Recreate admin read policy
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

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'applications'
ORDER BY policyname;

