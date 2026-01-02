# 7-Week Sequential Course Schedule

## Overview
This system implements a sequential course schedule where students must complete all 5 courses in 7 weeks (49 days total). Courses unlock sequentially - students must finish Course 1 before starting Course 2, and so on.

## Course Schedule Distribution

### Balanced Day Distribution (49 Days Total)

| Course | Start Day | End Day | Duration | Description |
|--------|-----------|---------|----------|-------------|
| **Course 01** | Day 1 | Day 10 | 10 days | Introduction to Event Management |
| **Course 02** | Day 11 | Day 20 | 10 days | Event Management Planning |
| **Course 03** | Day 21 | Day 30 | 10 days | Different Aspects of Event Management |
| **Course 04** | Day 31 | Day 40 | 10 days | Basic Qualities of Event Management Person |
| **Course 05** | Day 41 | Day 49 | 9 days | Various Event Activities |

**Total Duration: 49 days (7 weeks)**

### Weekly Breakdown

- **Week 1** (Days 1-7): Course 01 (Days 1-7)
- **Week 2** (Days 8-14): Course 01 (Days 8-10) → Course 02 (Days 11-14)
- **Week 3** (Days 15-21): Course 02 (Days 15-20) → Course 03 (Day 21)
- **Week 4** (Days 22-28): Course 03 (Days 22-28)
- **Week 5** (Days 29-35): Course 03 (Days 29-30) → Course 04 (Days 31-35)
- **Week 6** (Days 36-42): Course 04 (Days 36-40) → Course 05 (Days 41-42)
- **Week 7** (Days 43-49): Course 05 (Days 43-49)

## How It Works

### 1. Enrollment Tracking
- Each user has an enrollment date (set when they first access the e-learning portal)
- Day 1 = enrollment date
- Day 2 = enrollment date + 1 day
- Current day is calculated automatically based on enrollment date

### 2. Sequential Access Control
- **Course 1**: Available from Day 1
- **Course 2**: Available from Day 11, BUT only if Course 1 is 100% completed
- **Course 3**: Available from Day 21, BUT only if Course 2 is 100% completed
- **Course 4**: Available from Day 31, BUT only if Course 3 is 100% completed
- **Course 5**: Available from Day 41, BUT only if Course 4 is 100% completed

### 3. Course Completion Requirements
A course is considered completed when:
- All lessons in all weeks are marked as "completed"
- The course test is passed (if applicable)

### 4. Automatic Unlocking
- When a student completes all lessons in a course, the next course automatically unlocks
- The system checks completion status after each lesson completion
- Students see a message if they try to access a course before completing the previous one

## Database Structure

### Tables

#### `course_schedule`
Tracks when each course starts and ends:
- `course_id`: Reference to the course
- `start_day`: Day number when course starts (1, 11, 21, 31, 41)
- `duration_days`: How many days the course lasts (10, 10, 10, 10, 9)
- `end_day`: Day number when course ends (10, 20, 30, 40, 49)
- `is_active`: Whether the schedule is active

#### `user_enrollment`
Tracks each user's enrollment and current progress:
- `user_id`: Reference to auth.users
- `enrollment_date`: Date when user first accessed the portal
- `current_day`: Current day number (1-49)
- `last_accessed_at`: Last time user accessed the portal

### Database Functions

#### `get_user_current_day(user_id)`
Returns the current day for a user based on their enrollment date.

#### `get_active_course_for_day(day)`
Returns the course that should be active for a given day number.

#### `is_course_accessible_for_user(course_id, user_id)`
Checks if a course is accessible for a user:
- Verifies user's current day is within course range
- Verifies previous course is completed (if not Course 1)

#### `get_accessible_courses_for_user(user_id)`
Returns all courses accessible to a user based on:
- Current day
- Course completion status

#### `is_course_completed(course_id, user_id)`
Checks if all lessons in a course are completed by the user.

## Frontend Implementation

### Key Features

1. **Current Day Display**
   - Shows user's current day (1-49)
   - Shows week number (1-7)
   - Shows overall progress percentage

2. **Access Control Messages**
   - Yellow warning banner if course is locked
   - Explains why course is locked
   - Shows progress information

3. **Automatic Course Loading**
   - Only loads the current accessible course
   - Automatically switches to next course when current is completed
   - Hides future courses until unlocked

4. **Progress Tracking**
   - Tracks lesson completion
   - Updates in real-time
   - Automatically checks course completion after each lesson

## Setup Instructions

### 1. Run SQL Script
Execute the SQL script to set up the database:
```bash
# Run in Supabase SQL Editor
docs/scripts/setup-7-weeks-balanced-sequential.sql
```

This script will:
- Create `course_schedule` table
- Create `user_enrollment` table
- Set up course schedules for all 5 courses
- Create all helper functions
- Set up Row Level Security policies

### 2. Update Course IDs
Make sure the course IDs in the SQL script match your actual course IDs:
- Course 01: `a1b2c3d4-e5f6-4789-a012-345678901234`
- Course 02: `c2d3e4f5-a6b7-4890-c123-456789012345`
- Course 03: `e3f4a5b6-c7d8-4901-e234-567890123456`
- Course 04: `a4b5c6d7-e8f9-5012-f345-678901234567`
- Course 05: `a5b6c7d8-e9f0-6123-a456-789012345678`

### 3. Frontend is Already Updated
The frontend (`src/pages/Elearning.tsx`) has been updated to:
- Get user's current day
- Check course accessibility
- Display access messages
- Automatically unlock next course

## User Experience Flow

### Day 1 (Enrollment)
1. User enrolls and accesses portal
2. Enrollment date is set to today
3. Current day = 1
4. Only Course 01 is visible and accessible
5. User starts Course 01, Day 1 content

### Day 10 (End of Course 01)
1. User completes all Course 01 lessons
2. System detects completion
3. Course 02 becomes accessible (Day 11)
4. User can start Course 02

### Day 20 (End of Course 02)
1. User completes all Course 02 lessons
2. System detects completion
3. Course 03 becomes accessible (Day 21)
4. User can start Course 03

### Day 49 (End of Program)
1. User completes all Course 05 lessons
2. All courses are accessible for review
3. Certificate is available

## Admin Functions

### Check User Progress
```sql
SELECT 
  ue.user_id,
  ue.enrollment_date,
  ue.current_day,
  u.email
FROM user_enrollment ue
JOIN auth.users u ON u.id = ue.user_id
ORDER BY ue.current_day DESC;
```

### Check Course Completion Status
```sql
SELECT 
  c.title,
  is_course_completed(c.id, 'user-uuid-here') as completed
FROM courses c
ORDER BY c.display_order;
```

### Manually Set User's Current Day (Admin Only)
```sql
UPDATE user_enrollment
SET current_day = 25
WHERE user_id = 'user-uuid-here';
```

### Reset User Enrollment (Admin Only)
```sql
UPDATE user_enrollment
SET enrollment_date = CURRENT_DATE,
    current_day = 1
WHERE user_id = 'user-uuid-here';
```

## Important Notes

1. **Day Calculation**: Current day is calculated as `CURRENT_DATE - enrollment_date + 1`
   - If enrolled today: Day 1
   - If enrolled yesterday: Day 2
   - This ensures consistent day tracking

2. **Completion Requirement**: Students MUST complete ALL lessons in a course before the next course unlocks. Simply reaching the start day is not enough.

3. **Time Flexibility**: While courses are scheduled for specific days, students can work ahead within their current course. However, they cannot access future courses until:
   - The start day is reached
   - The previous course is completed

4. **Progress Persistence**: All progress is saved in the database and persists across sessions.

5. **Automatic Updates**: The system automatically updates the current day based on enrollment date, so students don't need to manually track days.

## Troubleshooting

### Course Not Unlocking
- Check if all lessons in previous course are completed
- Verify user's current day is >= course start day
- Check database function `is_course_completed` returns true

### Wrong Current Day
- Verify `enrollment_date` is correct in `user_enrollment` table
- Check if date calculation is correct: `CURRENT_DATE - enrollment_date + 1`

### Access Denied Message
- Verify course schedule exists in `course_schedule` table
- Check if previous course is completed
- Verify user's current day is within course range

## Support

For issues or questions:
1. Check database logs for function errors
2. Verify all SQL scripts have been run
3. Check browser console for frontend errors
4. Verify course IDs match between database and SQL script

