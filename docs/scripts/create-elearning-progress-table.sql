-- E-Learning Progress Table
-- Stores lesson completion status for each user
-- Run this in your Supabase SQL Editor

-- Create the table
CREATE TABLE IF NOT EXISTS public.elearning_progress (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL,
  lesson_id TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  viewed BOOLEAN NOT NULL DEFAULT false,
  viewed_at TIMESTAMP WITH TIME ZONE NULL,
  CONSTRAINT elearning_progress_pkey PRIMARY KEY (id),
  CONSTRAINT elearning_progress_user_id_lesson_id_key UNIQUE (user_id, lesson_id),
  CONSTRAINT elearning_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_elearning_progress_user_id ON public.elearning_progress USING btree (user_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_elearning_progress_lesson_id ON public.elearning_progress USING btree (lesson_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_elearning_progress_completed ON public.elearning_progress USING btree (completed) TABLESPACE pg_default;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_elearning_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
DROP TRIGGER IF EXISTS update_elearning_progress_updated_at ON public.elearning_progress;
CREATE TRIGGER update_elearning_progress_updated_at 
  BEFORE UPDATE ON public.elearning_progress 
  FOR EACH ROW
  EXECUTE FUNCTION update_elearning_progress_updated_at();

-- Enable Row Level Security
ALTER TABLE public.elearning_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own progress" ON public.elearning_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.elearning_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.elearning_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON public.elearning_progress;

-- Policy: Users can only see their own progress
CREATE POLICY "Users can view their own progress" ON public.elearning_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own progress
CREATE POLICY "Users can insert their own progress" ON public.elearning_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own progress
CREATE POLICY "Users can update their own progress" ON public.elearning_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all progress (for admin dashboard)
-- This requires a user_roles table with admin role
-- Uncomment if you have admin role system set up
/*
CREATE POLICY "Admins can view all progress" ON public.elearning_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );
*/
