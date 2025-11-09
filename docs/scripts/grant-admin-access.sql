-- Grant Admin Access to User
-- IMPORTANT: Run this in your Supabase SQL Editor
-- Make sure you're using the SQL Editor (not the Table Editor)
-- The SQL Editor runs with elevated privileges needed for this operation

-- Step 1: Make sure the user_roles table exists
-- If you haven't run supabase-user-roles.sql yet, run that first!

-- Step 2: Grant admin access to your email
-- Replace 'Bereketyosef16@gmail.com' with your email if different
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'Bereketyosef16@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Step 3: Verify the admin access was granted
SELECT 
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'Bereketyosef16@gmail.com';

-- If the above doesn't work due to RLS policies, use this alternative:
-- This temporarily disables RLS, inserts the role, then re-enables it
-- (Only use if the INSERT above fails)
/*
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'Bereketyosef16@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
*/

