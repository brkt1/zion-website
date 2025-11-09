-- Add commission_seller_id to tickets table
-- Run this in your Supabase SQL Editor

-- Add commission_seller_id column to tickets table
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS commission_seller_id UUID REFERENCES commission_sellers(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tickets_commission_seller_id ON tickets(commission_seller_id);

-- Add commission_seller_name for easier display (denormalized for performance)
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS commission_seller_name TEXT;

-- Create index on commission_seller_name
CREATE INDEX IF NOT EXISTS idx_tickets_commission_seller_name ON tickets(commission_seller_name);

