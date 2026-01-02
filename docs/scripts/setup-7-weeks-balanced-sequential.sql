-- Setup Sequential Courses for 7 Weeks (49 Days Total) - BALANCED DISTRIBUTION
-- 5 courses distributed evenly: 10, 10, 10, 10, 9 days
-- Courses unlock sequentially - students must complete Course 1 before Course 2, etc.
-- Each course runs for a specific number of days, and courses start sequentially

-- ============================================
-- Create course_schedule table if it doesn't exist
-- ============================================
CREATE TABLE IF NOT EXISTS course_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  start_day INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  end_day INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_schedule_start_day ON course_schedule(start_day);
CREATE INDEX IF NOT EXISTS idx_course_schedule_end_day ON course_schedule(end_day);
CREATE INDEX IF NOT EXISTS idx_course_schedule_course_id ON course_schedule(course_id);

-- Enable Row Level Security
ALTER TABLE course_schedule ENABLE ROW LEVEL SECURITY;

-- Allow public read access to course schedule
DROP POLICY IF EXISTS "Allow public read course schedule" ON course_schedule;
CREATE POLICY "Allow public read course schedule" ON course_schedule
  FOR SELECT
  USING (true);

-- Allow admins full access to course_schedule
DROP POLICY IF EXISTS "Allow admin full access to course_schedule" ON course_schedule;
CREATE POLICY "Allow admin full access to course_schedule" ON course_schedule
  FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- ============================================
-- Create user enrollment tracking table
-- ============================================
CREATE TABLE IF NOT EXISTS user_enrollment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_day INTEGER DEFAULT 1,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_enrollment_user_id ON user_enrollment(user_id);
CREATE INDEX IF NOT EXISTS idx_user_enrollment_enrollment_date ON user_enrollment(enrollment_date);
CREATE INDEX IF NOT EXISTS idx_user_enrollment_current_day ON user_enrollment(current_day);

-- Enable Row Level Security
ALTER TABLE user_enrollment ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own enrollment
DROP POLICY IF EXISTS "Allow users read own enrollment" ON user_enrollment;
CREATE POLICY "Allow users read own enrollment" ON user_enrollment
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own enrollment
DROP POLICY IF EXISTS "Allow users update own enrollment" ON user_enrollment;
CREATE POLICY "Allow users update own enrollment" ON user_enrollment
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow admins full access
DROP POLICY IF EXISTS "Allow admin full access to user_enrollment" ON user_enrollment;
CREATE POLICY "Allow admin full access to user_enrollment" ON user_enrollment
  FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- ============================================
-- 7-WEEK BALANCED SCHEDULE (49 Days Total)
-- Course 01: Days 1-10 (10 days)
-- Course 02: Days 11-20 (10 days)
-- Course 03: Days 21-30 (10 days)
-- Course 04: Days 31-40 (10 days)
-- Course 05: Days 41-49 (9 days)
-- ============================================

-- Course 01: Introduction to Event Management - 10 days
INSERT INTO course_schedule (course_id, start_day, duration_days, end_day, is_active)
VALUES (
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  1,
  10,
  10,
  true
) ON CONFLICT (course_id) DO UPDATE SET 
  start_day = EXCLUDED.start_day,
  duration_days = EXCLUDED.duration_days,
  end_day = EXCLUDED.end_day;

-- Course 02: Event Management Planning - 10 days
INSERT INTO course_schedule (course_id, start_day, duration_days, end_day, is_active)
VALUES (
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  11,
  10,
  20,
  true
) ON CONFLICT (course_id) DO UPDATE SET 
  start_day = EXCLUDED.start_day,
  duration_days = EXCLUDED.duration_days,
  end_day = EXCLUDED.end_day;

-- Course 03: Different Aspects of Event Management - 10 days
INSERT INTO course_schedule (course_id, start_day, duration_days, end_day, is_active)
VALUES (
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  21,
  10,
  30,
  true
) ON CONFLICT (course_id) DO UPDATE SET 
  start_day = EXCLUDED.start_day,
  duration_days = EXCLUDED.duration_days,
  end_day = EXCLUDED.end_day;

-- Course 04: Basic Qualities of Event Management Person - 10 days
INSERT INTO course_schedule (course_id, start_day, duration_days, end_day, is_active)
VALUES (
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  31,
  10,
  40,
  true
) ON CONFLICT (course_id) DO UPDATE SET 
  start_day = EXCLUDED.start_day,
  duration_days = EXCLUDED.duration_days,
  end_day = EXCLUDED.end_day;

-- Course 05: Various Event Activities - 9 days
INSERT INTO course_schedule (course_id, start_day, duration_days, end_day, is_active)
VALUES (
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  41,
  9,
  49,
  true
) ON CONFLICT (course_id) DO UPDATE SET 
  start_day = EXCLUDED.start_day,
  duration_days = EXCLUDED.duration_days,
  end_day = EXCLUDED.end_day;

-- ============================================
-- Helper Functions
-- ============================================

-- Function to get or create user enrollment
CREATE OR REPLACE FUNCTION get_or_create_user_enrollment(check_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  enrollment_date DATE,
  current_day INTEGER,
  days_since_enrollment INTEGER
) AS $$
DECLARE
  enrollment_record user_enrollment%ROWTYPE;
BEGIN
  -- Try to get existing enrollment
  SELECT * INTO enrollment_record
  FROM user_enrollment
  WHERE user_id = check_user_id;
  
  -- If no enrollment exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_enrollment (user_id, enrollment_date, current_day)
    VALUES (check_user_id, CURRENT_DATE, 1)
    RETURNING * INTO enrollment_record;
  END IF;
  
  -- Calculate days since enrollment
  RETURN QUERY
  SELECT 
    enrollment_record.user_id,
    enrollment_record.enrollment_date,
    enrollment_record.current_day,
    GREATEST(1, CURRENT_DATE - enrollment_record.enrollment_date + 1)::INTEGER as days_since_enrollment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current day for a user
CREATE OR REPLACE FUNCTION get_user_current_day(check_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  user_day INTEGER;
  enrollment_record user_enrollment%ROWTYPE;
BEGIN
  -- Get or create enrollment
  SELECT * INTO enrollment_record
  FROM user_enrollment
  WHERE user_id = check_user_id;
  
  -- If no enrollment exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_enrollment (user_id, enrollment_date, current_day)
    VALUES (check_user_id, CURRENT_DATE, 1)
    RETURNING * INTO enrollment_record;
  END IF;
  
  -- Calculate current day based on enrollment date
  -- Day 1 = enrollment date, Day 2 = enrollment date + 1, etc.
  user_day := GREATEST(1, CURRENT_DATE - enrollment_record.enrollment_date + 1);
  
  -- Update current_day if it's different
  IF enrollment_record.current_day != user_day THEN
    UPDATE user_enrollment
    SET current_day = user_day, last_accessed_at = NOW(), updated_at = NOW()
    WHERE user_id = check_user_id;
  END IF;
  
  RETURN user_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active course for a given day
CREATE OR REPLACE FUNCTION get_active_course_for_day(check_day INTEGER)
RETURNS TABLE (
  course_id UUID,
  course_title TEXT,
  start_day INTEGER,
  end_day INTEGER,
  current_day INTEGER,
  days_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.course_id,
    c.title as course_title,
    cs.start_day,
    cs.end_day,
    check_day as current_day,
    GREATEST(0, cs.end_day - check_day) as days_remaining
  FROM course_schedule cs
  JOIN courses c ON c.id = cs.course_id
  WHERE cs.is_active = true
    AND check_day >= cs.start_day
    AND check_day <= cs.end_day
  ORDER BY cs.start_day
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to check if course is accessible for a user
CREATE OR REPLACE FUNCTION is_course_accessible_for_user(check_course_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_current_day INTEGER;
  course_start_day INTEGER;
  course_end_day INTEGER;
  previous_course_id UUID;
  previous_course_completed BOOLEAN;
BEGIN
  -- Get user's current day
  user_current_day := get_user_current_day(check_user_id);
  
  -- Get course schedule
  SELECT start_day, end_day INTO course_start_day, course_end_day
  FROM course_schedule
  WHERE course_id = check_course_id AND is_active = true;
  
  IF course_start_day IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user's current day is within course range
  IF user_current_day < course_start_day OR user_current_day > course_end_day THEN
    RETURN false;
  END IF;
  
  -- Check if previous course is completed (if not Course 1)
  IF course_start_day > 1 THEN
    -- Find previous course
    SELECT cs.course_id INTO previous_course_id
    FROM course_schedule cs
    WHERE cs.is_active = true
      AND cs.end_day < course_start_day
    ORDER BY cs.end_day DESC
    LIMIT 1;
    
    -- If previous course exists, check if it's completed
    IF previous_course_id IS NOT NULL THEN
      -- Check if all lessons in previous course are completed
      SELECT NOT EXISTS (
        SELECT 1
        FROM course_lessons cl
        JOIN course_weeks cw ON cw.id = cl.week_id
        WHERE cw.course_id = previous_course_id
          AND NOT EXISTS (
            SELECT 1
            FROM elearning_progress ep
            WHERE ep.user_id = check_user_id
              AND ep.lesson_id = cl.lesson_id
              AND ep.completed = true
          )
      ) INTO previous_course_completed;
      
      -- If previous course is not completed, deny access
      IF NOT previous_course_completed THEN
        RETURN false;
      END IF;
    END IF;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get accessible courses for a user
CREATE OR REPLACE FUNCTION get_accessible_courses_for_user(check_user_id UUID)
RETURNS TABLE (
  course_id UUID,
  course_title TEXT,
  start_day INTEGER,
  end_day INTEGER,
  current_day INTEGER,
  is_current_course BOOLEAN,
  days_remaining INTEGER
) AS $$
DECLARE
  user_current_day INTEGER;
BEGIN
  user_current_day := get_user_current_day(check_user_id);
  
  RETURN QUERY
  SELECT 
    c.id as course_id,
    c.title as course_title,
    cs.start_day,
    cs.end_day,
    user_current_day as current_day,
    (user_current_day >= cs.start_day AND user_current_day <= cs.end_day) as is_current_course,
    GREATEST(0, cs.end_day - user_current_day) as days_remaining
  FROM courses c
  JOIN course_schedule cs ON cs.course_id = c.id
  WHERE c.is_active = true
    AND cs.is_active = true
    AND is_course_accessible_for_user(c.id, check_user_id)
  ORDER BY cs.start_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a course is completed
CREATE OR REPLACE FUNCTION is_course_completed(check_course_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1
    FROM course_lessons cl
    JOIN course_weeks cw ON cw.id = cl.week_id
    WHERE cw.course_id = check_course_id
      AND NOT EXISTS (
        SELECT 1
        FROM elearning_progress ep
        WHERE ep.user_id = check_user_id
          AND ep.lesson_id = cl.lesson_id
          AND ep.completed = true
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

