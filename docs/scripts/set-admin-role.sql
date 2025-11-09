-- Quick script to set admin role for a user
-- Replace '6cac957b-8fe3-43a5-a532-c2080c75b2f8' with your actual user_id

-- Option 1: Set admin role in user_roles table (RECOMMENDED)
-- This is the primary method and more secure
INSERT INTO user_roles (user_id, role)
VALUES ('6cac957b-8fe3-43a5-a532-c2080c75b2f8', 'admin')
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';

-- Verify it was set correctly
SELECT 
  ur.id,
  ur.user_id,
  ur.role,
  ur.created_at,
  au.email
FROM user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
WHERE ur.user_id = '6cac957b-8fe3-43a5-a532-c2080c75b2f8';

-- Option 2: Set admin role by email (if you don't know the user_id)
-- Replace 'your-email@example.com' with the actual email
-- INSERT INTO user_roles (user_id, role)
-- SELECT id, 'admin'
-- FROM auth.users
-- WHERE email = 'your-email@example.com'
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

