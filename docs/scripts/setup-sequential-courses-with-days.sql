-- Setup Sequential Courses with Day-Based Scheduling
-- Each course runs for a specific number of days, and courses start sequentially
-- Only the current day's course content should be displayed (ALX-style)

-- ============================================
-- Add course schedule tracking table if it doesn't exist
-- ============================================
CREATE TABLE IF NOT EXISTS course_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  start_day INTEGER NOT NULL, -- Day number when course starts (1, 3, 5, etc.)
  duration_days INTEGER NOT NULL, -- How many days the course lasts
  end_day INTEGER NOT NULL, -- Day number when course ends
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
-- Setup Course Schedule
-- Course 01: Days 1-2 (2 days)
-- Course 02: Days 3-4 (2 days) 
-- Course 03: Days 5-7 (3 days)
-- Course 04: Days 8-10 (3 days)
-- Course 05: Days 11-14 (4 days)
-- Total: 14 days (2 weeks)
-- ============================================

-- Course 01: Introduction to Event Management - 2 days
INSERT INTO course_schedule (course_id, start_day, duration_days, end_day, is_active)
VALUES (
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  1,
  2,
  2,
  true
) ON CONFLICT (course_id) DO UPDATE SET 
  start_day = EXCLUDED.start_day,
  duration_days = EXCLUDED.duration_days,
  end_day = EXCLUDED.end_day;

-- Course 02: Event Management Planning - 2 days
INSERT INTO course_schedule (course_id, start_day, duration_days, end_day, is_active)
VALUES (
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  3,
  2,
  4,
  true
) ON CONFLICT (course_id) DO UPDATE SET 
  start_day = EXCLUDED.start_day,
  duration_days = EXCLUDED.duration_days,
  end_day = EXCLUDED.end_day;

-- Course 03: Different Aspects of Event Management - 3 days
INSERT INTO course_schedule (course_id, start_day, duration_days, end_day, is_active)
VALUES (
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  5,
  3,
  7,
  true
) ON CONFLICT (course_id) DO UPDATE SET 
  start_day = EXCLUDED.start_day,
  duration_days = EXCLUDED.duration_days,
  end_day = EXCLUDED.end_day;

-- Course 04: Basic Qualities of Event Management Person - 3 days
INSERT INTO course_schedule (course_id, start_day, duration_days, end_day, is_active)
VALUES (
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  8,
  3,
  10,
  true
) ON CONFLICT (course_id) DO UPDATE SET 
  start_day = EXCLUDED.start_day,
  duration_days = EXCLUDED.duration_days,
  end_day = EXCLUDED.end_day;

-- Course 05: Various Event Activities - 4 days
INSERT INTO course_schedule (course_id, start_day, duration_days, end_day, is_active)
VALUES (
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  11,
  4,
  14,
  true
) ON CONFLICT (course_id) DO UPDATE SET 
  start_day = EXCLUDED.start_day,
  duration_days = EXCLUDED.duration_days,
  end_day = EXCLUDED.end_day;

-- ============================================
-- Reorganize Course 01: 2 days (split into 2 parts)
-- ============================================
DELETE FROM course_weeks WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234';

-- Day 1: Introduction, Definitions, Classification
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a001-111111111111',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  1,
  'Introduction to Events, Definitions and Classification',
  'Understand what events are, learn definitions and classifications',
  1
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 2: Types, Benefits, Strategy, Objectives, Creativity, Committee, Functions
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a002-111111111112',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  2,
  'Types, Benefits, Strategy, Objectives, Creativity, Committee and Functions',
  'Learn about event types, benefits, strategies, objectives, creativity, committee structure and functions',
  2
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Course 01
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a001-111111111111', date = 'Day 1' 
WHERE lesson_id IN ('1-1', '1-2', '1-3') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234');

UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a002-111111111112', date = 'Day 2' 
WHERE lesson_id IN ('1-4', '1-5', '1-6', '1-7', '1-8', '1-9', '1-10') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234');

-- ============================================
-- Reorganize Course 02: 2 days (split into 2 parts)
-- ============================================
DELETE FROM course_weeks WHERE course_id = 'c2d3e4f5-a6b7-4890-c123-456789012345';

-- Day 3: Planning Introduction, Environmental Factors, Planning Steps, Operational Planning
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b001-222222222221',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  1,
  'Event Planning Introduction and Operational Planning',
  'Understand event planning process, environmental factors and operational planning',
  1
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 4: Budgets, Sponsorship, Team, Venue, Security, Marketing, Timeline, Post-Event
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b002-222222222222',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  2,
  'Budgets, Sponsorship, Team, Venue, Security, Marketing, Timeline and Post-Event',
  'Learn about budgets, sponsorship, team organization, venue selection, security, marketing, timeline and post-event evaluation',
  2
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Course 02
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b001-222222222221', date = 'Day 3' 
WHERE lesson_id IN ('2-1', '2-2', '2-3', '2-4') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'c2d3e4f5-a6b7-4890-c123-456789012345');

UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b002-222222222222', date = 'Day 4' 
WHERE lesson_id IN ('2-5', '2-6', '2-7', '2-8', '2-9', '2-10', '2-11', '2-12') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'c2d3e4f5-a6b7-4890-c123-456789012345');

-- ============================================
-- Reorganize Course 03: 3 days (split into 3 parts)
-- ============================================
DELETE FROM course_weeks WHERE course_id = 'e3f4a5b6-c7d8-4901-e234-567890123456';

-- Day 5: Stage Management, Brand Management Part 1
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c001-333333333331',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  1,
  'Stage Management and Brand Management Fundamentals',
  'Understand stage management and brand management basics',
  1
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 6: Brand Strategy, Budgeting Part 1
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c002-333333333332',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  2,
  'Brand Strategy and Budgeting',
  'Learn brand strategy design and budgeting fundamentals',
  2
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 7: Budget Control, Leadership, Success, Feedback
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c003-333333333333',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  3,
  'Budget Control, Leadership, Event Success and Feedback',
  'Learn budget control, leadership skills, event success metrics and feedback methods',
  3
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Course 03
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c001-333333333331', date = 'Day 5' 
WHERE lesson_id IN ('3-1', '3-2', '3-3') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'e3f4a5b6-c7d8-4901-e234-567890123456');

UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c002-333333333332', date = 'Day 6' 
WHERE lesson_id IN ('3-4', '3-5', '3-6', '3-7') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'e3f4a5b6-c7d8-4901-e234-567890123456');

UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c003-333333333333', date = 'Day 7' 
WHERE lesson_id IN ('3-8', '3-9', '3-10', '3-11', '3-12', '3-13') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'e3f4a5b6-c7d8-4901-e234-567890123456');

-- ============================================
-- Reorganize Course 04: 3 days (split into 3 parts)
-- ============================================
DELETE FROM course_weeks WHERE course_id = 'a4b5c6d7-e8f9-5012-f345-678901234567';

-- Day 8: Standards, Environment, Management Knowledge, Interpersonal Skills
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d001-444444444441',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  1,
  'Standards, Environment, Management Knowledge and Interpersonal Skills',
  'Understand standards, regulations, event environment, management knowledge and interpersonal skills',
  1
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 9: Delegation, Communication, Leadership, Motivation
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d002-444444444442',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  2,
  'Delegation, Communication, Leadership and Motivation',
  'Learn effective delegation, communication, leadership and motivation',
  2
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 10: Problem Solving, Team Management, Risk, Multitasking, Decoration, Etiquette, Time Management
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d003-444444444443',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  3,
  'Problem Solving, Team Management, Risk, Multitasking, Decoration, Etiquette and Time Management',
  'Learn problem-solving, team management, risk management, multitasking, decoration, etiquettes and time management',
  3
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Course 04
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d001-444444444441', date = 'Day 8' 
WHERE lesson_id IN ('4-1', '4-2', '4-3', '4-4') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a4b5c6d7-e8f9-5012-f345-678901234567');

UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d002-444444444442', date = 'Day 9' 
WHERE lesson_id IN ('4-5', '4-6', '4-7', '4-8', '4-9', '4-10') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a4b5c6d7-e8f9-5012-f345-678901234567');

UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d003-444444444443', date = 'Day 10' 
WHERE lesson_id IN ('4-11', '4-12', '4-13', '4-14', '4-15', '4-16', '4-17') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a4b5c6d7-e8f9-5012-f345-678901234567');

-- ============================================
-- Reorganize Course 05: 4 days (split into 4 parts)
-- ============================================
DELETE FROM course_weeks WHERE course_id = 'a5b6c7d8-e9f0-6123-a456-789012345678';

-- Day 11: Types of Events, Corporate Events
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e001-555555555551',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  1,
  'Types of Events and Corporate Events',
  'Understand different types of events and corporate events including MICE',
  1
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 12: Conferences, Exhibitions Part 1
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e002-555555555552',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  2,
  'Conferences and Exhibitions',
  'Learn about conference planning and exhibitions',
  2
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 13: Exhibitions Part 2, Charity Events, Live Events, Sports Events
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e003-555555555553',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  3,
  'Exhibition Design, Charity Events, Live Events and Sports Events',
  'Learn about exhibition design, charity events, live events and sports events',
  3
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 14: Festivals, India as Destination, ITPO
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e004-555555555554',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  4,
  'Festivals, India as MICE Destination and ITPO',
  'Learn about festivals, India as emerging MICE destination and role of ITPO',
  4
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Course 05
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-e001-555555555551', date = 'Day 11' 
WHERE lesson_id IN ('5-1', '5-2') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a5b6c7d8-e9f0-6123-a456-789012345678');

UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-e002-555555555552', date = 'Day 12' 
WHERE lesson_id IN ('5-3', '5-4') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a5b6c7d8-e9f0-6123-a456-789012345678');

UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-e003-555555555553', date = 'Day 13' 
WHERE lesson_id IN ('5-5', '5-6', '5-7', '5-8', '5-9', '5-10') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a5b6c7d8-e9f0-6123-a456-789012345678');

UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-e004-555555555554', date = 'Day 14' 
WHERE lesson_id IN ('5-11', '5-12', '5-13', '5-14') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a5b6c7d8-e9f0-6123-a456-789012345678');

-- ============================================
-- Create function to get active course for a given day
-- ============================================
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
    (cs.end_day - check_day) as days_remaining
  FROM course_schedule cs
  JOIN courses c ON c.id = cs.course_id
  WHERE cs.is_active = true
    AND check_day >= cs.start_day
    AND check_day <= cs.end_day
  ORDER BY cs.start_day
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Create function to check if course is accessible
-- ============================================
CREATE OR REPLACE FUNCTION is_course_accessible(check_course_id UUID, check_day INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  course_start_day INTEGER;
  course_end_day INTEGER;
BEGIN
  SELECT start_day, end_day INTO course_start_day, course_end_day
  FROM course_schedule
  WHERE course_id = check_course_id AND is_active = true;
  
  IF course_start_day IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN check_day >= course_start_day AND check_day <= course_end_day;
END;
$$ LANGUAGE plpgsql;

