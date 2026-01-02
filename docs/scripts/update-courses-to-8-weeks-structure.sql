-- Update All Courses to 8-Week (2 Month) Structure
-- This SQL file reorganizes all 5 courses to span 8 weeks instead of 1 week
-- Run this after inserting the initial course data

-- ============================================
-- COURSE 01: Introduction to Event Management
-- ============================================

-- Delete existing week and create 8 weeks
DELETE FROM course_weeks WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234';

-- Week 1: Introduction and Definitions
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a001-111111111111',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  1,
  'Introduction to Events and Definitions',
  'Understand what events are and learn various definitions of events',
  1
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 2: Classification of Events
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a002-111111111112',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  2,
  'Classification and Types of Events',
  'Learn about different categories and types of events',
  2
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 3: Benefits and Strategy
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a003-111111111113',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  3,
  'Benefits of Events and Event Management Strategy',
  'Understand benefits of hosting events and event management strategies',
  3
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 4: Objectives and Creativity
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a004-111111111114',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  4,
  'Objectives and Role of Creativity',
  'Learn SMART objectives and role of creativity in event management',
  4
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 5: Event Committee Structure
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a005-111111111115',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  5,
  'Event Committee and Organization Structure',
  'Understand event committee structure and organization',
  5
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 6: Functions of Event Management - Part 1
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a006-111111111116',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  6,
  'Functions of Event Management: Planning and Organizing',
  'Learn planning and organizing functions in event management',
  6
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 7: Functions of Event Management - Part 2
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a007-111111111117',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  7,
  'Functions of Event Management: Staffing, Leading, Controlling',
  'Learn staffing, leading, and controlling functions',
  7
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 8: Review and Assessment
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'a1a1b2c3-d4e5-4789-a008-111111111118',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  8,
  'Review, Summary and Course Assessment',
  'Review all concepts and prepare for final assessment',
  8
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons to distribute across weeks
-- Week 1: Lessons 1.1, 1.2
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a001-111111111111', date = 'Week 1' WHERE lesson_id IN ('1-1', '1-2') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234');

-- Week 2: Lessons 1.3, 1.4
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a002-111111111112', date = 'Week 2' WHERE lesson_id IN ('1-3', '1-4') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234');

-- Week 3: Lessons 1.5, 1.6
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a003-111111111113', date = 'Week 3' WHERE lesson_id IN ('1-5', '1-6') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234');

-- Week 4: Lessons 1.7, 1.8
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a004-111111111114', date = 'Week 4' WHERE lesson_id IN ('1-7', '1-8') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234');

-- Week 5: Lesson 1.9
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a005-111111111115', date = 'Week 5' WHERE lesson_id = '1-9' AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234');

-- Week 6-7: Lesson 1.10 (split content if needed, or keep in week 6)
UPDATE course_lessons SET week_id = 'a1a1b2c3-d4e5-4789-a006-111111111116', date = 'Week 6' WHERE lesson_id = '1-10' AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234');

-- ============================================
-- COURSE 02: Event Management Planning
-- ============================================

DELETE FROM course_weeks WHERE course_id = 'c2d3e4f5-a6b7-4890-c123-456789012345';

-- Week 1: Event Planning Introduction
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b001-222222222221',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  1,
  'Event Planning Introduction and Benefits',
  'Understand event planning process and its benefits',
  1
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 2: Environmental Factors
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b002-222222222222',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  2,
  'Forces Affecting Event Planning',
  'Learn about PESTEL analysis and environmental factors',
  2
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 3: Planning Steps and Feasibility
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b003-222222222223',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  3,
  'Steps in Event Management Plan',
  'Learn planning steps and feasibility analysis',
  3
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 4: Operational Planning
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b004-222222222224',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  4,
  'Operational Planning',
  'Understand operational planning process',
  4
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 5: Finances and Budgets
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b005-222222222225',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  5,
  'Finances and Budgets',
  'Learn budget planning and financial management',
  5
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 6: Sponsorship and Team Organization
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b006-222222222226',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  6,
  'Sponsorship and Team Organization',
  'Learn sponsorship development and team organization',
  6
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 7: Venue, Security and Marketing
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b007-222222222227',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  7,
  'Venue Selection, Security and Marketing',
  'Learn about venue selection, security planning and marketing',
  7
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 8: Timeline and Post-Event
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'b2a1b2c3-d4e5-4890-b008-222222222228',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  8,
  'Event Timeline and Post-Event Evaluation',
  'Learn event planning timeline and post-event activities',
  8
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Course 02
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-a001-222222222221', date = 'Week 1' WHERE lesson_id = '2-1' AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'c2d3e4f5-a6b7-4890-c123-456789012345');
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-a002-222222222222', date = 'Week 2' WHERE lesson_id = '2-2' AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'c2d3e4f5-a6b7-4890-c123-456789012345');
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-a003-222222222223', date = 'Week 3' WHERE lesson_id = '2-3' AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'c2d3e4f5-a6b7-4890-c123-456789012345');
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-a004-222222222224', date = 'Week 4' WHERE lesson_id = '2-4' AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'c2d3e4f5-a6b7-4890-c123-456789012345');
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-a005-222222222225', date = 'Week 5' WHERE lesson_id = '2-5' AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'c2d3e4f5-a6b7-4890-c123-456789012345');
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-a006-222222222226', date = 'Week 6' WHERE lesson_id IN ('2-6', '2-7') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'c2d3e4f5-a6b7-4890-c123-456789012345');
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-a007-222222222227', date = 'Week 7' WHERE lesson_id IN ('2-8', '2-9', '2-10') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'c2d3e4f5-a6b7-4890-c123-456789012345');
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-a008-222222222228', date = 'Week 8' WHERE lesson_id IN ('2-11', '2-12') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'c2d3e4f5-a6b7-4890-c123-456789012345');

-- ============================================
-- COURSE 03: Different Aspects of Event Management
-- ============================================

DELETE FROM course_weeks WHERE course_id = 'e3f4a5b6-c7d8-4901-e234-567890123456';

-- Week 1: Stage Management
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c001-333333333331',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  1,
  'Stage Management',
  'Understand stage management responsibilities and duties',
  1
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 2: Brand Management - Part 1
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c002-333333333332',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  2,
  'Brand Management Fundamentals',
  'Learn about brand management and its determinants',
  2
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 3: Brand Management - Part 2
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c003-333333333333',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  3,
  'Brand Value and Strategy',
  'Understand brand value components and strategy design',
  3
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 4: Budgeting - Part 1
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c004-333333333334',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  4,
  'Budgeting in Event Management',
  'Learn budgeting fundamentals and budget development',
  4
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 5: Budgeting - Part 2
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c005-333333333335',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  5,
  'Budget Control and Management',
  'Learn budget control and performance monitoring',
  5
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 6: Leadership - Part 1
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c006-333333333336',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  6,
  'Leadership in Event Management',
  'Understand leadership concepts and skills',
  6
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 7: Leadership - Part 2
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c007-333333333337',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  7,
  'Leadership Qualities and Event Success',
  'Learn leadership qualities and event success evaluation',
  7
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 8: Event Feedback and Review
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'c3a1b2c3-d4e5-4901-c008-333333333338',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  8,
  'Event Feedback and Course Review',
  'Learn about event feedback methods and course review',
  8
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Course 03
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-a001-333333333331', date = 'Week 1' WHERE lesson_id IN ('3-1', '3-2') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'e3f4a5b6-c7d8-4901-e234-567890123456');
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-a002-333333333332', date = 'Week 2' WHERE lesson_id = '3-3' AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'e3f4a5b6-c7d8-4901-e234-567890123456');
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-a003-333333333333', date = 'Week 3' WHERE lesson_id IN ('3-4', '3-5') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'e3f4a5b6-c7d8-4901-e234-567890123456');
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-a004-333333333334', date = 'Week 4' WHERE lesson_id IN ('3-6', '3-7') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'e3f4a5b6-c7d8-4901-e234-567890123456');
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-a005-333333333335', date = 'Week 5' WHERE lesson_id = '3-8' AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'e3f4a5b6-c7d8-4901-e234-567890123456');
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-a006-333333333336', date = 'Week 6' WHERE lesson_id IN ('3-9', '3-10') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'e3f4a5b6-c7d8-4901-e234-567890123456');
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-a007-333333333337', date = 'Week 7' WHERE lesson_id IN ('3-11', '3-12') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'e3f4a5b6-c7d8-4901-e234-567890123456');
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-a008-333333333338', date = 'Week 8' WHERE lesson_id = '3-13' AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'e3f4a5b6-c7d8-4901-e234-567890123456');

-- ============================================
-- COURSE 04: Basic Qualities of Event Management Person
-- ============================================

DELETE FROM course_weeks WHERE course_id = 'a4b5c6d7-e8f9-5012-f345-678901234567';

-- Week 1: Standards and Environment
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d001-444444444441',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  1,
  'Standards, Regulations and Event Environment',
  'Understand standards, regulations and event environment',
  1
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 2: Management Knowledge
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d002-444444444442',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  2,
  'Management Knowledge',
  'Learn general management knowledge and skills',
  2
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 3: Interpersonal Skills
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d003-444444444443',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  3,
  'Interpersonal Skills and Trustworthiness',
  'Develop interpersonal skills and build trustworthiness',
  3
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 4: Delegation and Communication
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d004-444444444444',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  4,
  'Delegation and Communication',
  'Learn effective delegation and communication skills',
  4
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 5: Leadership and Motivation
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d005-444444444445',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  5,
  'Leadership and Motivation',
  'Understand leadership and motivation in event management',
  5
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 6: Problem Solving and Team Management
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d006-444444444446',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  6,
  'Problem Solving and Team Management',
  'Learn problem-solving techniques and team management',
  6
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 7: Risk Management and Multitasking
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d007-444444444447',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  7,
  'Risk Management and Multitasking',
  'Learn risk management and multitasking skills',
  7
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 8: Decoration, Etiquettes and Time Management
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'd4a1b2c3-d4e5-5012-d008-444444444448',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  8,
  'Decoration, Personal Etiquettes and Time Management',
  'Learn about decoration, etiquettes and time management',
  8
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Course 04
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-a001-444444444441', date = 'Week 1' WHERE lesson_id IN ('4-1', '4-2') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a4b5c6d7-e8f9-5012-f345-678901234567');
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-a002-444444444442', date = 'Week 2' WHERE lesson_id = '4-3' AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a4b5c6d7-e8f9-5012-f345-678901234567');
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-a003-444444444443', date = 'Week 3' WHERE lesson_id = '4-4' AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a4b5c6d7-e8f9-5012-f345-678901234567');
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-a004-444444444444', date = 'Week 4' WHERE lesson_id IN ('4-5', '4-6', '4-7', '4-8') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a4b5c6d7-e8f9-5012-f345-678901234567');
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-a005-444444444445', date = 'Week 5' WHERE lesson_id IN ('4-9', '4-10') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a4b5c6d7-e8f9-5012-f345-678901234567');
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-a006-444444444446', date = 'Week 6' WHERE lesson_id IN ('4-11', '4-12') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a4b5c6d7-e8f9-5012-f345-678901234567');
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-a007-444444444447', date = 'Week 7' WHERE lesson_id IN ('4-13', '4-14') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a4b5c6d7-e8f9-5012-f345-678901234567');
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-a008-444444444448', date = 'Week 8' WHERE lesson_id IN ('4-15', '4-16', '4-17') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a4b5c6d7-e8f9-5012-f345-678901234567');

-- ============================================
-- COURSE 05: Various Event Activities
-- ============================================

DELETE FROM course_weeks WHERE course_id = 'a5b6c7d8-e9f0-6123-a456-789012345678';

-- Week 1: Types of Events
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e001-555555555551',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  1,
  'Types of Events and Private Events',
  'Understand different types of events and private events',
  1
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 2: Corporate Events
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e002-555555555552',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  2,
  'Corporate Events and MICE',
  'Learn about corporate events and MICE industry',
  2
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 3: Conferences
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e003-555555555553',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  3,
  'Conferences and Seminars',
  'Understand conference planning and management',
  3
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 4: Exhibitions - Part 1
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e004-555555555554',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  4,
  'Exhibitions and Trade Fairs',
  'Learn about exhibitions and trade fairs',
  4
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 5: Exhibitions - Part 2
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e005-555555555555',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  5,
  'Exhibition Design and ITPO',
  'Learn exhibition design and role of ITPO',
  5
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 6: Charity and Live Events
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e006-555555555556',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  6,
  'Charity Events and Live Events',
  'Understand charity events and live event management',
  6
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 7: Sports Events
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e007-555555555557',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  7,
  'Sports Events',
  'Learn about sports event planning and management',
  7
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Week 8: Festivals and Review
INSERT INTO course_weeks (id, course_id, week_number, theme, goal, display_order)
VALUES (
  'e5a1b2c3-d4e5-6123-e008-555555555558',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  8,
  'Festivals and Course Review',
  'Learn about festivals and course review',
  8
) ON CONFLICT (course_id, week_number) DO UPDATE SET theme = EXCLUDED.theme, goal = EXCLUDED.goal;

-- Update lessons for Course 05
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-a001-555555555551', date = 'Week 1' WHERE lesson_id = '5-1' AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a5b6c7d8-e9f0-6123-a456-789012345678');
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-a002-555555555552', date = 'Week 2' WHERE lesson_id = '5-2' AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a5b6c7d8-e9f0-6123-a456-789012345678');
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-a003-555555555553', date = 'Week 3' WHERE lesson_id = '5-3' AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a5b6c7d8-e9f0-6123-a456-789012345678');
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-a004-555555555554', date = 'Week 4' WHERE lesson_id = '5-4' AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a5b6c7d8-e9f0-6123-a456-789012345678');
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-a005-555555555555', date = 'Week 5' WHERE lesson_id IN ('5-5', '5-14') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a5b6c7d8-e9f0-6123-a456-789012345678');
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-a006-555555555556', date = 'Week 6' WHERE lesson_id IN ('5-6', '5-7') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a5b6c7d8-e9f0-6123-a456-789012345678');
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-a007-555555555557', date = 'Week 7' WHERE lesson_id IN ('5-8', '5-9', '5-10') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a5b6c7d8-e9f0-6123-a456-789012345678');
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-a008-555555555558', date = 'Week 8' WHERE lesson_id IN ('5-11', '5-12', '5-13') AND week_id IN (SELECT id FROM course_weeks WHERE course_id = 'a5b6c7d8-e9f0-6123-a456-789012345678');

