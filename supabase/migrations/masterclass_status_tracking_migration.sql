-- ============================================================
-- Masterclass Status Tracking Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

ALTER TABLE masterclass_reservations
  ADD COLUMN IF NOT EXISTS status_updated_by VARCHAR(255);
