-- Test for Course 05: VARIOUS EVENT ACTIVITIES
-- This SQL file creates the test and questions for Course 05

-- Insert Test
INSERT INTO course_tests (id, course_id, title, description, passing_score, time_limit, max_attempts, is_active, display_order)
VALUES (
  'a5a6b7c8-d9e0-6123-a005-567890123456',
  'a5b6c7d8-e9f0-6123-a456-789012345678',
  'Various Event Activities - Final Test',
  'Test your understanding of different types of events including private events, corporate events, conferences, exhibitions, charity events, live events, sports events, and festivals.',
  75,
  60,
  3,
  true,
  1
) ON CONFLICT (id) DO NOTHING;

-- Question 1: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a5a6b7c8-d9e0-6123-a005-567890123456',
  'What does MICE stand for in the context of travel?',
  'multiple_choice',
  '[
    {"text": "Meetings, Incentives, Conferences and Exhibitions", "is_correct": true},
    {"text": "Marketing, Information, Communication, Events", "is_correct": false},
    {"text": "Management, Innovation, Coordination, Execution", "is_correct": false},
    {"text": "Meetings, Information, Conferences, Entertainment", "is_correct": false}
  ]'::jsonb,
  1,
  1
);

-- Question 2: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a5a6b7c8-d9e0-6123-a005-567890123456',
  'Which of the following is an example of a private event?',
  'multiple_choice',
  '[
    {"text": "Wedding", "is_correct": true},
    {"text": "Public festival", "is_correct": false},
    {"text": "Trade show", "is_correct": false},
    {"text": "Sports competition", "is_correct": false}
  ]'::jsonb,
  1,
  2
);

-- Question 3: True/False
INSERT INTO test_questions (test_id, question_text, question_type, correct_answer, points, display_order)
VALUES (
  'a5a6b7c8-d9e0-6123-a005-567890123456',
  'Conferences and seminars are educational events that can be used to quickly upgrade employees'' knowledge base.',
  'true_false',
  'true',
  1,
  3
);

-- Question 4: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a5a6b7c8-d9e0-6123-a005-567890123456',
  'What is the main purpose of exhibitions?',
  'multiple_choice',
  '[
    {"text": "To bring buyers and sellers together and promote trade", "is_correct": true},
    {"text": "To entertain only", "is_correct": false},
    {"text": "To compete", "is_correct": false},
    {"text": "To socialize only", "is_correct": false}
  ]'::jsonb,
  1,
  4
);

-- Question 5: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a5a6b7c8-d9e0-6123-a005-567890123456',
  'Which of the following is a category of exhibitions?',
  'multiple_choice',
  '[
    {"text": "Specialized Trade Fair", "is_correct": true},
    {"text": "Personal Exhibition", "is_correct": false},
    {"text": "Random Exhibition", "is_correct": false},
    {"text": "Temporary Exhibition", "is_correct": false}
  ]'::jsonb,
  1,
  5
);

-- Question 6: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a5a6b7c8-d9e0-6123-a005-567890123456',
  'What is one of the benefits of sports events?',
  'multiple_choice',
  '[
    {"text": "Creates economic growth through filled hotels, restaurants and retail establishments", "is_correct": true},
    {"text": "Reduces tourism", "is_correct": false},
    {"text": "Decreases community support", "is_correct": false},
    {"text": "Lowers economic activity", "is_correct": false}
  ]'::jsonb,
  1,
  6
);

-- Question 7: True/False
INSERT INTO test_questions (test_id, question_text, question_type, correct_answer, points, display_order)
VALUES (
  'a5a6b7c8-d9e0-6123-a005-567890123456',
  'Music festivals reflect social and cultural values.',
  'true_false',
  'true',
  1,
  7
);

-- Question 8: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a5a6b7c8-d9e0-6123-a005-567890123456',
  'What does ITPO stand for?',
  'multiple_choice',
  '[
    {"text": "India Trade Promotion Organisation", "is_correct": true},
    {"text": "International Trade Promotion Office", "is_correct": false},
    {"text": "India Tourism Promotion Office", "is_correct": false},
    {"text": "International Tourism Promotion Organisation", "is_correct": false}
  ]'::jsonb,
  1,
  8
);

-- Question 9: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a5a6b7c8-d9e0-6123-a005-567890123456',
  'Which of the following is one of the seven major motives for festivals?',
  'multiple_choice',
  '[
    {"text": "Novelty", "is_correct": true},
    {"text": "Profit only", "is_correct": false},
    {"text": "Competition", "is_correct": false},
    {"text": "Isolation", "is_correct": false}
  ]'::jsonb,
  1,
  9
);

-- Question 10: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a5a6b7c8-d9e0-6123-a005-567890123456',
  'What is one way to reduce environmental impact of events?',
  'multiple_choice',
  '[
    {"text": "Use minimum amount of energy required", "is_correct": true},
    {"text": "Use maximum energy", "is_correct": false},
    {"text": "Ignore environmental concerns", "is_correct": false},
    {"text": "Use only bottled water", "is_correct": false}
  ]'::jsonb,
  1,
  10
);

