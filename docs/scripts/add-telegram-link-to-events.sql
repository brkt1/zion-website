-- Add telegram_link column to events table
-- This allows free events to redirect users to Telegram groups after registration

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS telegram_link TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN events.telegram_link IS 'Telegram group link for free events - users will be redirected here after registration';

