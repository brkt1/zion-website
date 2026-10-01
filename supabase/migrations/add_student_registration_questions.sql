-- Migration: Add Event Industry Interest & Registration Form fields to masterclass_reservations
-- Run this in your Supabase SQL Editor to support the new Yenege Academy registration form fields.

ALTER TABLE masterclass_reservations 
ADD COLUMN IF NOT EXISTS describe_you TEXT,
ADD COLUMN IF NOT EXISTS event_types TEXT,
ADD COLUMN IF NOT EXISTS preferred_schedule TEXT,
ADD COLUMN IF NOT EXISTS learning_mode TEXT,
ADD COLUMN IF NOT EXISTS opportunity_interest TEXT,
ADD COLUMN IF NOT EXISTS marketing_source TEXT,
ADD COLUMN IF NOT EXISTS learning_goals TEXT,
ADD COLUMN IF NOT EXISTS contact_consent TEXT;

-- Verify columns and add helpful comments
COMMENT ON COLUMN masterclass_reservations.describe_you IS 'Best description of the student (e.g. Student, Graduate, Professional, etc.)';
COMMENT ON COLUMN masterclass_reservations.event_types IS 'Comma-separated event types the student wants to work on (Corporate, Social, Cultural, etc.)';
COMMENT ON COLUMN masterclass_reservations.preferred_schedule IS 'Preferred program schedule (Option 1, 2, 3 or 4)';
COMMENT ON COLUMN masterclass_reservations.learning_mode IS 'Preferred learning mode: In-person (15,000 ETB), Online (5,000 ETB), Hybrid (10,000 ETB)';
COMMENT ON COLUMN masterclass_reservations.opportunity_interest IS 'Comma-separated list of opportunities they are seeking (e.g. Learning, practical experience, networking, etc.)';
COMMENT ON COLUMN masterclass_reservations.marketing_source IS 'How they heard about Yenege Academy (TikTok, Telegram, Instagram, etc.)';
COMMENT ON COLUMN masterclass_reservations.learning_goals IS 'What they want to learn or achieve in the event industry (Long answer)';
COMMENT ON COLUMN masterclass_reservations.contact_consent IS 'Whether they want to be contacted by the team about programs (Yes, Send info first, Not right now)';
