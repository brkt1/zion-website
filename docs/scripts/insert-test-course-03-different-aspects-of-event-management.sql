-- Test for Course 03: DIFFERENT ASPECTS OF EVENT MANAGEMENT
-- This SQL file creates the test and questions for Course 03

-- Insert Test
INSERT INTO course_tests (id, course_id, title, description, passing_score, time_limit, max_attempts, is_active, display_order)
VALUES (
  'a3a4b5c6-d7e8-4901-a003-345678901234',
  'e3f4a5b6-c7d8-4901-e234-567890123456',
  'Different Aspects of Event Management - Final Test',
  'Test your understanding of stage management, brand management, budgeting, leadership, and event success evaluation.',
  75,
  60,
  3,
  true,
  1
) ON CONFLICT (id) DO NOTHING;

-- Question 1: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a3a4b5c6-d7e8-4901-a003-345678901234',
  'What is the primary role of a stage manager?',
  'multiple_choice',
  '[
    {"text": "To perform on stage", "is_correct": false},
    {"text": "To coordinate stage crew activities and ensure smooth performance", "is_correct": true},
    {"text": "To sell tickets", "is_correct": false},
    {"text": "To design costumes", "is_correct": false}
  ]'::jsonb,
  1,
  1
);

-- Question 2: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a3a4b5c6-d7e8-4901-a003-345678901234',
  'Which of the following is NOT a component of brand value?',
  'multiple_choice',
  '[
    {"text": "Reputation Value", "is_correct": false},
    {"text": "Relationship Value", "is_correct": false},
    {"text": "Financial Value", "is_correct": true},
    {"text": "Symbolic Value", "is_correct": false}
  ]'::jsonb,
  1,
  2
);

-- Question 3: True/False
INSERT INTO test_questions (test_id, question_text, question_type, correct_answer, points, display_order)
VALUES (
  'a3a4b5c6-d7e8-4901-a003-345678901234',
  'Budget control is a critical responsibility of the event manager.',
  'true_false',
  'true',
  1,
  3
);

-- Question 4: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a3a4b5c6-d7e8-4901-a003-345678901234',
  'What are the three core management skills?',
  'multiple_choice',
  '[
    {"text": "Technical skills, Interpersonal skills, Conceptual skills", "is_correct": true},
    {"text": "Planning skills, Organizing skills, Controlling skills", "is_correct": false},
    {"text": "Communication skills, Leadership skills, Management skills", "is_correct": false},
    {"text": "Budgeting skills, Marketing skills, Operational skills", "is_correct": false}
  ]'::jsonb,
  1,
  4
);

-- Question 5: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a3a4b5c6-d7e8-4901-a003-345678901234',
  'What does KPI stand for?',
  'multiple_choice',
  '[
    {"text": "Key Performance Indicators", "is_correct": true},
    {"text": "Key Planning Indicators", "is_correct": false},
    {"text": "Key Process Indicators", "is_correct": false},
    {"text": "Key Performance Index", "is_correct": false}
  ]'::jsonb,
  1,
  5
);

-- Question 6: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a3a4b5c6-d7e8-4901-a003-345678901234',
  'Which of the following is a determinant of brand management?',
  'multiple_choice',
  '[
    {"text": "Firms", "is_correct": true},
    {"text": "Weather", "is_correct": false},
    {"text": "Location only", "is_correct": false},
    {"text": "Time of day", "is_correct": false}
  ]'::jsonb,
  1,
  6
);

-- Question 7: True/False
INSERT INTO test_questions (test_id, question_text, question_type, correct_answer, points, display_order)
VALUES (
  'a3a4b5c6-d7e8-4901-a003-345678901234',
  'Leadership involves the ability to influence people to take actions toward completing a goal.',
  'true_false',
  'true',
  1,
  7
);

-- Question 8: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a3a4b5c6-d7e8-4901-a003-345678901234',
  'What is the goal of budget management?',
  'multiple_choice',
  '[
    {"text": "To control event costs within approved budget", "is_correct": true},
    {"text": "To spend as much as possible", "is_correct": false},
    {"text": "To avoid budgeting", "is_correct": false},
    {"text": "To exceed the budget", "is_correct": false}
  ]'::jsonb,
  1,
  8
);

-- Question 9: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a3a4b5c6-d7e8-4901-a003-345678901234',
  'Which of the following is a type of budget head?',
  'multiple_choice',
  '[
    {"text": "Human Resources", "is_correct": true},
    {"text": "Personal expenses", "is_correct": false},
    {"text": "Entertainment only", "is_correct": false},
    {"text": "Marketing only", "is_correct": false}
  ]'::jsonb,
  1,
  9
);

-- Question 10: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a3a4b5c6-d7e8-4901-a003-345678901234',
  'Event feedback categories include which of the following?',
  'multiple_choice',
  '[
    {"text": "Operational, Brand Awareness, Customer Satisfaction, Business Impact", "is_correct": true},
    {"text": "Only customer feedback", "is_correct": false},
    {"text": "Only financial feedback", "is_correct": false},
    {"text": "Only operational feedback", "is_correct": false}
  ]'::jsonb,
  1,
  10
);

