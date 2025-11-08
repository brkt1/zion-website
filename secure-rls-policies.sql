-- Secure RLS Policies for user_roles table
-- This provides proper security while avoiding infinite recursion

-- ============================================================================
-- SECURITY MODEL
-- ============================================================================
-- 1. Users can READ only their own role (prevents privilege escalation)
-- 2. Only SERVICE ROLE can INSERT/UPDATE/DELETE roles (prevents self-promotion)
-- 3. Admins can optionally read all roles via SECURITY DEFINER function
-- 4. No regular users can modify roles (prevents privilege escalation attacks)

-- ============================================================================
-- STEP 1: Drop existing policies
-- ============================================================================
DROP POLICY IF EXISTS "Users can read their own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can read all roles" ON user_roles;

-- ============================================================================
-- STEP 2: Create secure SELECT policy
-- ============================================================================
-- Users can only read their own role record
-- This prevents users from seeing other users' roles
-- This is sufficient for the isAdmin() function to work
CREATE POLICY "Users can read their own role" ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 3: Ensure no INSERT/UPDATE/DELETE policies exist
-- ============================================================================
-- By default, if no policies exist for INSERT/UPDATE/DELETE, 
-- only the SERVICE ROLE can perform these operations
-- This is the most secure approach - roles can only be changed via:
--   - Supabase SQL Editor (using service role)
--   - Supabase Dashboard (using service role)
--   - Backend API with service role key (if you add one later)

-- Verify no write policies exist (should return 0 rows)
SELECT 
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'user_roles' 
  AND cmd IN ('INSERT', 'UPDATE', 'DELETE');

-- ============================================================================
-- STEP 4: Optional - Allow admins to read all roles (if needed)
-- ============================================================================
-- If you need admins to see/manage other users' roles in the future,
-- use a SECURITY DEFINER function to avoid infinite recursion

-- Create a secure function that admins can use to check if they're admin
-- This function bypasses RLS to avoid recursion
CREATE OR REPLACE FUNCTION check_user_is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- This function runs with SECURITY DEFINER, so it bypasses RLS
  -- It directly checks the user_roles table without triggering policies
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = check_user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_user_is_admin(UUID) TO authenticated;

-- Optional: Policy for admins to read all roles (using the function)
-- Uncomment this if you need admins to see all roles in the future
-- CREATE POLICY "Admins can read all roles" ON user_roles
--   FOR SELECT
--   USING (check_user_is_admin(auth.uid()));

-- ============================================================================
-- STEP 5: Security verification queries
-- ============================================================================

-- Verify policies are set correctly
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_roles'
ORDER BY cmd, policyname;

-- Test: Try to read your own role (should work)
-- SELECT * FROM user_roles WHERE user_id = auth.uid();

-- Test: Try to read another user's role (should fail - no rows returned)
-- SELECT * FROM user_roles WHERE user_id != auth.uid();

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================
-- ✅ SECURE: Users can only read their own role
-- ✅ SECURE: No users can INSERT/UPDATE/DELETE roles (only service role)
-- ✅ SECURE: Role changes require database-level access
-- ✅ SECURE: Prevents privilege escalation attacks
-- ✅ SECURE: Prevents self-promotion to admin
-- 
-- To grant admin access, you must:
--   1. Use Supabase SQL Editor (service role)
--   2. Use Supabase Dashboard (service role)
--   3. Use backend API with service role key (if implemented)
--
-- This ensures only trusted administrators can grant admin privileges.

