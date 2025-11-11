-- Telegram Subscriptions Table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS telegram_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  username TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_telegram_subscriptions_chat_id ON telegram_subscriptions(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_subscriptions_user_id ON telegram_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_subscriptions_is_active ON telegram_subscriptions(is_active);

-- Enable Row Level Security
ALTER TABLE telegram_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for users to subscribe via bot)
DROP POLICY IF EXISTS "Allow public insert on telegram_subscriptions" ON telegram_subscriptions;
CREATE POLICY "Allow public insert on telegram_subscriptions" ON telegram_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Allow public update (for users to unsubscribe via bot)
DROP POLICY IF EXISTS "Allow public update on telegram_subscriptions" ON telegram_subscriptions;
CREATE POLICY "Allow public update on telegram_subscriptions" ON telegram_subscriptions
  FOR UPDATE
  USING (true);

-- Allow admins to read all subscriptions
DROP POLICY IF EXISTS "Allow admin read access on telegram_subscriptions" ON telegram_subscriptions;
CREATE POLICY "Allow admin read access on telegram_subscriptions" ON telegram_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Note: Backend service uses service role key, so it bypasses RLS
-- This is necessary for the backend to manage subscriptions and send notifications

