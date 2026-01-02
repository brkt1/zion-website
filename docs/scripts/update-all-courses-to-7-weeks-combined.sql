-- Update All 5 Courses to Combined 7-Week Structure
-- This SQL reorganizes all courses into a single 7-week program
-- Run this after inserting the initial course data

-- ============================================
-- Delete existing weeks for all courses
-- ============================================
DELETE FROM course_weeks WHERE course_id IN (
  'a1b2c3d4-e5f6-4789-a012-345678901234', -- Course 01
  'c2d3e4f5-a6b7-4890-c123-456789012345', -- Course 02
  'e3f4a5b6-c7d8-4901-e234-567890123456', -- Course 03
  'a4b5c6d7-e8f9-5012-f345-678901234567', -- Course 04
  'a5b6c7d8-e9f0-6123-a456-789012345678'  -- Course 05
);

-- ============================================
-- WEEK 1: Introduction and Fundamentals
-- ============================================
-- Course 01: Lessons 1.1, 1.2 (Introduction, Definitions)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a001-111111111111',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  1,
  'Introduction to Events and Definitions',
  'Understand what events are and learn various definitions of events',
  1
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Course 02: Lesson 2.1 (Event Planning Introduction)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b001-222222222221',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  1,
  'Event Planning Introduction',
  'Understand event planning process and its benefits',
  1
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Week 1
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a001-111111111111', date = 'Week 1' 
WHERE lesson_id IN ('1-1', '1-2') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234');

UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b001-222222222221', date = 'Week 1' 
WHERE lesson_id = '2-1' AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'c2d3e4f5-a6b7-4890-c123-456789012345');

-- ============================================
-- WEEK 2: Classification and Planning
-- ============================================
-- Course 01: Lessons 1.3, 1.4 (Classification, Types)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a002-111111111112',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  2,
  'Classification and Types of Events',
  'Learn about different categories and types of events',
  2
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Course 02: Lessons 2.2, 2.3 (Environmental Factors, Planning Steps)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b002-222222222222',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  2,
  'Environmental Factors and Planning Steps',
  'Learn about PESTEL analysis and planning steps',
  2
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Course 04: Lessons 4.1, 4.2 (Standards, Environment)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d001-444444444441',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  2,
  'Standards, Regulations and Event Environment',
  'Understand standards, regulations and event environment',
  2
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Week 2
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a002-111111111112', date = 'Week 2' 
WHERE lesson_id IN ('1-3', '1-4') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234');

UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b002-222222222222', date = 'Week 2' 
WHERE lesson_id IN ('2-2', '2-3') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'c2d3e4f5-a6b7-4890-c123-456789012345');

UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d001-444444444441', date = 'Week 2' 
WHERE lesson_id IN ('4-1', '4-2') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a4b5c6d7-e8f9-5012-f345-678901234567');

-- ============================================
-- WEEK 3: Strategy, Benefits and Operations
-- ============================================
-- Course 01: Lessons 1.5, 1.6 (Benefits, Strategy)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a003-111111111113',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  3,
  'Benefits of Events and Event Management Strategy',
  'Understand benefits of hosting events and event management strategies',
  3
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Course 02: Lessons 2.4, 2.5 (Operational Planning, Budgets)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b003-222222222223',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  3,
  'Operational Planning and Budgets',
  'Understand operational planning and budget management',
  3
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Course 03: Lessons 3.1, 3.2 (Stage Management)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c001-333333333331',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  3,
  'Stage Management',
  'Understand stage management responsibilities and duties',
  3
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Week 3
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a003-111111111113', date = 'Week 3' 
WHERE lesson_id IN ('1-5', '1-6') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234');

UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b003-222222222223', date = 'Week 3' 
WHERE lesson_id IN ('2-4', '2-5') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'c2d3e4f5-a6b7-4890-c123-456789012345');

UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c001-333333333331', date = 'Week 3' 
WHERE lesson_id IN ('3-1', '3-2') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'e3f4a5b6-c7d8-4901-e234-567890123456');

-- ============================================
-- WEEK 4: Objectives, Creativity, Branding and Skills
-- ============================================
-- Course 01: Lessons 1.7, 1.8 (Objectives, Creativity)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a004-111111111114',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  4,
  'Objectives and Role of Creativity',
  'Learn SMART objectives and role of creativity in event management',
  4
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Course 02: Lessons 2.6, 2.7 (Sponsorship, Team)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b004-222222222224',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  4,
  'Sponsorship and Team Organization',
  'Learn sponsorship development and team organization',
  4
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Course 03: Lessons 3.3, 3.4, 3.5 (Brand Management)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c002-333333333332',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  4,
  'Brand Management',
  'Learn about brand management, value components and strategy',
  4
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Course 04: Lessons 4.3, 4.4 (Management Knowledge, Interpersonal)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d002-444444444442',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  4,
  'Management Knowledge and Interpersonal Skills',
  'Learn general management knowledge and interpersonal skills',
  4
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Week 4
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a004-111111111114', date = 'Week 4' 
WHERE lesson_id IN ('1-7', '1-8') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234');

UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b004-222222222224', date = 'Week 4' 
WHERE lesson_id IN ('2-6', '2-7') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'c2d3e4f5-a6b7-4890-c123-456789012345');

UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c002-333333333332', date = 'Week 4' 
WHERE lesson_id IN ('3-3', '3-4', '3-5') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'e3f4a5b6-c7d8-4901-e234-567890123456');

UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d002-444444444442', date = 'Week 4' 
WHERE lesson_id IN ('4-3', '4-4') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a4b5c6d7-e8f9-5012-f345-678901234567');

-- ============================================
-- WEEK 5: Functions, Budgeting, Leadership and Communication
-- ============================================
-- Course 01: Lessons 1.9, 1.10 (Committee, Functions)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a005-111111111115',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  5,
  'Event Committee and Functions',
  'Understand event committee structure and event management functions',
  5
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Course 02: Lessons 2.8, 2.9 (Venue, Security)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b005-222222222225',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  5,
  'Venue Selection and Security',
  'Learn about venue selection, security and risk management',
  5
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Course 03: Lessons 3.6, 3.7, 3.8 (Budgeting)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c003-333333333333',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  5,
  'Budgeting in Event Management',
  'Learn budgeting fundamentals, development and control',
  5
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Course 04: Lessons 4.5, 4.6, 4.7, 4.8 (Delegation, Communication)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d003-444444444443',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  5,
  'Delegation and Communication',
  'Learn effective delegation and communication skills',
  5
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Course 05: Lessons 5.1, 5.2 (Types, Corporate Events)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e001-555555555551',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  5,
  'Types of Events and Corporate Events',
  'Understand different types of events and corporate events',
  5
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Week 5
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a005-111111111115', date = 'Week 5' 
WHERE lesson_id IN ('1-9', '1-10') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234');

UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b005-222222222225', date = 'Week 5' 
WHERE lesson_id IN ('2-8', '2-9') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'c2d3e4f5-a6b7-4890-c123-456789012345');

UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c003-333333333333', date = 'Week 5' 
WHERE lesson_id IN ('3-6', '3-7', '3-8') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'e3f4a5b6-c7d8-4901-e234-567890123456');

UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d003-444444444443', date = 'Week 5' 
WHERE lesson_id IN ('4-5', '4-6', '4-7', '4-8') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a4b5c6d7-e8f9-5012-f345-678901234567');

UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-e001-555555555551', date = 'Week 5' 
WHERE lesson_id IN ('5-1', '5-2') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a5b6c7d8-e9f0-6123-a456-789012345678');

-- ============================================
-- WEEK 6: Leadership, Skills and Event Types
-- ============================================
-- Course 02: Lessons 2.10, 2.11 (Marketing, Timeline)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b006-222222222226',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  6,
  'Marketing and Event Timeline',
  'Learn event marketing and planning timeline',
  6
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Course 03: Lessons 3.9, 3.10, 3.11 (Leadership)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c004-333333333334',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  6,
  'Leadership in Event Management',
  'Understand leadership concepts, skills and qualities',
  6
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Course 04: Lessons 4.9, 4.10, 4.11, 4.12 (Leadership, Motivation, Problem Solving)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d004-444444444444',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  6,
  'Leadership, Motivation and Problem Solving',
  'Understand leadership, motivation and problem-solving techniques',
  6
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Course 05: Lessons 5.3, 5.4, 5.5 (Conferences, Exhibitions)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e002-555555555552',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  6,
  'Conferences and Exhibitions',
  'Learn about conference planning and exhibitions',
  6
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Week 6
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b006-222222222226', date = 'Week 6' 
WHERE lesson_id IN ('2-10', '2-11') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'c2d3e4f5-a6b7-4890-c123-456789012345');

UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c004-333333333334', date = 'Week 6' 
WHERE lesson_id IN ('3-9', '3-10', '3-11') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'e3f4a5b6-c7d8-4901-e234-567890123456');

UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d004-444444444444', date = 'Week 6' 
WHERE lesson_id IN ('4-9', '4-10', '4-11', '4-12') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a4b5c6d7-e8f9-5012-f345-678901234567');

UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-e002-555555555552', date = 'Week 6' 
WHERE lesson_id IN ('5-3', '5-4', '5-5') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a5b6c7d8-e9f0-6123-a456-789012345678');

-- ============================================
-- WEEK 7: Success, Skills, Events and Review
-- ============================================
-- Course 02: Lesson 2.12 (Post-Event)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b007-222222222227',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  7,
  'Post-Event Evaluation',
  'Learn post-event activities and evaluation',
  7
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Course 03: Lessons 3.12, 3.13 (Success, Feedback)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c005-333333333335',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  7,
  'Event Success and Feedback',
  'Learn about event success metrics and feedback methods',
  7
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Course 04: Lessons 4.13, 4.14, 4.15, 4.16, 4.17 (Risk, Multitasking, Decoration, Etiquette, Time)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d005-444444444445',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  7,
  'Risk Management, Multitasking, Decoration and Etiquettes',
  'Learn risk management, multitasking, decoration and personal etiquettes',
  7
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Course 05: Lessons 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.12, 5.13, 5.14 (All remaining)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e003-555555555553',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  7,
  'Charity, Live, Sports Events, Festivals and ITPO',
  'Learn about charity events, live events, sports events, festivals and ITPO',
  7
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Week 7
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b007-222222222227', date = 'Week 7' 
WHERE lesson_id = '2-12' AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'c2d3e4f5-a6b7-4890-c123-456789012345');

UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c005-333333333335', date = 'Week 7' 
WHERE lesson_id IN ('3-12', '3-13') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'e3f4a5b6-c7d8-4901-e234-567890123456');

UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d005-444444444445', date = 'Week 7' 
WHERE lesson_id IN ('4-13', '4-14', '4-15', '4-16', '4-17') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a4b5c6d7-e8f9-5012-f345-678901234567');

UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-e003-555555555553', date = 'Week 7' 
WHERE lesson_id IN ('5-6', '5-7', '5-8', '5-9', '5-10', '5-11', '5-12', '5-13', '5-14') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a5b6c7d8-e9f0-6123-a456-789012345678');

