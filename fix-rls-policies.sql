-- Fix RLS Policies for user_roles table
-- This fixes the infinite recursion issue while maintaining security

-- ============================================================================
-- SECURITY: Drop problematic policies
-- ============================================================================
-- Drop the "Admins can read all roles" policy that causes infinite recursion
-- This policy queries user_roles to check admin status, which triggers itself
DROP POLICY IF EXISTS "Admins can read all roles" ON user_roles;

-- ============================================================================
-- SECURITY: Create secure SELECT policy
-- ============================================================================
-- Users can only read their own role record
-- This prevents users from seeing other users' roles (prevents privilege escalation)
-- This is sufficient for the isAdmin() function to work
DROP POLICY IF EXISTS "Users can read their own role" ON user_roles;
CREATE POLICY "Users can read their own role" ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- SECURITY: Verify no write policies exist
-- ============================================================================
-- By default, if no INSERT/UPDATE/DELETE policies exist,
-- only the SERVICE ROLE can modify roles
-- This prevents users from self-promoting to admin (CRITICAL SECURITY)
-- 
-- To grant admin access, you must use:
--   - Supabase SQL Editor (service role)
--   - Supabase Dashboard (service role)
--   - Backend API with service role key (if implemented)

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================
-- ✅ Users can only read their own role (prevents information leakage)
-- ✅ No users can modify roles (prevents privilege escalation)
-- ✅ Only service role can grant admin access (secure)
-- ✅ Prevents self-promotion attacks

