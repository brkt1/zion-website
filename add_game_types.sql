-- Add missing game types to the game_types table
-- Run this in your Supabase SQL editor

-- First, let's check if the table exists and its structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'game_types' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Insert the required game types
-- Note: We'll use only the 'name' column since that's what the functions expect
INSERT INTO public.game_types (name) VALUES 
('emoji'),
('trivia'),
('truth_or_dare'),
('rock_paper_scissors')
ON CONFLICT (name) DO NOTHING;

-- Verify the game types were added
SELECT * FROM public.game_types ORDER BY name;

-- Check that the functions can now find the game types
SELECT 
    'emoji' as game_name,
    (SELECT id FROM game_types WHERE name = 'emoji') as game_id
UNION ALL
SELECT 
    'trivia' as game_name,
    (SELECT id FROM game_types WHERE name = 'trivia') as game_id
UNION ALL
SELECT 
    'truth_or_dare' as game_name,
    (SELECT id FROM game_types WHERE name = 'truth_or_dare') as game_id
UNION ALL
SELECT 
    'rock_paper_scissors' as game_name,
    (SELECT id FROM game_types WHERE name = 'rock_paper_scissors') as game_id;
