-- Fix emoji_scores table to allow anonymous users
-- Make player_id nullable and remove foreign key constraint

-- First, drop the existing foreign key constraint
ALTER TABLE public.emoji_scores DROP CONSTRAINT IF EXISTS emoji_scores_player_id_fkey;

-- Make player_id nullable
ALTER TABLE public.emoji_scores ALTER COLUMN player_id DROP NOT NULL;

-- Update the RLS policies to allow anonymous inserts
DROP POLICY IF EXISTS "Users can insert their own emoji_scores" ON public.emoji_scores;
DROP POLICY IF EXISTS "Users can update their own emoji_scores" ON public.emoji_scores;

-- Create new policies that allow anonymous users
CREATE POLICY "Anyone can insert emoji_scores" ON public.emoji_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update emoji_scores" ON public.emoji_scores FOR UPDATE USING (true);

-- Add a comment explaining the change
COMMENT ON TABLE public.emoji_scores IS 'Scores table for emoji game that allows both authenticated and anonymous users';
COMMENT ON COLUMN public.emoji_scores.player_id IS 'Player ID - can be auth.users(id) for authenticated users or generated UUID for anonymous users';
