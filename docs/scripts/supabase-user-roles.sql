-- User Roles Table for Admin Access Control
-- Run this in your Supabase SQL Editor

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'event_organizer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own role
DROP POLICY IF EXISTS "Users can read their own role" ON user_roles;
CREATE POLICY "Users can read their own role" ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins can read all roles
DROP POLICY IF EXISTS "Admins can read all roles" ON user_roles;
CREATE POLICY "Admins can read all roles" ON user_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only service role can insert/update roles (for security)
-- This means you'll need to use the service role key or create roles via Supabase dashboard
-- For now, we'll allow authenticated users to check, but not modify

-- Function to check if user is admin (for use in policies)
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = user_uuid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;

-- Example: Make a user an admin
-- Replace 'USER_EMAIL_HERE' with the email of the user you want to make admin
-- INSERT INTO user_roles (user_id, role)
-- SELECT id, 'admin'
-- FROM auth.users
-- WHERE email = 'USER_EMAIL_HERE'
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

