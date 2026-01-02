# Sequential Course Schedule System (ALX-Style)

## Overview
This system implements a sequential course schedule where:
- Each course runs for a specific number of days (2-5 days)
- Courses start sequentially (Course 2 starts after Course 1 finishes)
- Only the current day's course content is displayed
- Future courses are hidden until the current one is completed

## Course Schedule

| Course | Start Day | Duration | End Day | Description |
|--------|-----------|----------|---------|-------------|
| Course 01 | Day 1 | 2 days | Day 2 | Introduction to Event Management |
| Course 02 | Day 3 | 2 days | Day 4 | Event Management Planning |
| Course 03 | Day 5 | 3 days | Day 7 | Different Aspects of Event Management |
| Course 04 | Day 8 | 3 days | Day 10 | Basic Qualities of Event Management Person |
| Course 05 | Day 11 | 4 days | Day 14 | Various Event Activities |

**Total Duration: 14 days (2 weeks)**

## Database Structure

### course_schedule Table
Tracks when each course starts and ends:
- `course_id`: Reference to the course
- `start_day`: Day number when course starts
- `duration_days`: How many days the course lasts
- `end_day`: Day number when course ends
- `is_active`: Whether the schedule is active

## Frontend Implementation

### Getting Current Day
You need to track the current day for each user. This can be:
1. Based on enrollment date (Day 1 = enrollment date)
2. Based on first course access
3. Manually set by admin

### Query Active Course
Use the function to get the active course for a given day:

```sql
SELECT * FROM get_active_course_for_day(5); -- Returns Course 03 for Day 5
```

### Check Course Access
Use the function to check if a course is accessible:

```sql
SELECT is_course_accessible('course-uuid', 5); -- Returns true/false
```

### Frontend Logic

```typescript
// Get current day (based on enrollment or first access)
const currentDay = getUserCurrentDay(userId);

// Get active course for today
const { data: activeCourse } = await supabase
  .rpc('get_active_course_for_day', { check_day: currentDay });

// Only show courses that are accessible
const { data: courses } = await supabase
  .from('courses')
  .select('*')
  .eq('is_active', true);

// Filter courses based on accessibility
const accessibleCourses = courses.filter(course => 
  is_course_accessible(course.id, currentDay)
);

// Hide future courses
const visibleCourses = accessibleCourses.filter(course => {
  const schedule = courseSchedules.find(s => s.course_id === course.id);
  return schedule && currentDay >= schedule.start_day && currentDay <= schedule.end_day;
});
```

## Updating User Progress

Track which day the user is on:
- Store `current_day` in user profile or progress table
- Increment when user completes a day's content
- Only allow access to current day's course

## Example Flow

**Day 1:**
- User sees only Course 01, Week 1
- Course 02-05 are hidden

**Day 2:**
- User sees only Course 01, Week 2
- Course 02-05 are still hidden

**Day 3:**
- Course 01 is completed
- User sees only Course 02, Week 1
- Course 03-05 are hidden

**Day 14:**
- All courses completed
- User can review all content

## Admin Functions

To update course schedules:
```sql
UPDATE course_schedule 
SET start_day = 1, duration_days = 3, end_day = 3
WHERE course_id = 'course-uuid';
```

To add a new course schedule:
```sql
INSERT INTO course_schedule (course_id, start_day, duration_days, end_day)
VALUES ('course-uuid', 15, 2, 16);
```

