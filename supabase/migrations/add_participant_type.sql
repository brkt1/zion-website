-- Add participant_type column to yenege_unity_attendees table
ALTER TABLE yenege_unity_attendees ADD COLUMN IF NOT EXISTS participant_type TEXT;
