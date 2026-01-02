-- Courses Management Tables for E-Learning System
-- Run this in your Supabase SQL Editor

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course Weeks Table
CREATE TABLE IF NOT EXISTS course_weeks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  theme TEXT NOT NULL,
  goal TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, week_number)
);

-- Course Lessons Table
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_id UUID NOT NULL REFERENCES course_weeks(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL, -- e.g., '1-1', '1-2'
  date TEXT NOT NULL,
  topic TEXT NOT NULL,
  time TEXT NOT NULL,
  activity TEXT NOT NULL,
  deliverables TEXT NOT NULL,
  content TEXT, -- Main learning content (markdown or HTML)
  key_concepts TEXT[], -- Array of key concepts
  videos JSONB, -- Array of video objects: [{"topic": "...", "youtubeId": "...", "description": "..."}]
  notes TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(week_id, lesson_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON courses(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_display_order ON courses(display_order);
CREATE INDEX IF NOT EXISTS idx_course_weeks_course_id ON course_weeks(course_id);
CREATE INDEX IF NOT EXISTS idx_course_weeks_week_number ON course_weeks(week_number);
CREATE INDEX IF NOT EXISTS idx_course_lessons_week_id ON course_lessons(week_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_lesson_id ON course_lessons(lesson_id);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for courses
-- Allow public read access to active courses
DROP POLICY IF EXISTS "Allow public read active courses" ON courses;
CREATE POLICY "Allow public read active courses" ON courses
  FOR SELECT
  USING (is_active = true);

-- Allow admins full access to courses
DROP POLICY IF EXISTS "Allow admin full access to courses" ON courses;
CREATE POLICY "Allow admin full access to courses" ON courses
  FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- RLS Policies for course_weeks
-- Allow public read access to weeks of active courses
DROP POLICY IF EXISTS "Allow public read weeks" ON course_weeks;
CREATE POLICY "Allow public read weeks" ON course_weeks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = course_weeks.course_id 
      AND courses.is_active = true
    )
  );

-- Allow admins full access to course_weeks
DROP POLICY IF EXISTS "Allow admin full access to course_weeks" ON course_weeks;
CREATE POLICY "Allow admin full access to course_weeks" ON course_weeks
  FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- RLS Policies for course_lessons
-- Allow public read access to lessons of active courses
DROP POLICY IF EXISTS "Allow public read lessons" ON course_lessons;
CREATE POLICY "Allow public read lessons" ON course_lessons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM course_weeks 
      JOIN courses ON courses.id = course_weeks.course_id
      WHERE course_weeks.id = course_lessons.week_id 
      AND courses.is_active = true
    )
  );

-- Allow admins full access to course_lessons
DROP POLICY IF EXISTS "Allow admin full access to course_lessons" ON course_lessons;
CREATE POLICY "Allow admin full access to course_lessons" ON course_lessons
  FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_weeks_updated_at
  BEFORE UPDATE ON course_weeks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_lessons_updated_at
  BEFORE UPDATE ON course_lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

