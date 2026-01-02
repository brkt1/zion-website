-- Course Tests and Test Results Tables
-- Run this in your Supabase SQL Editor

-- Course Tests Table
CREATE TABLE IF NOT EXISTS course_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER NOT NULL DEFAULT 75, -- Percentage required to pass
  time_limit INTEGER, -- Time limit in minutes (NULL = no limit)
  max_attempts INTEGER DEFAULT 3, -- Maximum number of attempts allowed
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test Questions Table
CREATE TABLE IF NOT EXISTS test_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES course_tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  options JSONB, -- For multiple choice: [{"text": "...", "is_correct": true/false}, ...]
  correct_answer TEXT, -- For true/false or short answer
  points INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test Results Table
CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES course_tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL, -- Percentage score
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL, -- Store user's answers: [{"question_id": "...", "answer": "..."}, ...]
  time_taken INTEGER, -- Time taken in seconds
  attempt_number INTEGER NOT NULL DEFAULT 1,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(test_id, user_id, attempt_number)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_course_tests_course_id ON course_tests(course_id);
CREATE INDEX IF NOT EXISTS idx_course_tests_is_active ON course_tests(is_active);
CREATE INDEX IF NOT EXISTS idx_test_questions_test_id ON test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_id ON test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_passed ON test_results(passed);

-- Enable Row Level Security
ALTER TABLE course_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies for course_tests
-- Allow public read access to active tests of active courses
DROP POLICY IF EXISTS "Allow public read active tests" ON course_tests;
CREATE POLICY "Allow public read active tests" ON course_tests
  FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = course_tests.course_id 
      AND courses.is_active = true
    )
  );

-- Allow admins full access to course_tests
DROP POLICY IF EXISTS "Allow admin full access to course_tests" ON course_tests;
CREATE POLICY "Allow admin full access to course_tests" ON course_tests
  FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- RLS Policies for test_questions
-- Allow public read access to questions of active tests
DROP POLICY IF EXISTS "Allow public read test questions" ON test_questions;
CREATE POLICY "Allow public read test questions" ON test_questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM course_tests 
      JOIN courses ON courses.id = course_tests.course_id
      WHERE course_tests.id = test_questions.test_id 
      AND course_tests.is_active = true
      AND courses.is_active = true
    )
  );

-- Allow admins full access to test_questions
DROP POLICY IF EXISTS "Allow admin full access to test_questions" ON test_questions;
CREATE POLICY "Allow admin full access to test_questions" ON test_questions
  FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- RLS Policies for test_results
-- Users can only see their own test results
DROP POLICY IF EXISTS "Users can view their own test results" ON test_results;
CREATE POLICY "Users can view their own test results" ON test_results
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own test results
DROP POLICY IF EXISTS "Users can insert their own test results" ON test_results;
CREATE POLICY "Users can insert their own test results" ON test_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow admins to read all test results
DROP POLICY IF EXISTS "Allow admin read access to test results" ON test_results;
CREATE POLICY "Allow admin read access to test results" ON test_results
  FOR SELECT
  USING (is_admin_user());

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER update_course_tests_updated_at
  BEFORE UPDATE ON course_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_questions_updated_at
  BEFORE UPDATE ON test_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

