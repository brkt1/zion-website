-- Telegram Admin Users Table
-- Links Telegram user IDs to Supabase admin users
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS telegram_admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_user_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  is_active BOOLEAN DEFAULT true,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_telegram_admin_users_telegram_user_id ON telegram_admin_users(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_admin_users_user_id ON telegram_admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_admin_users_is_active ON telegram_admin_users(is_active);

-- Enable Row Level Security
ALTER TABLE telegram_admin_users ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all admin links
DROP POLICY IF EXISTS "Allow admin read access on telegram_admin_users" ON telegram_admin_users;
CREATE POLICY "Allow admin read access on telegram_admin_users" ON telegram_admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Only service role can insert/update/delete (for security)
-- This means you'll need to use the service role key or create links via Supabase dashboard

-- Note: Backend service uses service role key, so it bypasses RLS
-- This is necessary for the backend to check admin status

-- Example: Link a Telegram user to an admin account
-- Replace 'TELEGRAM_USER_ID' with the actual Telegram user ID (get it by messaging the bot)
-- Replace 'USER_EMAIL' with the admin's email
-- 
-- INSERT INTO telegram_admin_users (telegram_user_id, user_id, username, first_name, is_active)
-- SELECT 'TELEGRAM_USER_ID', u.id, 'telegram_username', 'First Name', true
-- FROM auth.users u
-- WHERE u.email = 'USER_EMAIL'
-- ON CONFLICT (telegram_user_id) DO UPDATE 
-- SET user_id = EXCLUDED.user_id, 
--     updated_at = NOW();

