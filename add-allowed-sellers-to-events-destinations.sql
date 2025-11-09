-- Add allowed_commission_seller_ids to events and destinations tables
-- Run this in your Supabase SQL Editor

-- Add allowed_commission_seller_ids column to events table (array of UUIDs)
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS allowed_commission_seller_ids UUID[] DEFAULT '{}';

-- Add allowed_commission_seller_ids column to destinations table (array of UUIDs)
ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS allowed_commission_seller_ids UUID[] DEFAULT '{}';

-- Create indexes for faster lookups (using GIN index for array searches)
CREATE INDEX IF NOT EXISTS idx_events_allowed_sellers ON events USING GIN (allowed_commission_seller_ids);
CREATE INDEX IF NOT EXISTS idx_destinations_allowed_sellers ON destinations USING GIN (allowed_commission_seller_ids);

