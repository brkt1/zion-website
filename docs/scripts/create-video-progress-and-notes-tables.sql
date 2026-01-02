-- Video Progress Tracking and Student Notes Tables
-- Run this in your Supabase SQL Editor

-- Video Progress Table - Track watch time and resume position for each video
CREATE TABLE IF NOT EXISTS public.video_progress (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL,
  lesson_id TEXT NOT NULL,
  video_index INTEGER NOT NULL, -- Index of video in lesson's videos array
  youtube_id TEXT NOT NULL,
  watch_time_seconds INTEGER NOT NULL DEFAULT 0, -- Total seconds watched
  last_position_seconds INTEGER NOT NULL DEFAULT 0, -- Last position in video (for resume)
  completed BOOLEAN NOT NULL DEFAULT false, -- Video fully watched
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT video_progress_pkey PRIMARY KEY (id),
  CONSTRAINT video_progress_user_lesson_video_key UNIQUE (user_id, lesson_id, video_index),
  CONSTRAINT video_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Student Notes Table - Store notes for each lesson
CREATE TABLE IF NOT EXISTS public.student_notes (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL,
  lesson_id TEXT NOT NULL,
  note_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT student_notes_pkey PRIMARY KEY (id),
  CONSTRAINT student_notes_user_lesson_key UNIQUE (user_id, lesson_id),
  CONSTRAINT student_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_video_progress_user_id ON public.video_progress USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_video_progress_lesson_id ON public.video_progress USING btree (lesson_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_video_progress_completed ON public.video_progress USING btree (completed) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_student_notes_user_id ON public.student_notes USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_student_notes_lesson_id ON public.student_notes USING btree (lesson_id) TABLESPACE pg_default;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_video_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_student_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at on row updates
DROP TRIGGER IF EXISTS update_video_progress_updated_at ON public.video_progress;
CREATE TRIGGER update_video_progress_updated_at 
  BEFORE UPDATE ON public.video_progress 
  FOR EACH ROW
  EXECUTE FUNCTION update_video_progress_updated_at();

DROP TRIGGER IF EXISTS update_student_notes_updated_at ON public.student_notes;
CREATE TRIGGER update_student_notes_updated_at 
  BEFORE UPDATE ON public.student_notes 
  FOR EACH ROW
  EXECUTE FUNCTION update_student_notes_updated_at();

-- Enable Row Level Security
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own video progress" ON public.video_progress;
DROP POLICY IF EXISTS "Users can insert their own video progress" ON public.video_progress;
DROP POLICY IF EXISTS "Users can update their own video progress" ON public.video_progress;
DROP POLICY IF EXISTS "Users can view their own notes" ON public.student_notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON public.student_notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.student_notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.student_notes;

-- Policies for video_progress
CREATE POLICY "Users can view their own video progress" ON public.video_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video progress" ON public.video_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video progress" ON public.video_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for student_notes
CREATE POLICY "Users can view their own notes" ON public.student_notes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON public.student_notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON public.student_notes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON public.student_notes
  FOR DELETE
  USING (auth.uid() = user_id);

