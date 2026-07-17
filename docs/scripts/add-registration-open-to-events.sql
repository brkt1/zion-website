-- Add is_registration_open to events table to allow turning off registration
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_registration_open BOOLEAN DEFAULT true;

-- Update existing events to have registration open by default
UPDATE events SET is_registration_open = true WHERE is_registration_open IS NULL;
