-- Add social_media_link column to events table
-- This allows community and free events to link to social media pages

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS social_media_link TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN events.social_media_link IS 'Social media link for community/free events (Facebook, Instagram, etc.)';

