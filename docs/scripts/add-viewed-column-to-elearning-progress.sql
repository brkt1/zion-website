-- Migration: Add viewed column to existing elearning_progress table
-- Run this if you already have the elearning_progress table

-- Add viewed column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'elearning_progress' 
    AND column_name = 'viewed'
  ) THEN
    ALTER TABLE elearning_progress 
    ADD COLUMN viewed BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add viewed_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'elearning_progress' 
    AND column_name = 'viewed_at'
  ) THEN
    ALTER TABLE elearning_progress 
    ADD COLUMN viewed_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- If a lesson is completed, mark it as viewed as well
UPDATE elearning_progress 
SET viewed = true, viewed_at = completed_at 
WHERE completed = true AND (viewed = false OR viewed IS NULL);

