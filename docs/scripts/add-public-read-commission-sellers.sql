-- Add public read access for active commission sellers
-- This allows anyone (including anonymous users) to see active sellers when buying tickets
-- Run this in your Supabase SQL Editor

-- Allow public/anonymous users to read active commission sellers
DROP POLICY IF EXISTS "Allow public read of active commission sellers" ON commission_sellers;
CREATE POLICY "Allow public read of active commission sellers" ON commission_sellers FOR SELECT 
  USING (is_active = true);

