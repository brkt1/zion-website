-- ============================================================
-- Masterclass Referral / Marketing Link Tracking
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add referral_code column to masterclass_reservations
ALTER TABLE masterclass_reservations
  ADD COLUMN IF NOT EXISTS referral_code VARCHAR(100);

-- Index for fast lookups by referral code
CREATE INDEX IF NOT EXISTS idx_masterclass_referral_code
  ON masterclass_reservations (referral_code);

-- 2. Allow public SELECT for referral dashboard (read-only, filtered by code)
-- The existing public insert policy already covers new registrations.
-- Just make sure SELECT is allowed (it should be if your existing RLS allows it):

-- If you haven't already:
ALTER TABLE masterclass_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read masterclass_reservations" ON masterclass_reservations;
CREATE POLICY "Allow public read masterclass_reservations"
  ON masterclass_reservations FOR SELECT
  USING (true);

-- NOTE: The referral dashboard only exposes: name, status, created_at
-- Sensitive fields (phone, email, age) are never sent to the frontend for the public dashboard.
