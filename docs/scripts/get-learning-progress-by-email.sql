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
BEGIN
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can view learning progress';
  END IF;

  -- Return learning progress for the user with matching email
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
  WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(check_email))
  ORDER BY ep.week_number ASC, ep.lesson_id ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (admin check is inside function)
GRANT EXECUTE ON FUNCTION get_learning_progress_by_email(TEXT) TO authenticated;

-- Note: The function uses SECURITY DEFINER to access auth.users table
-- The admin check ensures only admins can execute this function

