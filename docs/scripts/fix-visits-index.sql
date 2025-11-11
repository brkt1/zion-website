-- Fix for visits table index error
-- Run this if you got the IMMUTABLE function error

-- Drop the problematic index if it exists
DROP INDEX IF EXISTS idx_visits_date;

-- The created_at index is sufficient for date-based queries
-- No need for a separate date index

