-- RPC Functions for Event Organizer Management
-- These functions allow admins to assign event_organizer roles and assign organizers to events

-- Function to assign event_organizer role to a user by email
CREATE OR REPLACE FUNCTION assign_event_organizer_role(user_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can assign event_organizer role';
  END IF;

  -- Find user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', user_email;
  END IF;

  -- Insert or update user role
  INSERT INTO user_roles (user_id, role)
  VALUES (v_user_id, 'event_organizer')
  ON CONFLICT (user_id) 
  DO UPDATE SET role = 'event_organizer';

  v_result := jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', user_email,
    'role', 'event_organizer'
  );

  RETURN v_result;
END;
$$;

-- Function to assign organizer to event (with optional role assignment)
CREATE OR REPLACE FUNCTION assign_organizer_to_event(
  p_event_id UUID,
  p_user_email TEXT,
  p_auto_assign_role BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
  v_result JSONB;
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can assign organizers to events';
  END IF;

  -- Find user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_user_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', p_user_email;
  END IF;

  -- Check user's role
  SELECT role INTO v_user_role
  FROM user_roles
  WHERE user_id = v_user_id;

  -- Auto-assign role if requested and user doesn't have it
  IF p_auto_assign_role AND (v_user_role IS NULL OR v_user_role NOT IN ('event_organizer', 'admin')) THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (v_user_id, 'event_organizer')
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'event_organizer';
    v_user_role := 'event_organizer';
  END IF;

  -- Verify user has correct role
  IF v_user_role NOT IN ('event_organizer', 'admin') THEN
    RAISE EXCEPTION 'User must have event_organizer or admin role. Current role: %', COALESCE(v_user_role, 'none');
  END IF;

  -- Check if event exists
  IF NOT EXISTS (SELECT 1 FROM events WHERE id = p_event_id) THEN
    RAISE EXCEPTION 'Event not found';
  END IF;

  -- Insert organizer assignment
  INSERT INTO event_organizers (event_id, user_id, user_email)
  VALUES (p_event_id, v_user_id, LOWER(p_user_email))
  ON CONFLICT (event_id, user_id) DO NOTHING;

  v_result := jsonb_build_object(
    'success', true,
    'event_id', p_event_id,
    'user_id', v_user_id,
    'email', p_user_email,
    'role_assigned', p_auto_assign_role
  );

  RETURN v_result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION assign_event_organizer_role(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_organizer_to_event(UUID, TEXT, BOOLEAN) TO authenticated;

