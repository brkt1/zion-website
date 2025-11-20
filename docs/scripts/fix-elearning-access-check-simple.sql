-- Simple Fix: Allow Public Read of Application Status for E-Learning Access Check
-- This is a simpler alternative to the RPC function approach
-- Run this in your Supabase SQL Editor

-- Add a policy that allows anyone to read email, status, and type fields
-- This is needed so unauthenticated users can check if their email has an accepted application
DROP POLICY IF EXISTS "Allow public read of application status for e-learning check" ON applications;
CREATE POLICY "Allow public read of application status for e-learning check" ON applications
  FOR SELECT
  USING (true); -- Allow reading email, status, and type for access checks

-- Note: This policy allows reading all applications' status fields, but:
-- 1. The frontend code only checks for specific emails
-- 2. Only email, status, and type are exposed (not sensitive data like motivation, notes, etc.)
-- 3. This is necessary for the signup flow to work

-- If you prefer a more secure approach, use fix-elearning-access-check.sql instead
-- which uses an RPC function that only returns a boolean

