-- Add 'used' status to tickets table
-- Run this in your Supabase SQL Editor

-- Update the check constraint to include 'used' status
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
ALTER TABLE tickets ADD CONSTRAINT tickets_status_check 
  CHECK (status IN ('pending', 'success', 'failed', 'cancelled', 'used'));

