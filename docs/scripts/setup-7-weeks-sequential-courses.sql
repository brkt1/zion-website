-- Setup Sequential Courses for 7 Weeks (49 Days Total)
-- Lessons distributed per day based on difficulty/hardness
-- Each course runs sequentially, and only current day's content is shown

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
-- 7-WEEK SCHEDULE (49 Days Total)
-- Course 01: Days 1-10 (10 days, 10 lessons)
-- Course 02: Days 11-22 (12 days, 12 lessons)
-- Course 03: Days 23-35 (13 days, 13 lessons)
-- Course 04: Days 36-42 (7 days, 17 lessons - more per day)
-- Course 05: Days 43-49 (7 days, 14 lessons - 2 per day)
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

-- Course 02: Event Management Planning - 12 days
INSERT INTO course_schedule (course_id, start_day, duration_days, end_day, is_active)
VALUES (
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  11,
  12,
  22,
  true
) ON CONFLICT (course_id) DO UPDATE SET 
  start_day = EXCLUDED.start_day,
  duration_days = EXCLUDED.duration_days,
  end_day = EXCLUDED.end_day;

-- Course 03: Different Aspects of Event Management - 13 days
INSERT INTO course_schedule (course_id, start_day, duration_days, end_day, is_active)
VALUES (
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  23,
  13,
  35,
  true
) ON CONFLICT (course_id) DO UPDATE SET 
  start_day = EXCLUDED.start_day,
  duration_days = EXCLUDED.duration_days,
  end_day = EXCLUDED.end_day;

-- Course 04: Basic Qualities of Event Management Person - 7 days
INSERT INTO course_schedule (course_id, start_day, duration_days, end_day, is_active)
VALUES (
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  36,
  7,
  42,
  true
) ON CONFLICT (course_id) DO UPDATE SET 
  start_day = EXCLUDED.start_day,
  duration_days = EXCLUDED.duration_days,
  end_day = EXCLUDED.end_day;

-- Course 05: Various Event Activities - 7 days
INSERT INTO course_schedule (course_id, start_day, duration_days, end_day, is_active)
VALUES (
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  43,
  7,
  49,
  true
) ON CONFLICT (course_id) DO UPDATE SET 
  start_day = EXCLUDED.start_day,
  duration_days = EXCLUDED.duration_days,
  end_day = EXCLUDED.end_day;

-- ============================================
-- COURSE 01: Introduction to Event Management (10 days, 10 lessons)
-- 1 lesson per day, organized by difficulty
-- ============================================
-- First, update lessons to new week structure, then delete old weeks

-- Day 1: Easy - Introduction (1-1)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a001-111111111111',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  1,
  'Day 1: Introduction to Events',
  'Understand what events are and their importance',
  1
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 2: Easy - Definitions (1-2)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a002-111111111112',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  2,
  'Day 2: Definitions of Events',
  'Learn various definitions of events',
  2
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 3: Medium - Classification (1-3)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a003-111111111113',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  3,
  'Day 3: Classification of Events',
  'Learn about different categories of events',
  3
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 4: Medium - Types (1-4)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a004-111111111114',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  4,
  'Day 4: Types of Events',
  'Understand different types of events',
  4
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 5: Medium - Benefits (1-5)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a005-111111111115',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  5,
  'Day 5: Benefits of Events',
  'Understand benefits of hosting events',
  5
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 6: Hard - Strategy (1-6)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a006-111111111116',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  6,
  'Day 6: Event Management Strategy',
  'Learn event management strategies',
  6
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 7: Easy - Objectives (1-7)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a007-111111111117',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  7,
  'Day 7: Objectives of Event Management',
  'Learn SMART objectives',
  7
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 8: Medium - Creativity (1-8)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a008-111111111118',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  8,
  'Day 8: Role of Creativity',
  'Understand role of creativity in events',
  8
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 9: Hard - Committee (1-9)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a009-111111111119',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  9,
  'Day 9: Event Committee',
  'Learn about event committee structure',
  9
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 10: Hard - Functions (1-10)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a010-111111111120',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  10,
  'Day 10: Functions of Event Management',
  'Understand all functions of event management',
  10
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Course 01 (1 lesson per day)
-- Update lessons directly by lesson_id - they belong to course 01
-- Note: lesson_id format '1-X' uniquely identifies Course 01 lessons
UPDATE course_lessons
SET week_id = 'a1a1b2c3-d4e5-4789-a001-111111111111', date = 'Day 1', display_order = 1
WHERE lesson_id = '1-1';

UPDATE course_lessons
SET week_id = 'a1a1b2c3-d4e5-4789-a002-111111111112', date = 'Day 2', display_order = 1
WHERE lesson_id = '1-2';

UPDATE course_lessons
SET week_id = 'a1a1b2c3-d4e5-4789-a003-111111111113', date = 'Day 3', display_order = 1
WHERE lesson_id = '1-3';

UPDATE course_lessons
SET week_id = 'a1a1b2c3-d4e5-4789-a004-111111111114', date = 'Day 4', display_order = 1
WHERE lesson_id = '1-4';

UPDATE course_lessons
SET week_id = 'a1a1b2c3-d4e5-4789-a005-111111111115', date = 'Day 5', display_order = 1
WHERE lesson_id = '1-5';

UPDATE course_lessons
SET week_id = 'a1a1b2c3-d4e5-4789-a006-111111111116', date = 'Day 6', display_order = 1
WHERE lesson_id = '1-6';

UPDATE course_lessons
SET week_id = 'a1a1b2c3-d4e5-4789-a007-111111111117', date = 'Day 7', display_order = 1
WHERE lesson_id = '1-7';

UPDATE course_lessons
SET week_id = 'a1a1b2c3-d4e5-4789-a008-111111111118', date = 'Day 8', display_order = 1
WHERE lesson_id = '1-8';

UPDATE course_lessons
SET week_id = 'a1a1b2c3-d4e5-4789-a009-111111111119', date = 'Day 9', display_order = 1
WHERE lesson_id = '1-9';

UPDATE course_lessons
SET week_id = 'a1a1b2c3-d4e5-4789-a010-111111111120', date = 'Day 10', display_order = 1
WHERE lesson_id = '1-10';

-- ============================================
-- COURSE 02: Event Management Planning (12 days, 12 lessons)
-- 1 lesson per day, organized by difficulty
-- ============================================
DELETE FROM course_weeks WHERE course_id = 'c2d3e4f5-a6b7-4890-c123-456789012345';

-- Day 11: Easy - Planning Introduction (2-1)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b001-222222222221',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  1,
  'Day 11: Event Planning Introduction',
  'Understand event planning process',
  1
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 12: Hard - Environmental Factors (2-2)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b002-222222222222',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  2,
  'Day 12: Forces Affecting Event Planning',
  'Learn PESTEL analysis and environmental factors',
  2
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 13: Medium - Planning Steps (2-3)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b003-222222222223',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  3,
  'Day 13: Steps in Event Management Plan',
  'Learn planning steps and feasibility',
  3
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 14: Medium - Operational Planning (2-4)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b004-222222222224',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  4,
  'Day 14: Operational Planning',
  'Understand operational planning process',
  4
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 15: Hard - Budgets (2-5)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b005-222222222225',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  5,
  'Day 15: Finances and Budgets',
  'Learn budget planning and financial management',
  5
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 16: Medium - Sponsorship (2-6)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b006-222222222226',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  6,
  'Day 16: Sponsorship',
  'Learn sponsorship development',
  6
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 17: Easy - Team Organization (2-7)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b007-222222222227',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  7,
  'Day 17: Organize a Team',
  'Learn team organization',
  7
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 18: Hard - Venue Selection (2-8)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b008-222222222228',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  8,
  'Day 18: Blue Print of Functional Area',
  'Learn venue selection and site planning',
  8
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 19: Hard - Security and Risk (2-9)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b009-222222222229',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  9,
  'Day 19: Security and Risk Management',
  'Learn security planning and risk management',
  9
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 20: Medium - Marketing (2-10)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b010-222222222230',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  10,
  'Day 20: Marketing',
  'Learn event marketing strategies',
  10
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 21: Hard - Timeline (2-11)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b011-222222222231',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  11,
  'Day 21: Event Planning Timeline',
  'Learn event planning timeline',
  11
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 22: Medium - Post-Event (2-12)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b012-222222222232',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  12,
  'Day 22: Post-Event and Evaluation',
  'Learn post-event activities and evaluation',
  12
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Course 02 (1 lesson per day)
UPDATE course_lessons
SET week_id = 'b2a1b2c3-d4e5-4890-b001-222222222221', date = 'Day 11', display_order = 1
WHERE lesson_id = '2-1';

UPDATE course_lessons
SET week_id = 'b2a1b2c3-d4e5-4890-b002-222222222222', date = 'Day 12', display_order = 1
WHERE lesson_id = '2-2';

UPDATE course_lessons
SET week_id = 'b2a1b2c3-d4e5-4890-b003-222222222223', date = 'Day 13', display_order = 1
WHERE lesson_id = '2-3';

UPDATE course_lessons
SET week_id = 'b2a1b2c3-d4e5-4890-b004-222222222224', date = 'Day 14', display_order = 1
WHERE lesson_id = '2-4';

UPDATE course_lessons
SET week_id = 'b2a1b2c3-d4e5-4890-b005-222222222225', date = 'Day 15', display_order = 1
WHERE lesson_id = '2-5';

UPDATE course_lessons
SET week_id = 'b2a1b2c3-d4e5-4890-b006-222222222226', date = 'Day 16', display_order = 1
WHERE lesson_id = '2-6';

UPDATE course_lessons
SET week_id = 'b2a1b2c3-d4e5-4890-b007-222222222227', date = 'Day 17', display_order = 1
WHERE lesson_id = '2-7';

UPDATE course_lessons
SET week_id = 'b2a1b2c3-d4e5-4890-b008-222222222228', date = 'Day 18', display_order = 1
WHERE lesson_id = '2-8';

UPDATE course_lessons
SET week_id = 'b2a1b2c3-d4e5-4890-b009-222222222229', date = 'Day 19', display_order = 1
WHERE lesson_id = '2-9';

UPDATE course_lessons
SET week_id = 'b2a1b2c3-d4e5-4890-b010-222222222230', date = 'Day 20', display_order = 1
WHERE lesson_id = '2-10';

UPDATE course_lessons
SET week_id = 'b2a1b2c3-d4e5-4890-b011-222222222231', date = 'Day 21', display_order = 1
WHERE lesson_id = '2-11';

UPDATE course_lessons
SET week_id = 'b2a1b2c3-d4e5-4890-b012-222222222232', date = 'Day 22', display_order = 1
WHERE lesson_id = '2-12';

-- ============================================
-- COURSE 03: Different Aspects (13 days, 13 lessons)
-- 1 lesson per day, organized by difficulty
-- ============================================
DELETE FROM course_weeks WHERE course_id = 'e3f4a5b6-c7d8-4901-e234-567890123456';

-- Day 23: Hard - Stage Management Part 1 (3-1)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c001-333333333331',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  1,
  'Day 23: Stage Management',
  'Understand stage management responsibilities',
  1
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 24: Hard - Stage Management Part 2 (3-2)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c002-333333333332',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  2,
  'Day 24: Stage Manager Duties - Live Events',
  'Learn stage manager duties for live events',
  2
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 25: Medium - Brand Management (3-3)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c003-333333333333',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  3,
  'Day 25: Brand Management',
  'Learn about brand management fundamentals',
  3
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 26: Hard - Brand Value (3-4)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c004-333333333334',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  4,
  'Day 26: Components of Brand Value',
  'Understand brand value components',
  4
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 27: Hard - Brand Strategy (3-5)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c005-333333333335',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  5,
  'Day 27: Designing Brand Strategy',
  'Learn brand strategy design',
  5
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 28: Hard - Budgeting (3-6)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c006-333333333336',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  6,
  'Day 28: Budgeting in Event Management',
  'Learn budgeting fundamentals',
  6
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 29: Hard - Budget Development (3-7)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c007-333333333337',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  7,
  'Day 29: Criteria in Budget Development',
  'Learn budget development criteria',
  7
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 30: Hard - Budget Control (3-8)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c008-333333333338',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  8,
  'Day 30: Budget Control',
  'Learn budget control and performance monitoring',
  8
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 31: Medium - Leadership (3-9)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c009-333333333339',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  9,
  'Day 31: Leadership',
  'Understand leadership in event management',
  9
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 32: Medium - Leadership Skills (3-10)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c010-333333333340',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  10,
  'Day 32: Leadership Skills',
  'Learn leadership skills',
  10
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 33: Medium - Leadership Qualities (3-11)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c011-333333333341',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  11,
  'Day 33: Qualities of Leaders',
  'Learn leadership qualities',
  11
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 34: Medium - Event Success (3-12)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c012-333333333342',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  12,
  'Day 34: Success of the Event',
  'Understand event success metrics',
  12
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 35: Medium - Event Feedback (3-13)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c013-333333333343',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  13,
  'Day 35: Event Feedback',
  'Learn event feedback methods',
  13
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Course 03 (1 lesson per day)
UPDATE course_lessons
SET week_id = 'c3a1b2c3-d4e5-4901-c001-333333333331', date = 'Day 23', display_order = 1
WHERE lesson_id = '3-1';

UPDATE course_lessons
SET week_id = 'c3a1b2c3-d4e5-4901-c002-333333333332', date = 'Day 24', display_order = 1
WHERE lesson_id = '3-2';

UPDATE course_lessons
SET week_id = 'c3a1b2c3-d4e5-4901-c003-333333333333', date = 'Day 25', display_order = 1
WHERE lesson_id = '3-3';

UPDATE course_lessons
SET week_id = 'c3a1b2c3-d4e5-4901-c004-333333333334', date = 'Day 26', display_order = 1
WHERE lesson_id = '3-4';

UPDATE course_lessons
SET week_id = 'c3a1b2c3-d4e5-4901-c005-333333333335', date = 'Day 27', display_order = 1
WHERE lesson_id = '3-5';

UPDATE course_lessons
SET week_id = 'c3a1b2c3-d4e5-4901-c006-333333333336', date = 'Day 28', display_order = 1
WHERE lesson_id = '3-6';

UPDATE course_lessons
SET week_id = 'c3a1b2c3-d4e5-4901-c007-333333333337', date = 'Day 29', display_order = 1
WHERE lesson_id = '3-7';

UPDATE course_lessons
SET week_id = 'c3a1b2c3-d4e5-4901-c008-333333333338', date = 'Day 30', display_order = 1
WHERE lesson_id = '3-8';

UPDATE course_lessons
SET week_id = 'c3a1b2c3-d4e5-4901-c009-333333333339', date = 'Day 31', display_order = 1
WHERE lesson_id = '3-9';

UPDATE course_lessons
SET week_id = 'c3a1b2c3-d4e5-4901-c010-333333333340', date = 'Day 32', display_order = 1
WHERE lesson_id = '3-10';

UPDATE course_lessons
SET week_id = 'c3a1b2c3-d4e5-4901-c011-333333333341', date = 'Day 33', display_order = 1
WHERE lesson_id = '3-11';

UPDATE course_lessons
SET week_id = 'c3a1b2c3-d4e5-4901-c012-333333333342', date = 'Day 34', display_order = 1
WHERE lesson_id = '3-12';

UPDATE course_lessons
SET week_id = 'c3a1b2c3-d4e5-4901-c013-333333333343', date = 'Day 35', display_order = 1
WHERE lesson_id = '3-13';

-- ============================================
-- COURSE 04: Basic Qualities (7 days, 17 lessons)
-- Multiple lessons per day based on difficulty
-- Easy lessons: 2-3 per day, Hard lessons: 1 per day
-- ============================================
DELETE FROM course_weeks WHERE course_id = 'a4b5c6d7-e8f9-5012-f345-678901234567';

-- Day 36: Easy lessons (4-1, 4-2, 4-3) - 3 lessons
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d001-444444444441',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  1,
  'Day 36: Standards, Environment and Management Knowledge',
  'Understand standards, regulations, event environment and management knowledge',
  1
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 37: Medium lessons (4-4, 4-5) - 2 lessons
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d002-444444444442',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  2,
  'Day 37: Interpersonal Skills and Delegation',
  'Learn interpersonal skills and delegation',
  2
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 38: Medium lessons (4-6, 4-7, 4-8) - 3 lessons
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d003-444444444443',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  3,
  'Day 38: Communication, Feedback and Negotiation',
  'Learn communication, feedback and negotiation skills',
  3
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 39: Medium lessons (4-9, 4-10) - 2 lessons
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d004-444444444444',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  4,
  'Day 39: Leadership and Motivation',
  'Understand leadership and motivation',
  4
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 40: Hard lessons (4-11, 4-12) - 2 lessons
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d005-444444444445',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  5,
  'Day 40: Problem Solving and Team Management',
  'Learn problem-solving and team management',
  5
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 41: Medium lessons (4-13, 4-14) - 2 lessons
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d006-444444444446',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  6,
  'Day 41: Risk Management and Multitasking',
  'Learn risk management and multitasking',
  6
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 42: Easy/Medium lessons (4-15, 4-16, 4-17) - 3 lessons
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d007-444444444447',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  7,
  'Day 42: Decoration, Personal Etiquettes and Time Management',
  'Learn about decoration, etiquettes and time management',
  7
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Course 04 (multiple lessons per day)
UPDATE course_lessons
SET week_id = 'd4a1b2c3-d4e5-5012-d001-444444444441', date = 'Day 36', display_order = CASE WHEN lesson_id = '4-1' THEN 1 WHEN lesson_id = '4-2' THEN 2 WHEN lesson_id = '4-3' THEN 3 END
WHERE lesson_id IN ('4-1', '4-2', '4-3');

UPDATE course_lessons
SET week_id = 'd4a1b2c3-d4e5-5012-d002-444444444442', date = 'Day 37', display_order = CASE WHEN lesson_id = '4-4' THEN 1 WHEN lesson_id = '4-5' THEN 2 END
WHERE lesson_id IN ('4-4', '4-5');

UPDATE course_lessons
SET week_id = 'd4a1b2c3-d4e5-5012-d003-444444444443', date = 'Day 38', display_order = CASE WHEN lesson_id = '4-6' THEN 1 WHEN lesson_id = '4-7' THEN 2 WHEN lesson_id = '4-8' THEN 3 END
WHERE lesson_id IN ('4-6', '4-7', '4-8');

UPDATE course_lessons
SET week_id = 'd4a1b2c3-d4e5-5012-d004-444444444444', date = 'Day 39', display_order = CASE WHEN lesson_id = '4-9' THEN 1 WHEN lesson_id = '4-10' THEN 2 END
WHERE lesson_id IN ('4-9', '4-10');

UPDATE course_lessons
SET week_id = 'd4a1b2c3-d4e5-5012-d005-444444444445', date = 'Day 40', display_order = CASE WHEN lesson_id = '4-11' THEN 1 WHEN lesson_id = '4-12' THEN 2 END
WHERE lesson_id IN ('4-11', '4-12');

UPDATE course_lessons
SET week_id = 'd4a1b2c3-d4e5-5012-d006-444444444446', date = 'Day 41', display_order = CASE WHEN lesson_id = '4-13' THEN 1 WHEN lesson_id = '4-14' THEN 2 END
WHERE lesson_id IN ('4-13', '4-14');

UPDATE course_lessons
SET week_id = 'd4a1b2c3-d4e5-5012-d007-444444444447', date = 'Day 42', display_order = CASE WHEN lesson_id = '4-15' THEN 1 WHEN lesson_id = '4-16' THEN 2 WHEN lesson_id = '4-17' THEN 3 END
WHERE lesson_id IN ('4-15', '4-16', '4-17');

-- ============================================
-- COURSE 05: Various Event Activities (7 days, 14 lessons)
-- 2 lessons per day, organized by difficulty
-- ============================================
DELETE FROM course_weeks WHERE course_id = 'a5b6c7d8-e9f0-6123-a456-789012345678';

-- Day 43: Easy lessons (5-1, 5-2) - 2 lessons
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e001-555555555551',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  1,
  'Day 43: Types of Events and Corporate Events',
  'Understand different types of events and corporate events',
  1
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 44: Hard lesson (5-3) - 1 lesson (long content)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e002-555555555552',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  2,
  'Day 44: Conferences',
  'Learn about conference planning and management',
  2
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 45: Medium lessons (5-4, 5-5) - 2 lessons
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e003-555555555553',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  3,
  'Day 45: Exhibitions',
  'Learn about exhibitions and exhibition design',
  3
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 46: Easy lessons (5-6, 5-7) - 2 lessons
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e004-555555555554',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  4,
  'Day 46: Charity Events and Live Events',
  'Understand charity events and live event management',
  4
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 47: Hard lessons (5-8, 5-9) - 2 lessons
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e005-555555555555',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  5,
  'Day 47: Sports Events',
  'Learn about sports event planning and management',
  5
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 48: Medium lessons (5-10, 5-11, 5-12) - 3 lessons
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e006-555555555556',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  6,
  'Day 48: Greening Events and Festivals',
  'Learn about greening events and festival planning',
  6
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Day 49: Medium lessons (5-13, 5-14) - 2 lessons
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e007-555555555557',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  7,
  'Day 49: India as Destination and ITPO',
  'Learn about India as MICE destination and role of ITPO',
  7
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Course 05 (2 lessons per day)
UPDATE course_lessons
SET week_id = 'e5a1b2c3-d4e5-6123-e001-555555555551', date = 'Day 43', display_order = CASE WHEN lesson_id = '5-1' THEN 1 WHEN lesson_id = '5-2' THEN 2 END
WHERE lesson_id IN ('5-1', '5-2');

UPDATE course_lessons
SET week_id = 'e5a1b2c3-d4e5-6123-e002-555555555552', date = 'Day 44', display_order = 1
WHERE lesson_id = '5-3';

UPDATE course_lessons
SET week_id = 'e5a1b2c3-d4e5-6123-e003-555555555553', date = 'Day 45', display_order = CASE WHEN lesson_id = '5-4' THEN 1 WHEN lesson_id = '5-5' THEN 2 END
WHERE lesson_id IN ('5-4', '5-5');

UPDATE course_lessons
SET week_id = 'e5a1b2c3-d4e5-6123-e004-555555555554', date = 'Day 46', display_order = CASE WHEN lesson_id = '5-6' THEN 1 WHEN lesson_id = '5-7' THEN 2 END
WHERE lesson_id IN ('5-6', '5-7');

UPDATE course_lessons
SET week_id = 'e5a1b2c3-d4e5-6123-e005-555555555555', date = 'Day 47', display_order = CASE WHEN lesson_id = '5-8' THEN 1 WHEN lesson_id = '5-9' THEN 2 END
WHERE lesson_id IN ('5-8', '5-9');

UPDATE course_lessons
SET week_id = 'e5a1b2c3-d4e5-6123-e006-555555555556', date = 'Day 48', display_order = CASE WHEN lesson_id = '5-10' THEN 1 WHEN lesson_id = '5-11' THEN 2 WHEN lesson_id = '5-12' THEN 3 END
WHERE lesson_id IN ('5-10', '5-11', '5-12');

UPDATE course_lessons
SET week_id = 'e5a1b2c3-d4e5-6123-e007-555555555557', date = 'Day 49', display_order = CASE WHEN lesson_id = '5-13' THEN 1 WHEN lesson_id = '5-14' THEN 2 END
WHERE lesson_id IN ('5-13', '5-14');

-- ============================================
-- Helper Functions
-- ============================================

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

-- Function to check if course is accessible
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

-- Function to get lessons for a specific day
CREATE OR REPLACE FUNCTION get_lessons_for_day(check_day INTEGER)
RETURNS TABLE (
  lesson_id TEXT,
  course_id UUID,
  course_title TEXT,
  week_id UUID,
  topic TEXT,
  date TEXT,
  content TEXT,
  key_concepts TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cl.lesson_id,
    c.id as course_id,
    c.title as course_title,
    cl.week_id,
    cl.topic,
    cl.date,
    cl.content,
    cl.key_concepts
  FROM course_lessons cl
  JOIN course_weeks cw ON cw.id = cl.week_id
  JOIN courses c ON c.id = cw.course_id
  JOIN course_schedule cs ON cs.course_id = c.id
  WHERE cs.is_active = true
    AND check_day >= cs.start_day
    AND check_day <= cs.end_day
    AND cl.date LIKE '%Day ' || check_day::TEXT || '%'
  ORDER BY cl.display_order;
END;
$$ LANGUAGE plpgsql;

