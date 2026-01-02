# Course Test Feature Documentation

## Overview

The e-learning system now includes a comprehensive test feature that allows students to take a final test after completing all course weeks. Students must score 75% or higher to graduate.

## Features

- ✅ Test appears automatically after all weeks are completed
- ✅ Passing score: 75% (configurable by admin)
- ✅ Multiple question types: Multiple Choice, True/False, Short Answer
- ✅ Multiple attempts allowed (configurable, default: 3)
- ✅ Optional time limit
- ✅ Automatic graduation upon passing
- ✅ Retake option if failed (within attempt limit)

## Database Setup

### Step 1: Create Test Tables

Run the SQL script in your Supabase SQL Editor:

```bash
docs/scripts/create-course-tests-tables.sql
```

This creates:
- `course_tests` - Test configuration
- `test_questions` - Questions
- `test_results` - Student test results

## Admin Usage

### Creating a Test

1. Go to `/admin/courses`
2. Select a course
3. Scroll to the "Final Test" section
4. Click "Create Test"
5. Fill in:
   - **Title**: Test name
   - **Description**: Optional description
   - **Passing Score**: Minimum score to pass (default: 75%)
   - **Time Limit**: Optional time limit in minutes
   - **Max Attempts**: Maximum retakes allowed (default: 3)
   - **Active**: Enable/disable test

### Adding Questions

1. After creating a test, click "Add Question"
2. Choose question type:
   - **Multiple Choice**: Add options and mark correct answer
   - **True/False**: Set correct answer (True/False)
   - **Short Answer**: Enter correct answer text
3. Set points for each question
4. Save question

### Managing Questions

- Edit: Click edit icon on any question
- Delete: Click delete icon (removes question)
- Reorder: Adjust display_order to change question sequence

## Student Experience

### Taking the Test

1. Complete all weeks and lessons
2. Test automatically appears after all weeks are completed
3. Answer all questions
4. Submit test
5. Results shown immediately:
   - **Pass (≥75%)**: Graduation message and certificate option
   - **Fail (<75%)**: Retake option (if attempts remaining)

### Test Features

- **Progress Indicator**: Shows current question and progress
- **Question Navigation**: Jump to any question
- **Time Limit**: Countdown timer (if enabled)
- **Previous Attempts**: View past test scores
- **Auto-submit**: Test submits when time runs out

## Test Flow

```
Complete All Weeks
       ↓
Test Appears
       ↓
Take Test
       ↓
   Score ≥ 75%?
   ↙        ↘
 YES        NO
   ↓         ↓
Graduate   Retake?
   ↓         ↓
Certificate  (if attempts left)
```

## API Functions

### Test Management
- `adminApi.courseTests.getByCourseId(courseId)` - Get test for course
- `adminApi.courseTests.create(testData)` - Create test
- `adminApi.courseTests.update(id, updates)` - Update test
- `adminApi.courseTests.delete(id)` - Delete test

### Question Management
- `adminApi.testQuestions.getByTestId(testId)` - Get all questions
- `adminApi.testQuestions.create(questionData)` - Create question
- `adminApi.testQuestions.update(id, updates)` - Update question
- `adminApi.testQuestions.delete(id)` - Delete question

### Results
- `adminApi.testResults.getUserResults(testId, userId)` - Get user's all attempts
- `adminApi.testResults.getLatestResult(testId, userId)` - Get latest attempt
- `adminApi.testResults.submitResult(resultData)` - Submit test result

## Configuration

### Default Settings

- **Passing Score**: 75%
- **Max Attempts**: 3
- **Time Limit**: None (optional)

### Customization

All settings can be configured per test in the admin panel.

## Graduation

When a student passes the test (≥75%):

1. ✅ Graduation message displayed
2. ✅ Test score shown
3. ✅ Certificate download option
4. ✅ Test no longer appears (already passed)

## Retake Logic

- If score < 75%: Student can retake
- Maximum attempts enforced
- Previous attempts visible
- Best score tracked

## Files Created

1. **Database Schema**: `docs/scripts/create-course-tests-tables.sql`
2. **Test Component**: `src/components/elearning/CourseTest.tsx`
3. **API Functions**: Added to `src/services/adminApi.ts`
4. **Admin UI**: Updated `src/pages/admin/Courses.tsx`
5. **Student UI**: Updated `src/pages/Elearning.tsx`

## Next Steps

1. Run the SQL script to create tables
2. Create a test in admin panel
3. Add questions to the test
4. Students will see test after completing all weeks
5. Monitor results in admin panel (future feature)

