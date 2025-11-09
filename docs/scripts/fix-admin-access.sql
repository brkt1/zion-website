-- Diagnostic and Fix Script for Admin Access Issues
-- Run this in your Supabase SQL Editor to diagnose and fix admin access problems

-- Step 1: Check if user_roles table exists and has the correct structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;

-- Step 2: Check current RLS policies on user_roles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_roles';

-- Step 3: Check if the specific user has an admin role
-- Replace '6cac957b-8fe3-43a5-a532-c2080c75b2f8' with your actual user_id
SELECT 
  ur.id,
  ur.user_id,
  ur.role,
  ur.created_at,
  au.email,
  au.id as auth_user_id
FROM user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
WHERE ur.user_id = '6cac957b-8fe3-43a5-a532-c2080c75b2f8';

-- Step 4: Verify the user exists in auth.users
-- Note: Some columns in auth.users may not be directly accessible
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE id = '6cac957b-8fe3-43a5-a532-c2080c75b2f8';

-- Step 5: Fix/Update the admin role for the user
-- This will insert or update the role to 'admin'
INSERT INTO user_roles (user_id, role)
VALUES ('6cac957b-8fe3-43a5-a532-c2080c75b2f8', 'admin')
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';

-- Step 6: Verify the fix worked
SELECT 
  ur.id,
  ur.user_id,
  ur.role,
  ur.created_at,
  au.email
FROM user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
WHERE ur.user_id = '6cac957b-8fe3-43a5-a532-c2080c75b2f8';

-- Step 7: Ensure RLS policies are correctly set up
-- Drop and recreate the policies to ensure they're correct

-- Policy: Users can read their own role
DROP POLICY IF EXISTS "Users can read their own role" ON user_roles;
CREATE POLICY "Users can read their own role" ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins can read all roles (this helps with the admin check)
DROP POLICY IF EXISTS "Admins can read all roles" ON user_roles;
CREATE POLICY "Admins can read all roles" ON user_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Step 8: Test the is_admin function
SELECT is_admin('6cac957b-8fe3-43a5-a532-c2080c75b2f8'::UUID);

-- Alternative: If you want to make a user admin by email instead of user_id
-- Replace 'your-email@example.com' with the actual email
-- INSERT INTO user_roles (user_id, role)
-- SELECT id, 'admin'
-- FROM auth.users
-- WHERE email = 'your-email@example.com'
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

