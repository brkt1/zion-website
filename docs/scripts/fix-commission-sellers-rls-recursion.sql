-- Fix infinite recursion in commission_sellers RLS policy
-- The policy was trying to query commission_sellers to check if user is a seller, causing recursion
-- This script fixes the RLS policy so commission sellers (who are NOT admins) can read their own data
-- SECURITY: Uses case-insensitive email matching to prevent case manipulation attacks

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Allow commission sellers to read own data" ON commission_sellers;

-- Create a secure function to get user email (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_email()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get the current user's email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Return normalized email (lowercase, trimmed) for secure comparison
  -- This prevents case manipulation attacks
  IF user_email IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN LOWER(TRIM(user_email));
END;
$$;

-- Create a function to check if user is a commission seller (bypasses RLS to avoid recursion)
-- SECURITY: Uses case-insensitive comparison to prevent email case manipulation
CREATE OR REPLACE FUNCTION is_user_commission_seller()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  normalized_user_email TEXT;
BEGIN
  -- Get normalized user email
  normalized_user_email := get_user_email();
  
  -- Return false if no email
  IF normalized_user_email IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if email exists in commission_sellers table and is active
  -- This query bypasses RLS because the function is SECURITY DEFINER
  -- Uses case-insensitive comparison for security
  RETURN EXISTS (
    SELECT 1
    FROM commission_sellers
    WHERE LOWER(TRIM(email)) = normalized_user_email
    AND is_active = true
  );
END;
$$;

-- Create a function to check if user is admin (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  );
END;
$$;

-- Recreate the policy using the functions to avoid recursion
-- SECURITY: Case-insensitive email matching prevents case manipulation attacks
-- This allows:
-- 1. Admins to see all commission sellers
-- 2. Commission sellers (who are NOT admins) to see only their own record
CREATE POLICY "Allow commission sellers to read own data" ON commission_sellers FOR SELECT 
  USING (
    -- Allow if user is admin (can see all sellers)
    is_user_admin()
    OR
    -- Allow if user is a commission seller (can see only their own record)
    -- SECURITY: Use case-insensitive comparison to prevent email case manipulation
    (
      is_user_commission_seller()
      AND LOWER(TRIM(email)) = get_user_email()
    )
  );

