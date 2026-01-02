-- Test for Course 01: INTRODUCTION TO EVENT MANAGEMENT
-- This SQL file creates the test and questions for Course 01

-- Insert Test
INSERT INTO course_tests (id, course_id, title, description, passing_score, time_limit, max_attempts, is_active, display_order)
VALUES (
  'a1a2b3c4-d5e6-4789-a001-123456789012',
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  'Introduction to Event Management - Final Test',
  'Test your understanding of event management fundamentals including definitions, classifications, benefits, strategies, and event management functions.',
  75,
  60,
  3,
  true,
  1
) ON CONFLICT (id) DO NOTHING;

-- Question 1: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a1a2b3c4-d5e6-4789-a001-123456789012',
  'According to APEX (2005), an event is defined as:',
  'multiple_choice',
  '[
    {"text": "An organized occasion such as a meeting, convention, exhibition, special event, gala dinner, etc.", "is_correct": true},
    {"text": "A spontaneous gathering of people", "is_correct": false},
    {"text": "Any public celebration", "is_correct": false},
    {"text": "A business meeting only", "is_correct": false}
  ]'::jsonb,
  1,
  1
);

-- Question 2: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a1a2b3c4-d5e6-4789-a001-123456789012',
  'Which of the following is NOT one of the four broad categories of events?',
  'multiple_choice',
  '[
    {"text": "Mega Events", "is_correct": false},
    {"text": "Hallmark Events", "is_correct": false},
    {"text": "Major Events", "is_correct": false},
    {"text": "Corporate Events", "is_correct": true}
  ]'::jsonb,
  1,
  2
);

-- Question 3: True/False
INSERT INTO test_questions (test_id, question_text, question_type, correct_answer, points, display_order)
VALUES (
  'a1a2b3c4-d5e6-4789-a001-123456789012',
  'Hallmark events are so identified with the spirit and soul of a host community that they become synonymous with the name of the place.',
  'true_false',
  'true',
  1,
  3
);

-- Question 4: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a1a2b3c4-d5e6-4789-a001-123456789012',
  'What does SMART stand for in event management objectives?',
  'multiple_choice',
  '[
    {"text": "Specific, Measurable, Agreed, Realistic, Timed", "is_correct": true},
    {"text": "Simple, Manageable, Achievable, Relevant, Timely", "is_correct": false},
    {"text": "Strategic, Measurable, Actionable, Realistic, Timed", "is_correct": false},
    {"text": "Specific, Meaningful, Achievable, Realistic, Timely", "is_correct": false}
  ]'::jsonb,
  1,
  4
);

-- Question 5: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a1a2b3c4-d5e6-4789-a001-123456789012',
  'Which of the following is an example of a Hallmark Event in India?',
  'multiple_choice',
  '[
    {"text": "Olympic Games", "is_correct": false},
    {"text": "Carnival in Goa", "is_correct": true},
    {"text": "Formula One Grand Prix", "is_correct": false},
    {"text": "Local trade fair", "is_correct": false}
  ]'::jsonb,
  1,
  5
);

-- Question 6: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a1a2b3c4-d5e6-4789-a001-123456789012',
  'What is one of the key benefits of hosting major events?',
  'multiple_choice',
  '[
    {"text": "Structural expansion of the visitor economy", "is_correct": true},
    {"text": "Reduced tourism", "is_correct": false},
    {"text": "Decreased community engagement", "is_correct": false},
    {"text": "Lower economic activity", "is_correct": false}
  ]'::jsonb,
  1,
  6
);

-- Question 7: True/False
INSERT INTO test_questions (test_id, question_text, question_type, correct_answer, points, display_order)
VALUES (
  'a1a2b3c4-d5e6-4789-a001-123456789012',
  'Creativity in event management helps companies by opening up new opportunities for problem solving and growth.',
  'true_false',
  'true',
  1,
  7
);

-- Question 8: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a1a2b3c4-d5e6-4789-a001-123456789012',
  'Which of the following is NOT a function of event management?',
  'multiple_choice',
  '[
    {"text": "Planning", "is_correct": false},
    {"text": "Organizing", "is_correct": false},
    {"text": "Marketing", "is_correct": true},
    {"text": "Controlling", "is_correct": false}
  ]'::jsonb,
  1,
  8
);

-- Question 9: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a1a2b3c4-d5e6-4789-a001-123456789012',
  'What is the optimal size of an event organizing team?',
  'multiple_choice',
  '[
    {"text": "Around six people", "is_correct": true},
    {"text": "Around ten people", "is_correct": false},
    {"text": "Around three people", "is_correct": false},
    {"text": "Around fifteen people", "is_correct": false}
  ]'::jsonb,
  1,
  9
);

-- Question 10: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a1a2b3c4-d5e6-4789-a001-123456789012',
  'Events that drive international tourism can be grouped into four main categories. Which of the following is one of them?',
  'multiple_choice',
  '[
    {"text": "Local Events", "is_correct": false},
    {"text": "Niche Events", "is_correct": true},
    {"text": "Private Events", "is_correct": false},
    {"text": "Small Events", "is_correct": false}
  ]'::jsonb,
  1,
  10
);

