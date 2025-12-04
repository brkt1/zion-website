-- RPC Function to Get Learning Progress by Email (Admin Only)
-- This function allows admins to view learning progress for applicants
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_learning_progress_by_email(check_email TEXT)
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  lesson_id TEXT,
  week_number INTEGER,
  completed BOOLEAN,
  completed_at TIMESTAMP WITH TIME ZONE,
  viewed BOOLEAN,
  viewed_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  found_user_id UUID;
  found_user_email TEXT;
  progress_count INTEGER;
BEGIN
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can view learning progress';
  END IF;

  -- First, check if user exists and get their info
  SELECT id, email INTO found_user_id, found_user_email
  FROM auth.users
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(check_email))
  LIMIT 1;

  -- If user doesn't exist, return empty result (empty array)
  IF found_user_id IS NULL THEN
    RETURN;
  END IF;

  -- User exists - return their learning progress
  RETURN QUERY
  SELECT 
    ep.user_id,
    u.email::TEXT as user_email,
    ep.lesson_id,
    ep.week_number,
    ep.completed,
    ep.completed_at,
    ep.viewed,
    ep.viewed_at
  FROM elearning_progress ep
  JOIN auth.users u ON ep.user_id = u.id
  WHERE ep.user_id = found_user_id
  ORDER BY ep.week_number ASC, ep.lesson_id ASC;
  
  -- Check if we returned any rows
  GET DIAGNOSTICS progress_count = ROW_COUNT;
  
  -- If user exists but has no progress, return a marker row with user info but null lesson data
  -- This allows the frontend to distinguish "user exists but no progress" from "user doesn't exist"
  IF progress_count = 0 THEN
    RETURN QUERY
    SELECT 
      found_user_id as user_id,
      found_user_email::TEXT as user_email,
      NULL::TEXT as lesson_id,
      NULL::INTEGER as week_number,
      NULL::BOOLEAN as completed,
      NULL::TIMESTAMP WITH TIME ZONE as completed_at,
      NULL::BOOLEAN as viewed,
      NULL::TIMESTAMP WITH TIME ZONE as viewed_at;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (admin check is inside function)
GRANT EXECUTE ON FUNCTION get_learning_progress_by_email(TEXT) TO authenticated;

-- Note: The function uses SECURITY DEFINER to access auth.users table
-- The admin check ensures only admins can execute this function

