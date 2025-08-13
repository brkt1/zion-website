-- Insert emoji game type if it doesn't exist
INSERT INTO public.game_types (name, description) 
VALUES ('emoji', 'Emoji guessing game where players identify emojis to earn points and rewards')
ON CONFLICT (name) DO NOTHING;

-- Get the emoji game type ID for reference
SELECT id, name FROM public.game_types WHERE name = 'emoji';
