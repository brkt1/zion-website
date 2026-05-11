-- Add sales intelligence columns to masterclass_reservations table
-- Run this in your Supabase SQL Editor

ALTER TABLE masterclass_reservations 
ADD COLUMN IF NOT EXISTS selected_package TEXT,
ADD COLUMN IF NOT EXISTS communication_method TEXT;

-- Verify columns
COMMENT ON COLUMN masterclass_reservations.selected_package IS 'The training package chosen by the student (Basic, Intermediate, Premium)';
COMMENT ON COLUMN masterclass_reservations.communication_method IS 'The method of communication used (Phone, Telegram, WhatsApp, etc)';
