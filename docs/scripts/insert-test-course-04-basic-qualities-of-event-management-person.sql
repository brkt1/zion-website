-- Test for Course 04: BASIC QUALITIES OF EVENT MANAGEMENT PERSON
-- This SQL file creates the test and questions for Course 04

-- Insert Test
INSERT INTO course_tests (id, course_id, title, description, passing_score, time_limit, max_attempts, is_active, display_order)
VALUES (
  'a4a5b6c7-d8e9-5012-a004-456789012345',
  'a4b5c6d7-e8f9-5012-f345-678901234567',
  'Basic Qualities of Event Management Person - Final Test',
  'Test your understanding of essential skills, knowledge, interpersonal skills, leadership, motivation, and personal etiquettes required for event management.',
  75,
  60,
  3,
  true,
  1
) ON CONFLICT (id) DO NOTHING;

-- Question 1: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a4a5b6c7-d8e9-5012-a004-456789012345',
  'What percentage of their time do event managers usually spend communicating?',
  'multiple_choice',
  '[
    {"text": "Fifty percent", "is_correct": false},
    {"text": "Seventy percent", "is_correct": false},
    {"text": "Ninety percent", "is_correct": true},
    {"text": "Thirty percent", "is_correct": false}
  ]'::jsonb,
  1,
  1
);

-- Question 2: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a4a5b6c7-d8e9-5012-a004-456789012345',
  'Which of the following is NOT a core management skill?',
  'multiple_choice',
  '[
    {"text": "Technical skills", "is_correct": false},
    {"text": "Interpersonal skills", "is_correct": false},
    {"text": "Conceptual skills", "is_correct": false},
    {"text": "Physical skills", "is_correct": true}
  ]'::jsonb,
  1,
  2
);

-- Question 3: True/False
INSERT INTO test_questions (test_id, question_text, question_type, correct_answer, points, display_order)
VALUES (
  'a4a5b6c7-d8e9-5012-a004-456789012345',
  'Success is relationship driven in event management.',
  'true_false',
  'true',
  1,
  3
);

-- Question 4: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a4a5b6c7-d8e9-5012-a004-456789012345',
  'What is the key to effective delegation?',
  'multiple_choice',
  '[
    {"text": "In-depth understanding of individuals'' talents, skills, expertise, and passions", "is_correct": true},
    {"text": "Delegating everything to one person", "is_correct": false},
    {"text": "Not delegating at all", "is_correct": false},
    {"text": "Random assignment", "is_correct": false}
  ]'::jsonb,
  1,
  4
);

-- Question 5: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a4a5b6c7-d8e9-5012-a004-456789012345',
  'Which cultural group tends to be more formal and use surnames in business settings?',
  'multiple_choice',
  '[
    {"text": "Americans", "is_correct": false},
    {"text": "Europeans", "is_correct": true},
    {"text": "Japanese", "is_correct": false},
    {"text": "All groups equally", "is_correct": false}
  ]'::jsonb,
  1,
  5
);

-- Question 6: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a4a5b6c7-d8e9-5012-a004-456789012345',
  'What is problem solving based on?',
  'multiple_choice',
  '[
    {"text": "Root cause analysis", "is_correct": true},
    {"text": "Treating symptoms only", "is_correct": false},
    {"text": "Ignoring problems", "is_correct": false},
    {"text": "Blame assignment", "is_correct": false}
  ]'::jsonb,
  1,
  6
);

-- Question 7: True/False
INSERT INTO test_questions (test_id, question_text, question_type, correct_answer, points, display_order)
VALUES (
  'a4a5b6c7-d8e9-5012-a004-456789012345',
  'Event managers need to be able to effectively multitask.',
  'true_false',
  'true',
  1,
  7
);

-- Question 8: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a4a5b6c7-d8e9-5012-a004-456789012345',
  'What is one of the five elements of business behaviour in etiquette?',
  'multiple_choice',
  '[
    {"text": "Work Behavior", "is_correct": true},
    {"text": "Personal hobbies", "is_correct": false},
    {"text": "Family life", "is_correct": false},
    {"text": "Social media", "is_correct": false}
  ]'::jsonb,
  1,
  8
);

-- Question 9: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a4a5b6c7-d8e9-5012-a004-456789012345',
  'What is the foundation quality for any business success?',
  'multiple_choice',
  '[
    {"text": "Trustworthiness", "is_correct": true},
    {"text": "Wealth", "is_correct": false},
    {"text": "Fame", "is_correct": false},
    {"text": "Location", "is_correct": false}
  ]'::jsonb,
  1,
  9
);

-- Question 10: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a4a5b6c7-d8e9-5012-a004-456789012345',
  'What should event managers do regarding risk management?',
  'multiple_choice',
  '[
    {"text": "Identify risk early and develop mitigation plans", "is_correct": true},
    {"text": "Ignore risks", "is_correct": false},
    {"text": "Only deal with risks when they occur", "is_correct": false},
    {"text": "Avoid all risks", "is_correct": false}
  ]'::jsonb,
  1,
  10
);

