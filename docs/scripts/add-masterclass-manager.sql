-- SQL Script to add a Masterclass Manager
-- 1. First, find the user's ID from the Auth -> Users section in Supabase
-- 2. Replace 'USER_ID_HERE' with the actual UUID

-- Check if the role constraint allows 'masterclass_manager' (it should if you ran the setup script)
DO $$
BEGIN
    ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
    ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check 
        CHECK (role IN ('admin', 'user', 'event_organizer', 'sponsorship_manager', 'masterclass_manager'));
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- Assign the role (replace USER_ID_HERE)
-- INSERT INTO user_roles (user_id, role)
-- VALUES ('USER_ID_HERE', 'masterclass_manager')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'masterclass_manager';

-- Alternative: If you want to search by email (requires extension or specific table setup)
-- INSERT INTO user_roles (user_id, role)
-- SELECT id, 'masterclass_manager'
-- FROM auth.users
-- WHERE email = 'target-user@email.com'
-- ON CONFLICT (user_id) DO UPDATE SET role = 'masterclass_manager';
