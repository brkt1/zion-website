-- Update Course Weeks and Lessons to Balanced 7-Week Schedule
-- Course 01: Days 1-10 (10 days, 10 lessons - 1 per day)
-- Course 02: Days 11-20 (10 days, 12 lessons - distributed)
-- Course 03: Days 21-30 (10 days, 13 lessons - distributed)
-- Course 04: Days 31-40 (10 days, 17 lessons - distributed)
-- Course 05: Days 41-49 (9 days, 14 lessons - distributed)

-- ============================================
-- COURSE 01: Introduction to Event Management
-- Days 1-10 (10 days, 10 lessons - 1 lesson per day)
-- ============================================

-- Delete existing weeks for Course 01
DELETE FROM course_weeks WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234';

-- Create weeks for Course 01 (1 week = 1 day)
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES 
  ('a1a1b2c3-d4e5-4789-a001-111111111111', 'a1b2c3d4-e5f6-4789-a012-345678901234', 1, 'Day 1: Introduction to Events', 'Understand what events are and their importance', 1),
  ('a1a1b2c3-d4e5-4789-a002-111111111112', 'a1b2c3d4-e5f6-4789-a012-345678901234', 2, 'Day 2: Definitions of Events', 'Learn various definitions of events', 2),
  ('a1a1b2c3-d4e5-4789-a003-111111111113', 'a1b2c3d4-e5f6-4789-a012-345678901234', 3, 'Day 3: Classification of Events', 'Learn about different categories of events', 3),
  ('a1a1b2c3-d4e5-4789-a004-111111111114', 'a1b2c3d4-e5f6-4789-a012-345678901234', 4, 'Day 4: Types of Events', 'Understand different types of events', 4),
  ('a1a1b2c3-d4e5-4789-a005-111111111115', 'a1b2c3d4-e5f6-4789-a012-345678901234', 5, 'Day 5: Benefits of Events', 'Understand benefits of hosting events', 5),
  ('a1a1b2c3-d4e5-4789-a006-111111111116', 'a1b2c3d4-e5f6-4789-a012-345678901234', 6, 'Day 6: Event Management Strategy', 'Learn event management strategies', 6),
  ('a1a1b2c3-d4e5-4789-a007-111111111117', 'a1b2c3d4-e5f6-4789-a012-345678901234', 7, 'Day 7: Objectives of Event Management', 'Learn SMART objectives', 7),
  ('a1a1b2c3-d4e5-4789-a008-111111111118', 'a1b2c3d4-e5f6-4789-a012-345678901234', 8, 'Day 8: Role of Creativity', 'Understand role of creativity in events', 8),
  ('a1a1b2c3-d4e5-4789-a009-111111111119', 'a1b2c3d4-e5f6-4789-a012-345678901234', 9, 'Day 9: Event Committee', 'Learn about event committee structure', 9),
  ('a1a1b2c3-d4e5-4789-a010-111111111120', 'a1b2c3d4-e5f6-4789-a012-345678901234', 10, 'Day 10: Functions of Event Management', 'Understand all functions of event management', 10)
ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Course 01 (1 lesson per day)
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a001-111111111111', date = 'Day 1', display_order = 1 WHERE lesson_id = '1-1';
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a002-111111111112', date = 'Day 2', display_order = 1 WHERE lesson_id = '1-2';
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a003-111111111113', date = 'Day 3', display_order = 1 WHERE lesson_id = '1-3';
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a004-111111111114', date = 'Day 4', display_order = 1 WHERE lesson_id = '1-4';
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a005-111111111115', date = 'Day 5', display_order = 1 WHERE lesson_id = '1-5';
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a006-111111111116', date = 'Day 6', display_order = 1 WHERE lesson_id = '1-6';
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a007-111111111117', date = 'Day 7', display_order = 1 WHERE lesson_id = '1-7';
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a008-111111111118', date = 'Day 8', display_order = 1 WHERE lesson_id = '1-8';
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a009-111111111119', date = 'Day 9', display_order = 1 WHERE lesson_id = '1-9';
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a010-111111111120', date = 'Day 10', display_order = 1 WHERE lesson_id = '1-10';

-- ============================================
-- COURSE 02: Event Management Planning
-- Days 11-20 (10 days, 12 lessons - distributed)
-- Distribution: Days 11-19 have 1 lesson each, Day 20 has 3 lessons
-- ============================================

DELETE FROM course_weeks WHERE course_id = 'c2d3e4f5-a6b7-4890-c123-456789012345';

INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES 
  ('b2a1b2c3-d4e5-4890-b001-222222222221', 'c2d3e4f5-a6b7-4890-c123-456789012345', 1, 'Day 11: Event Planning Introduction', 'Understand event planning process', 1),
  ('b2a1b2c3-d4e5-4890-b002-222222222222', 'c2d3e4f5-a6b7-4890-c123-456789012345', 2, 'Day 12: Forces Affecting Event Planning', 'Learn PESTEL analysis and environmental factors', 2),
  ('b2a1b2c3-d4e5-4890-b003-222222222223', 'c2d3e4f5-a6b7-4890-c123-456789012345', 3, 'Day 13: Steps in Event Management Plan', 'Learn planning steps and feasibility', 3),
  ('b2a1b2c3-d4e5-4890-b004-222222222224', 'c2d3e4f5-a6b7-4890-c123-456789012345', 4, 'Day 14: Operational Planning', 'Understand operational planning process', 4),
  ('b2a1b2c3-d4e5-4890-b005-222222222225', 'c2d3e4f5-a6b7-4890-c123-456789012345', 5, 'Day 15: Finances and Budgets', 'Learn budget planning and financial management', 5),
  ('b2a1b2c3-d4e5-4890-b006-222222222226', 'c2d3e4f5-a6b7-4890-c123-456789012345', 6, 'Day 16: Sponsorship', 'Learn sponsorship development', 6),
  ('b2a1b2c3-d4e5-4890-b007-222222222227', 'c2d3e4f5-a6b7-4890-c123-456789012345', 7, 'Day 17: Organize a Team', 'Learn team organization', 7),
  ('b2a1b2c3-d4e5-4890-b008-222222222228', 'c2d3e4f5-a6b7-4890-c123-456789012345', 8, 'Day 18: Blue Print of Functional Area', 'Learn venue selection and site planning', 8),
  ('b2a1b2c3-d4e5-4890-b009-222222222229', 'c2d3e4f5-a6b7-4890-c123-456789012345', 9, 'Day 19: Security and Risk Management', 'Learn security planning and risk management', 9),
  ('b2a1b2c3-d4e5-4890-b010-222222222230', 'c2d3e4f5-a6b7-4890-c123-456789012345', 10, 'Day 20: Marketing, Timeline and Post-Event', 'Learn event marketing, timeline and post-event activities', 10)
ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Course 02
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b001-222222222221', date = 'Day 11', display_order = 1 WHERE lesson_id = '2-1';
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b002-222222222222', date = 'Day 12', display_order = 1 WHERE lesson_id = '2-2';
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b003-222222222223', date = 'Day 13', display_order = 1 WHERE lesson_id = '2-3';
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b004-222222222224', date = 'Day 14', display_order = 1 WHERE lesson_id = '2-4';
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b005-222222222225', date = 'Day 15', display_order = 1 WHERE lesson_id = '2-5';
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b006-222222222226', date = 'Day 16', display_order = 1 WHERE lesson_id = '2-6';
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b007-222222222227', date = 'Day 17', display_order = 1 WHERE lesson_id = '2-7';
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b008-222222222228', date = 'Day 18', display_order = 1 WHERE lesson_id = '2-8';
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b009-222222222229', date = 'Day 19', display_order = 1 WHERE lesson_id = '2-9';
-- Day 20 has 3 lessons (2-10, 2-11, 2-12)
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b010-222222222230', date = 'Day 20', display_order = CASE 
  WHEN lesson_id = '2-10' THEN 1 
  WHEN lesson_id = '2-11' THEN 2 
  WHEN lesson_id = '2-12' THEN 3 
END WHERE lesson_id IN ('2-10', '2-11', '2-12');

-- ============================================
-- COURSE 03: Different Aspects of Event Management
-- Days 21-30 (10 days, 13 lessons - distributed)
-- Distribution: Days 21-27 have 1 lesson each, Days 28-30 have 2 lessons each
-- ============================================

DELETE FROM course_weeks WHERE course_id = 'e3f4a5b6-c7d8-4901-e234-567890123456';

INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES 
  ('c3a1b2c3-d4e5-4901-c001-333333333331', 'e3f4a5b6-c7d8-4901-e234-567890123456', 1, 'Day 21: Stage Management', 'Understand stage management responsibilities', 1),
  ('c3a1b2c3-d4e5-4901-c002-333333333332', 'e3f4a5b6-c7d8-4901-e234-567890123456', 2, 'Day 22: Stage Manager Duties - Live Events', 'Learn stage manager duties for live events', 2),
  ('c3a1b2c3-d4e5-4901-c003-333333333333', 'e3f4a5b6-c7d8-4901-e234-567890123456', 3, 'Day 23: Brand Management', 'Learn about brand management fundamentals', 3),
  ('c3a1b2c3-d4e5-4901-c004-333333333334', 'e3f4a5b6-c7d8-4901-e234-567890123456', 4, 'Day 24: Components of Brand Value', 'Understand brand value components', 4),
  ('c3a1b2c3-d4e5-4901-c005-333333333335', 'e3f4a5b6-c7d8-4901-e234-567890123456', 5, 'Day 25: Designing Brand Strategy', 'Learn brand strategy design', 5),
  ('c3a1b2c3-d4e5-4901-c006-333333333336', 'e3f4a5b6-c7d8-4901-e234-567890123456', 6, 'Day 26: Budgeting in Event Management', 'Learn budgeting fundamentals', 6),
  ('c3a1b2c3-d4e5-4901-c007-333333333337', 'e3f4a5b6-c7d8-4901-e234-567890123456', 7, 'Day 27: Criteria in Budget Development', 'Learn budget development criteria', 7),
  ('c3a1b2c3-d4e5-4901-c008-333333333338', 'e3f4a5b6-c7d8-4901-e234-567890123456', 8, 'Day 28: Budget Control and Leadership', 'Learn budget control and leadership basics', 8),
  ('c3a1b2c3-d4e5-4901-c009-333333333339', 'e3f4a5b6-c7d8-4901-e234-567890123456', 9, 'Day 29: Leadership Skills and Qualities', 'Learn leadership skills and qualities', 9),
  ('c3a1b2c3-d4e5-4901-c010-333333333340', 'e3f4a5b6-c7d8-4901-e234-567890123456', 10, 'Day 30: Event Success and Feedback', 'Understand event success metrics and feedback methods', 10)
ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Course 03
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c001-333333333331', date = 'Day 21', display_order = 1 WHERE lesson_id = '3-1';
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c002-333333333332', date = 'Day 22', display_order = 1 WHERE lesson_id = '3-2';
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c003-333333333333', date = 'Day 23', display_order = 1 WHERE lesson_id = '3-3';
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c004-333333333334', date = 'Day 24', display_order = 1 WHERE lesson_id = '3-4';
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c005-333333333335', date = 'Day 25', display_order = 1 WHERE lesson_id = '3-5';
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c006-333333333336', date = 'Day 26', display_order = 1 WHERE lesson_id = '3-6';
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c007-333333333337', date = 'Day 27', display_order = 1 WHERE lesson_id = '3-7';
-- Day 28 has 2 lessons (3-8, 3-9)
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c008-333333333338', date = 'Day 28', display_order = CASE 
  WHEN lesson_id = '3-8' THEN 1 
  WHEN lesson_id = '3-9' THEN 2 
END WHERE lesson_id IN ('3-8', '3-9');
-- Day 29 has 2 lessons (3-10, 3-11)
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c009-333333333339', date = 'Day 29', display_order = CASE 
  WHEN lesson_id = '3-10' THEN 1 
  WHEN lesson_id = '3-11' THEN 2 
END WHERE lesson_id IN ('3-10', '3-11');
-- Day 30 has 2 lessons (3-12, 3-13)
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c010-333333333340', date = 'Day 30', display_order = CASE 
  WHEN lesson_id = '3-12' THEN 1 
  WHEN lesson_id = '3-13' THEN 2 
END WHERE lesson_id IN ('3-12', '3-13');

-- ============================================
-- COURSE 04: Basic Qualities of Event Management Person
-- Days 31-40 (10 days, 17 lessons - distributed)
-- Distribution: Days 31-33 have 2 lessons each, Days 34-40 have 2-3 lessons each
-- ============================================

DELETE FROM course_weeks WHERE course_id = 'a4b5c6d7-e8f9-5012-f345-678901234567';

INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES 
  ('d4a1b2c3-d4e5-5012-d001-444444444441', 'a4b5c6d7-e8f9-5012-f345-678901234567', 1, 'Day 31: Standards, Environment and Management Knowledge', 'Understand standards, regulations, event environment and management knowledge', 1),
  ('d4a1b2c3-d4e5-5012-d002-444444444442', 'a4b5c6d7-e8f9-5012-f345-678901234567', 2, 'Day 32: Interpersonal Skills and Delegation', 'Learn interpersonal skills and delegation', 2),
  ('d4a1b2c3-d4e5-5012-d003-444444444443', 'a4b5c6d7-e8f9-5012-f345-678901234567', 3, 'Day 33: Communication, Feedback and Negotiation', 'Learn communication, feedback and negotiation skills', 3),
  ('d4a1b2c3-d4e5-5012-d004-444444444444', 'a4b5c6d7-e8f9-5012-f345-678901234567', 4, 'Day 34: Leadership and Motivation', 'Understand leadership and motivation', 4),
  ('d4a1b2c3-d4e5-5012-d005-444444444445', 'a4b5c6d7-e8f9-5012-f345-678901234567', 5, 'Day 35: Problem Solving and Team Management', 'Learn problem-solving and team management', 5),
  ('d4a1b2c3-d4e5-5012-d006-444444444446', 'a4b5c6d7-e8f9-5012-f345-678901234567', 6, 'Day 36: Risk Management and Multitasking', 'Learn risk management and multitasking', 6),
  ('d4a1b2c3-d4e5-5012-d007-444444444447', 'a4b5c6d7-e8f9-5012-f345-678901234567', 7, 'Day 37: Risk Management and Multitasking', 'Learn risk management and multitasking', 7),
  ('d4a1b2c3-d4e5-5012-d008-444444444448', 'a4b5c6d7-e8f9-5012-f345-678901234567', 8, 'Day 38: Decoration', 'Learn about decoration in events', 8),
  ('d4a1b2c3-d4e5-5012-d009-444444444449', 'a4b5c6d7-e8f9-5012-f345-678901234567', 9, 'Day 39: Personal Etiquettes', 'Learn personal etiquettes for event management', 9),
  ('d4a1b2c3-d4e5-5012-d010-444444444450', 'a4b5c6d7-e8f9-5012-f345-678901234567', 10, 'Day 40: Time Management', 'Learn time management skills', 10)
ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Course 04 (17 lessons over 10 days)
-- Distribution: Days 31-37 have 2 lessons each (14 lessons), Days 38-40 have 1 lesson each (3 lessons) = 17 total
-- Day 31: 2 lessons (4-1, 4-2)
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d001-444444444441', date = 'Day 31', display_order = CASE 
  WHEN lesson_id = '4-1' THEN 1 
  WHEN lesson_id = '4-2' THEN 2 
END WHERE lesson_id IN ('4-1', '4-2');
-- Day 32: 2 lessons (4-3, 4-4)
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d002-444444444442', date = 'Day 32', display_order = CASE 
  WHEN lesson_id = '4-3' THEN 1 
  WHEN lesson_id = '4-4' THEN 2 
END WHERE lesson_id IN ('4-3', '4-4');
-- Day 33: 2 lessons (4-5, 4-6)
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d003-444444444443', date = 'Day 33', display_order = CASE 
  WHEN lesson_id = '4-5' THEN 1 
  WHEN lesson_id = '4-6' THEN 2 
END WHERE lesson_id IN ('4-5', '4-6');
-- Day 34: 2 lessons (4-7, 4-8)
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d004-444444444444', date = 'Day 34', display_order = CASE 
  WHEN lesson_id = '4-7' THEN 1 
  WHEN lesson_id = '4-8' THEN 2 
END WHERE lesson_id IN ('4-7', '4-8');
-- Day 35: 2 lessons (4-9, 4-10)
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d005-444444444445', date = 'Day 35', display_order = CASE 
  WHEN lesson_id = '4-9' THEN 1 
  WHEN lesson_id = '4-10' THEN 2 
END WHERE lesson_id IN ('4-9', '4-10');
-- Day 36: 2 lessons (4-11, 4-12)
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d006-444444444446', date = 'Day 36', display_order = CASE 
  WHEN lesson_id = '4-11' THEN 1 
  WHEN lesson_id = '4-12' THEN 2 
END WHERE lesson_id IN ('4-11', '4-12');
-- Day 37: 2 lessons (4-13, 4-14)
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d007-444444444447', date = 'Day 37', display_order = CASE 
  WHEN lesson_id = '4-13' THEN 1 
  WHEN lesson_id = '4-14' THEN 2 
END WHERE lesson_id IN ('4-13', '4-14');
-- Day 38: 1 lesson (4-15)
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d008-444444444448', date = 'Day 38', display_order = 1 WHERE lesson_id = '4-15';
-- Day 39: 1 lesson (4-16)
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d009-444444444449', date = 'Day 39', display_order = 1 WHERE lesson_id = '4-16';
-- Day 40: 1 lesson (4-17)
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d010-444444444450', date = 'Day 40', display_order = 1 WHERE lesson_id = '4-17';

-- ============================================
-- COURSE 05: Various Event Activities
-- Days 41-49 (9 days, 14 lessons - distributed)
-- Distribution: Days 41-47 have 2 lessons each, Days 48-49 have 1 lesson each
-- ============================================

DELETE FROM course_weeks WHERE course_id = 'a5b6c7d8-e9f0-6123-a456-789012345678';

INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES 
  ('e5a1b2c3-d4e5-6123-e001-555555555551', 'a5b6c7d8-e9f0-6123-a456-789012345678', 1, 'Day 41: Types of Events and Corporate Events', 'Understand different types of events and corporate events', 1),
  ('e5a1b2c3-d4e5-6123-e002-555555555552', 'a5b6c7d8-e9f0-6123-a456-789012345678', 2, 'Day 42: Conferences', 'Learn about conference planning and management', 2),
  ('e5a1b2c3-d4e5-6123-e003-555555555553', 'a5b6c7d8-e9f0-6123-a456-789012345678', 3, 'Day 43: Exhibitions', 'Learn about exhibitions and exhibition design', 3),
  ('e5a1b2c3-d4e5-6123-e004-555555555554', 'a5b6c7d8-e9f0-6123-a456-789012345678', 4, 'Day 44: Charity Events and Live Events', 'Understand charity events and live event management', 4),
  ('e5a1b2c3-d4e5-6123-e005-555555555555', 'a5b6c7d8-e9f0-6123-a456-789012345678', 5, 'Day 45: Sports Events', 'Learn about sports event planning and management', 5),
  ('e5a1b2c3-d4e5-6123-e006-555555555556', 'a5b6c7d8-e9f0-6123-a456-789012345678', 6, 'Day 46: Greening Events and Festivals', 'Learn about greening events and festival planning', 6),
  ('e5a1b2c3-d4e5-6123-e007-555555555557', 'a5b6c7d8-e9f0-6123-a456-789012345678', 7, 'Day 47: India as Destination and ITPO', 'Learn about India as MICE destination and role of ITPO', 7),
  ('e5a1b2c3-d4e5-6123-e008-555555555558', 'a5b6c7d8-e9f0-6123-a456-789012345678', 8, 'Day 48: Review and Integration', 'Review all event activities and integrate concepts', 8),
  ('e5a1b2c3-d4e5-6123-e009-555555555559', 'a5b6c7d8-e9f0-6123-a456-789012345678', 9, 'Day 49: Final Assessment Preparation', 'Prepare for final assessment and course completion', 9)
ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Course 05
-- Day 41: 2 lessons (5-1, 5-2)
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-e001-555555555551', date = 'Day 41', display_order = CASE 
  WHEN lesson_id = '5-1' THEN 1 
  WHEN lesson_id = '5-2' THEN 2 
END WHERE lesson_id IN ('5-1', '5-2');
-- Day 42: 2 lessons (5-3, 5-4)
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-e002-555555555552', date = 'Day 42', display_order = CASE 
  WHEN lesson_id = '5-3' THEN 1 
  WHEN lesson_id = '5-4' THEN 2 
END WHERE lesson_id IN ('5-3', '5-4');
-- Day 43: 2 lessons (5-5, 5-6)
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-e003-555555555553', date = 'Day 43', display_order = CASE 
  WHEN lesson_id = '5-5' THEN 1 
  WHEN lesson_id = '5-6' THEN 2 
END WHERE lesson_id IN ('5-5', '5-6');
-- Day 44: 2 lessons (5-7, 5-8)
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-e004-555555555554', date = 'Day 44', display_order = CASE 
  WHEN lesson_id = '5-7' THEN 1 
  WHEN lesson_id = '5-8' THEN 2 
END WHERE lesson_id IN ('5-7', '5-8');
-- Day 45: 2 lessons (5-9, 5-10)
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-e005-555555555555', date = 'Day 45', display_order = CASE 
  WHEN lesson_id = '5-9' THEN 1 
  WHEN lesson_id = '5-10' THEN 2 
END WHERE lesson_id IN ('5-9', '5-10');
-- Day 46: 2 lessons (5-11, 5-12)
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-e006-555555555556', date = 'Day 46', display_order = CASE 
  WHEN lesson_id = '5-11' THEN 1 
  WHEN lesson_id = '5-12' THEN 2 
END WHERE lesson_id IN ('5-11', '5-12');
-- Day 47: 2 lessons (5-13, 5-14)
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-e007-555555555557', date = 'Day 47', display_order = CASE 
  WHEN lesson_id = '5-13' THEN 1 
  WHEN lesson_id = '5-14' THEN 2 
END WHERE lesson_id IN ('5-13', '5-14');
-- Days 48-49: Reserved for review/preparation (no lessons assigned, or can be used for additional content)

-- ============================================
-- ============================================
-- Summary
-- ============================================
-- Course 01: Days 1-10 (10 lessons, 1 per day) ✓
-- Course 02: Days 11-20 (12 lessons: Days 11-19 have 1 each, Day 20 has 3) ✓
-- Course 03: Days 21-30 (13 lessons: Days 21-27 have 1 each, Days 28-30 have 2 each) ✓
-- Course 04: Days 31-40 (17 lessons: Days 31-37 have 2 each, Days 38-40 have 1 each) ✓
-- Course 05: Days 41-49 (14 lessons: Days 41-47 have 2 each, Days 48-49 reserved for review) ✓

