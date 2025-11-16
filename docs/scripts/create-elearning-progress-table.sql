-- E-Learning Progress Table
-- Stores lesson completion status for each user
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS elearning_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  viewed BOOLEAN NOT NULL DEFAULT false,
  viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_elearning_progress_user_id ON elearning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_elearning_progress_lesson_id ON elearning_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_elearning_progress_completed ON elearning_progress(completed);

-- Enable Row Level Security
ALTER TABLE elearning_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own progress
DROP POLICY IF EXISTS "Users can view their own progress" ON elearning_progress;
CREATE POLICY "Users can view their own progress" ON elearning_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own progress
DROP POLICY IF EXISTS "Users can insert their own progress" ON elearning_progress;
CREATE POLICY "Users can insert their own progress" ON elearning_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own progress
DROP POLICY IF EXISTS "Users can update their own progress" ON elearning_progress;
CREATE POLICY "Users can update their own progress" ON elearning_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_elearning_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
DROP TRIGGER IF EXISTS update_elearning_progress_updated_at ON elearning_progress;
CREATE TRIGGER update_elearning_progress_updated_at
  BEFORE UPDATE ON elearning_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_elearning_progress_updated_at();

