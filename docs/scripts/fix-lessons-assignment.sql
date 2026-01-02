-- Fix Lessons Assignment to Weeks
-- This script ensures all lessons are properly assigned to their weeks
-- Run this AFTER running setup-7-weeks-sequential-courses.sql

-- ============================================
-- COURSE 01: Introduction to Event Management
-- ============================================

-- Day 1: Lesson 1-1
UPDATE course_lessons
SET week_id = 'a1a1b2c3-d4e5-4789-a001-111111111111', date = 'Day 1', display_order = 1
WHERE lesson_id = '1-1';

-- Day 2: Lesson 1-2
UPDATE course_lessons
SET week_id = 'a1a1b2c3-d4e5-4789-a002-111111111112', date = 'Day 2', display_order = 1
WHERE lesson_id = '1-2';

-- Day 3: Lesson 1-3
UPDATE course_lessons
SET week_id = 'a1a1b2c3-d4e5-4789-a003-111111111113', date = 'Day 3', display_order = 1
WHERE lesson_id = '1-3';

-- Day 4: Lesson 1-4
UPDATE course_lessons
SET week_id = 'a1a1b2c3-d4e5-4789-a004-111111111114', date = 'Day 4', display_order = 1
WHERE lesson_id = '1-4';

-- Day 5: Lesson 1-5
UPDATE course_lessons
SET week_id = 'a1a1b2c3-d4e5-4789-a005-111111111115', date = 'Day 5', display_order = 1
WHERE lesson_id = '1-5';

-- Day 6: Lesson 1-6
UPDATE course_lessons
SET week_id = 'a1a1b2c3-d4e5-4789-a006-111111111116', date = 'Day 6', display_order = 1
WHERE lesson_id = '1-6';

-- Day 7: Lesson 1-7
UPDATE course_lessons
SET week_id = 'a1a1b2c3-d4e5-4789-a007-111111111117', date = 'Day 7', display_order = 1
WHERE lesson_id = '1-7';

-- Day 8: Lesson 1-8
UPDATE course_lessons
SET week_id = 'a1a1b2c3-d4e5-4789-a008-111111111118', date = 'Day 8', display_order = 1
WHERE lesson_id = '1-8';

-- Day 9: Lesson 1-9
UPDATE course_lessons
SET week_id = 'a1a1b2c3-d4e5-4789-a009-111111111119', date = 'Day 9', display_order = 1
WHERE lesson_id = '1-9';

-- Day 10: Lesson 1-10
UPDATE course_lessons
SET week_id = 'a1a1b2c3-d4e5-4789-a010-111111111120', date = 'Day 10', display_order = 1
WHERE lesson_id = '1-10';

-- ============================================
-- COURSE 02: Event Management Planning
-- ============================================

UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b001-222222222221', date = 'Day 11', display_order = 1 WHERE lesson_id = '2-1';
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b002-222222222222', date = 'Day 12', display_order = 1 WHERE lesson_id = '2-2';
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b003-222222222223', date = 'Day 13', display_order = 1 WHERE lesson_id = '2-3';
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b004-222222222224', date = 'Day 14', display_order = 1 WHERE lesson_id = '2-4';
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b005-222222222225', date = 'Day 15', display_order = 1 WHERE lesson_id = '2-5';
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b006-222222222226', date = 'Day 16', display_order = 1 WHERE lesson_id = '2-6';
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b007-222222222227', date = 'Day 17', display_order = 1 WHERE lesson_id = '2-7';
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b008-222222222228', date = 'Day 18', display_order = 1 WHERE lesson_id = '2-8';
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b009-222222222229', date = 'Day 19', display_order = 1 WHERE lesson_id = '2-9';
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b010-222222222230', date = 'Day 20', display_order = 1 WHERE lesson_id = '2-10';
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b011-222222222231', date = 'Day 21', display_order = 1 WHERE lesson_id = '2-11';
UPDATE course_lessons SET week_id = 'b2a1b2c3-d4e5-4890-b012-222222222232', date = 'Day 22', display_order = 1 WHERE lesson_id = '2-12';

-- ============================================
-- COURSE 03: Different Aspects of Event Management
-- ============================================

UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c001-333333333331', date = 'Day 23', display_order = 1 WHERE lesson_id = '3-1';
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c002-333333333332', date = 'Day 24', display_order = 1 WHERE lesson_id = '3-2';
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c003-333333333333', date = 'Day 25', display_order = 1 WHERE lesson_id = '3-3';
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c004-333333333334', date = 'Day 26', display_order = 1 WHERE lesson_id = '3-4';
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c005-333333333335', date = 'Day 27', display_order = 1 WHERE lesson_id = '3-5';
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c006-333333333336', date = 'Day 28', display_order = 1 WHERE lesson_id = '3-6';
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c007-333333333337', date = 'Day 29', display_order = 1 WHERE lesson_id = '3-7';
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c008-333333333338', date = 'Day 30', display_order = 1 WHERE lesson_id = '3-8';
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c009-333333333339', date = 'Day 31', display_order = 1 WHERE lesson_id = '3-9';
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c010-333333333340', date = 'Day 32', display_order = 1 WHERE lesson_id = '3-10';
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c011-333333333341', date = 'Day 33', display_order = 1 WHERE lesson_id = '3-11';
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c012-333333333342', date = 'Day 34', display_order = 1 WHERE lesson_id = '3-12';
UPDATE course_lessons SET week_id = 'c3a1b2c3-d4e5-4901-c013-333333333343', date = 'Day 35', display_order = 1 WHERE lesson_id = '3-13';

-- ============================================
-- COURSE 04: Basic Qualities of Event Management Person
-- ============================================

UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d001-444444444441', date = 'Day 36', display_order = CASE WHEN lesson_id = '4-1' THEN 1 WHEN lesson_id = '4-2' THEN 2 WHEN lesson_id = '4-3' THEN 3 END WHERE lesson_id IN ('4-1', '4-2', '4-3');
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d002-444444444442', date = 'Day 37', display_order = CASE WHEN lesson_id = '4-4' THEN 1 WHEN lesson_id = '4-5' THEN 2 END WHERE lesson_id IN ('4-4', '4-5');
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d003-444444444443', date = 'Day 38', display_order = CASE WHEN lesson_id = '4-6' THEN 1 WHEN lesson_id = '4-7' THEN 2 WHEN lesson_id = '4-8' THEN 3 END WHERE lesson_id IN ('4-6', '4-7', '4-8');
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d004-444444444444', date = 'Day 39', display_order = CASE WHEN lesson_id = '4-9' THEN 1 WHEN lesson_id = '4-10' THEN 2 END WHERE lesson_id IN ('4-9', '4-10');
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d005-444444444445', date = 'Day 40', display_order = CASE WHEN lesson_id = '4-11' THEN 1 WHEN lesson_id = '4-12' THEN 2 END WHERE lesson_id IN ('4-11', '4-12');
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d006-444444444446', date = 'Day 41', display_order = CASE WHEN lesson_id = '4-13' THEN 1 WHEN lesson_id = '4-14' THEN 2 END WHERE lesson_id IN ('4-13', '4-14');
UPDATE course_lessons SET week_id = 'd4a1b2c3-d4e5-5012-d007-444444444447', date = 'Day 42', display_order = CASE WHEN lesson_id = '4-15' THEN 1 WHEN lesson_id = '4-16' THEN 2 WHEN lesson_id = '4-17' THEN 3 END WHERE lesson_id IN ('4-15', '4-16', '4-17');

-- ============================================
-- COURSE 05: Various Event Activities
-- ============================================

UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-e001-555555555551', date = 'Day 43', display_order = CASE WHEN lesson_id = '5-1' THEN 1 WHEN lesson_id = '5-2' THEN 2 END WHERE lesson_id IN ('5-1', '5-2');
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-e002-555555555552', date = 'Day 44', display_order = 1 WHERE lesson_id = '5-3';
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-e003-555555555553', date = 'Day 45', display_order = CASE WHEN lesson_id = '5-4' THEN 1 WHEN lesson_id = '5-5' THEN 2 END WHERE lesson_id IN ('5-4', '5-5');
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-e004-555555555554', date = 'Day 46', display_order = CASE WHEN lesson_id = '5-6' THEN 1 WHEN lesson_id = '5-7' THEN 2 END WHERE lesson_id IN ('5-6', '5-7');
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-e005-555555555555', date = 'Day 47', display_order = CASE WHEN lesson_id = '5-8' THEN 1 WHEN lesson_id = '5-9' THEN 2 END WHERE lesson_id IN ('5-8', '5-9');
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-e006-555555555556', date = 'Day 48', display_order = CASE WHEN lesson_id = '5-10' THEN 1 WHEN lesson_id = '5-11' THEN 2 WHEN lesson_id = '5-12' THEN 3 END WHERE lesson_id IN ('5-10', '5-11', '5-12');
UPDATE course_lessons SET week_id = 'e5a1b2c3-d4e5-6123-e007-555555555557', date = 'Day 49', display_order = CASE WHEN lesson_id = '5-13' THEN 1 WHEN lesson_id = '5-14' THEN 2 END WHERE lesson_id IN ('5-13', '5-14');

-- ============================================
-- Verify lessons are assigned
-- ============================================
-- Check if any lessons are missing week assignments
SELECT 
  cl.lesson_id,
  cl.topic,
  cw.theme as week_theme,
  cw.course_id,
  c.title as course_title
FROM course_lessons cl
LEFT JOIN course_weeks cw ON cl.week_id = cw.id
LEFT JOIN courses c ON cw.course_id = c.id
WHERE cw.id IS NULL
ORDER BY cl.lesson_id;

