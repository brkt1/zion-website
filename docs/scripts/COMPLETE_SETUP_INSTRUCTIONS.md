# Complete Course Setup Instructions

## Problem: "No lessons yet" showing

If you're seeing "No lessons yet" in the admin panel, follow these steps in order:

## Step 1: Insert Course Data (if not done already)

Run these SQL files **in order** to insert all course content:

1. `insert-course-01-introduction-to-event-management.sql`
2. `insert-course-02-event-management-planning.sql`
3. `insert-course-03-different-aspects-of-event-management.sql`
4. `insert-course-04-basic-qualities-of-event-management-person.sql`
5. `insert-course-05-various-event-activities.sql`

These files create:
- Courses
- Initial weeks
- All lessons with content

## Step 2: Reorganize into 7-Week Structure

Run this SQL file to reorganize everything into the 7-week sequential structure:

**`setup-7-weeks-sequential-courses.sql`**

This file:
- Creates the `course_schedule` table
- Deletes old weeks
- Creates new weeks (49 days total)
- Updates lessons to point to new weeks

## Step 3: Fix Lesson Assignments (if needed)

If lessons still don't show up, run:

**`fix-lessons-assignment.sql`**

This file ensures all lessons are properly assigned to their weeks.

## Step 4: Verify Setup

Run this query to check if lessons are properly assigned:

```sql
-- Check lessons per course
SELECT 
  c.title as course_title,
  COUNT(DISTINCT cw.id) as week_count,
  COUNT(cl.id) as lesson_count
FROM courses c
LEFT JOIN course_weeks cw ON cw.course_id = c.id
LEFT JOIN course_lessons cl ON cl.week_id = cw.id
WHERE c.is_active = true
GROUP BY c.id, c.title
ORDER BY c.display_order;
```

Expected results:
- Course 01: 10 weeks, 10 lessons
- Course 02: 12 weeks, 12 lessons
- Course 03: 13 weeks, 13 lessons
- Course 04: 7 weeks, 17 lessons
- Course 05: 7 weeks, 14 lessons

## Step 5: Check for Orphaned Lessons

Run this query to find lessons without week assignments:

```sql
SELECT 
  cl.lesson_id,
  cl.topic,
  c.title as course_title
FROM course_lessons cl
LEFT JOIN course_weeks cw ON cl.week_id = cw.id
LEFT JOIN courses c ON cw.course_id = c.id
WHERE cw.id IS NULL
ORDER BY cl.lesson_id;
```

If this returns any rows, those lessons need to be assigned to weeks.

## Troubleshooting

### Issue: Lessons exist but don't show in admin panel

**Solution:** Check if weeks exist and lessons are linked:
```sql
SELECT cw.id, cw.theme, COUNT(cl.id) as lesson_count
FROM course_weeks cw
LEFT JOIN course_lessons cl ON cl.week_id = cw.id
WHERE cw.course_id = 'a1b2c3d4-e5f6-4789-a012-345678901234'
GROUP BY cw.id, cw.theme
ORDER BY cw.week_number;
```

### Issue: Foreign key constraint errors

**Solution:** Make sure courses exist before creating weeks:
```sql
SELECT id, title FROM courses WHERE is_active = true ORDER BY display_order;
```

### Issue: Duplicate week_number errors

**Solution:** The `ON CONFLICT` clause should handle this, but if you get errors:
```sql
-- Check for duplicate week_numbers per course
SELECT course_id, week_number, COUNT(*) 
FROM course_weeks 
GROUP BY course_id, week_number 
HAVING COUNT(*) > 1;
```

## Quick Fix Script

If nothing works, run this complete reset (⚠️ **WARNING: This will delete all course data**):

```sql
-- 1. Delete all lessons
DELETE FROM course_lessons;

-- 2. Delete all weeks
DELETE FROM course_weeks;

-- 3. Delete all courses (optional)
-- DELETE FROM courses;

-- 4. Then re-run all insert-course-XX.sql files
-- 5. Then run setup-7-weeks-sequential-courses.sql
-- 6. Then run fix-lessons-assignment.sql
```

## Expected Final Structure

After running all scripts, you should have:

- **5 Courses** (all active)
- **49 Weeks total** (distributed across 5 courses)
- **66 Lessons total** (distributed across weeks)
- **course_schedule table** with schedule information

Each course should have:
- Course 01: Days 1-10 (10 lessons)
- Course 02: Days 11-22 (12 lessons)
- Course 03: Days 23-35 (13 lessons)
- Course 04: Days 36-42 (17 lessons)
- Course 05: Days 43-49 (14 lessons)

