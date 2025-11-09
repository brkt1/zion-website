-- Reminders/Callbacks Table for Ticket Purchases
-- Run this in your Supabase SQL Editor

-- Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_time TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_reminders_ticket_id ON reminders(ticket_id);
CREATE INDEX IF NOT EXISTS idx_reminders_customer_email ON reminders(customer_email);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_reminder_date ON reminders(reminder_date);

-- Enable Row Level Security
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for reminders
-- Allow admins to read all reminders
DROP POLICY IF EXISTS "Allow admin read access on reminders" ON reminders;
CREATE POLICY "Allow admin read access on reminders" ON reminders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Allow admins to insert reminders
DROP POLICY IF EXISTS "Allow admin insert access on reminders" ON reminders;
CREATE POLICY "Allow admin insert access on reminders" ON reminders
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Allow admins to update reminders
DROP POLICY IF EXISTS "Allow admin update access on reminders" ON reminders;
CREATE POLICY "Allow admin update access on reminders" ON reminders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Allow admins to delete reminders
DROP POLICY IF EXISTS "Allow admin delete access on reminders" ON reminders;
CREATE POLICY "Allow admin delete access on reminders" ON reminders
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

