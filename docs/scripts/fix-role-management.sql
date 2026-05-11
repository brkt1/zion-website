-- SQL Functions for Role Management
-- Allows Super Admins to manage roles via email instead of UUID
-- This avoids 403 Forbidden errors by using SECURITY DEFINER

-- 1. Function to assign a role by email
CREATE OR REPLACE FUNCTION assign_role_by_email(target_email TEXT, target_role TEXT)
RETURNS JSON AS $$
DECLARE
    target_user_id UUID;
    caller_role TEXT;
BEGIN
    -- Check if the caller is an admin
    SELECT role INTO caller_role FROM user_roles WHERE user_id = auth.uid();
    
    IF caller_role != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized: Only Super Admins can manage roles.';
    END IF;

    -- Find the user ID from auth.users (this requires security definer)
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

    IF target_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'User with email ' || target_email || ' not found.');
    END IF;

    -- Update or Insert the role
    INSERT INTO user_roles (user_id, role)
    VALUES (target_user_id, target_role)
    ON CONFLICT (user_id) DO UPDATE SET role = target_role;

    RETURN json_build_object('success', true, 'message', 'Role ' || target_role || ' assigned to ' || target_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Grant permission to authenticated users to call this function
-- (The function itself checks for admin status internally)
GRANT EXECUTE ON FUNCTION assign_role_by_email(TEXT, TEXT) TO authenticated;

-- 3. Add policy to allow admins to UPDATE and INSERT into user_roles
-- (So they can also use the standard table interface if they have the UUID)
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Ensure masterclass_manager is in the role check constraint
DO $$
BEGIN
    ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
    ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check 
        CHECK (role IN ('admin', 'user', 'event_organizer', 'sponsorship_manager', 'masterclass_manager'));
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;
