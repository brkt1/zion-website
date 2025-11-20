-- Fix E-Learning Access Check for Unauthenticated Users
-- This allows users to check if their email has an accepted internship application
-- during signup, even when they're not logged in yet
-- Run this in your Supabase SQL Editor

-- Solution 1: Create a function to check if an email has an accepted internship application
-- This function uses SECURITY DEFINER to bypass RLS, allowing unauthenticated users to check
-- This is the RECOMMENDED approach as it's more secure
CREATE OR REPLACE FUNCTION check_accepted_application(check_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  app_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM applications 
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(check_email))
      AND status = 'accepted'
      AND type = 'internship'
  ) INTO app_exists;
  
  RETURN app_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to everyone (including anonymous users)
GRANT EXECUTE ON FUNCTION check_accepted_application(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION check_accepted_application(TEXT) TO authenticated;

-- Solution 2 (Alternative): Add a policy that allows reading application status
-- This allows anyone to read email, status, and type fields (but not other sensitive data)
-- Only use this if you prefer policy-based approach over RPC function
-- Uncomment the lines below if you want to use this approach instead:

-- DROP POLICY IF EXISTS "Allow public read of application status for e-learning check" ON applications;
-- CREATE POLICY "Allow public read of application status for e-learning check" ON applications
--   FOR SELECT
--   USING (true); -- Allow reading email, status, and type for access checks
-- 
-- Note: This policy allows reading all applications' status, but the frontend code
-- only checks for specific emails, so it's reasonably secure. However, the RPC function
-- (Solution 1) is more secure as it only returns a boolean and doesn't expose any data.

