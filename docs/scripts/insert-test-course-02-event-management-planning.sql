-- Test for Course 02: EVENT MANAGEMENT PLANNING
-- This SQL file creates the test and questions for Course 02

-- Insert Test
INSERT INTO course_tests (id, course_id, title, description, passing_score, time_limit, max_attempts, is_active, display_order)
VALUES (
  'a2a3b4c5-d6e7-4890-a002-234567890123',
  'c2d3e4f5-a6b7-4890-c123-456789012345',
  'Event Management Planning - Final Test',
  'Test your understanding of event planning stages, environmental factors, budgeting, sponsorship, and event timelines.',
  75,
  60,
  3,
  true,
  1
) ON CONFLICT (id) DO NOTHING;

-- Question 1: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a2a3b4c5-d6e7-4890-a002-234567890123',
  'What does PESTEL analysis stand for?',
  'multiple_choice',
  '[
    {"text": "Political, Economic, Social, Technological, Environmental, Legal", "is_correct": true},
    {"text": "Planning, Execution, Strategy, Technology, Environment, Legal", "is_correct": false},
    {"text": "People, Events, Strategy, Technology, Environment, Logistics", "is_correct": false},
    {"text": "Political, Economic, Strategic, Technical, Environmental, Legal", "is_correct": false}
  ]'::jsonb,
  1,
  1
);

-- Question 2: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a2a3b4c5-d6e7-4890-a002-234567890123',
  'What is the optimal size of an event organizing team?',
  'multiple_choice',
  '[
    {"text": "Around six people", "is_correct": true},
    {"text": "Around ten people", "is_correct": false},
    {"text": "Around three people", "is_correct": false},
    {"text": "Around fifteen people", "is_correct": false}
  ]'::jsonb,
  1,
  2
);

-- Question 3: True/False
INSERT INTO test_questions (test_id, question_text, question_type, correct_answer, points, display_order)
VALUES (
  'a2a3b4c5-d6e7-4890-a002-234567890123',
  'Planning is probably the most important phase of organising events.',
  'true_false',
  'true',
  1,
  3
);

-- Question 4: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a2a3b4c5-d6e7-4890-a002-234567890123',
  'Which of the following is NOT typically included in an event budget?',
  'multiple_choice',
  '[
    {"text": "Staff time", "is_correct": false},
    {"text": "Marketing expenses", "is_correct": false},
    {"text": "Personal expenses of organizers", "is_correct": true},
    {"text": "Venue costs", "is_correct": false}
  ]'::jsonb,
  1,
  4
);

-- Question 5: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a2a3b4c5-d6e7-4890-a002-234567890123',
  'What is the first step in Sponsorship Development Plan?',
  'multiple_choice',
  '[
    {"text": "Determine Purpose", "is_correct": false},
    {"text": "Brainstorm", "is_correct": true},
    {"text": "Outreach", "is_correct": false},
    {"text": "Agreement", "is_correct": false}
  ]'::jsonb,
  1,
  5
);

-- Question 6: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a2a3b4c5-d6e7-4890-a002-234567890123',
  'When should you start planning for an event?',
  'multiple_choice',
  '[
    {"text": "One month before", "is_correct": false},
    {"text": "Six months ahead", "is_correct": true},
    {"text": "One week before", "is_correct": false},
    {"text": "On the day of event", "is_correct": false}
  ]'::jsonb,
  1,
  6
);

-- Question 7: True/False
INSERT INTO test_questions (test_id, question_text, question_type, correct_answer, points, display_order)
VALUES (
  'a2a3b4c5-d6e7-4890-a002-234567890123',
  'A site plan should include all entrances, exits, emergency access routes, and facilities.',
  'true_false',
  'true',
  1,
  7
);

-- Question 8: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a2a3b4c5-d6e7-4890-a002-234567890123',
  'Which of the following is a category of risk in event management?',
  'multiple_choice',
  '[
    {"text": "Physical risks", "is_correct": true},
    {"text": "Emotional risks", "is_correct": false},
    {"text": "Social media risks", "is_correct": false},
    {"text": "Digital risks", "is_correct": false}
  ]'::jsonb,
  1,
  8
);

-- Question 9: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a2a3b4c5-d6e7-4890-a002-234567890123',
  'What should be included in post-event activities?',
  'multiple_choice',
  '[
    {"text": "Conduct Post-Event Survey", "is_correct": true},
    {"text": "Start planning next event immediately", "is_correct": false},
    {"text": "Forget about the event", "is_correct": false},
    {"text": "Only send thank you to sponsors", "is_correct": false}
  ]'::jsonb,
  1,
  9
);

-- Question 10: Multiple Choice
INSERT INTO test_questions (test_id, question_text, question_type, options, points, display_order)
VALUES (
  'a2a3b4c5-d6e7-4890-a002-234567890123',
  'SWOT Analysis examines which of the following?',
  'multiple_choice',
  '[
    {"text": "Strengths, Weaknesses, Opportunities, Threats", "is_correct": true},
    {"text": "Strategy, Work, Organization, Time", "is_correct": false},
    {"text": "Success, Workflow, Objectives, Tasks", "is_correct": false},
    {"text": "Strengths, Work, Objectives, Time", "is_correct": false}
  ]'::jsonb,
  1,
  10
);

