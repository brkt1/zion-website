-- Migration script to update scores table with missing columns
-- Run this script to add the required fields for the game result API

-- Add missing columns to scores table
ALTER TABLE public.scores 
ADD COLUMN IF NOT EXISTS stage integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS session_id text,
ADD COLUMN IF NOT EXISTS streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS game_type_id uuid REFERENCES public.game_types(id),
ADD COLUMN IF NOT EXISTS timestamp timestamp with time zone DEFAULT now();

-- Add missing columns to emoji_scores table
ALTER TABLE public.emoji_scores 
ADD COLUMN IF NOT EXISTS stage integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS session_id text,
ADD COLUMN IF NOT EXISTS streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS game_type_id uuid REFERENCES public.game_types(id),
ADD COLUMN IF NOT EXISTS timestamp timestamp with time zone DEFAULT now();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scores_session_id ON public.scores(session_id);
CREATE INDEX IF NOT EXISTS idx_scores_player_id ON public.scores(player_id);
CREATE INDEX IF NOT EXISTS idx_scores_game_type_id ON public.scores(game_type_id);

CREATE INDEX IF NOT EXISTS idx_emoji_scores_session_id ON public.emoji_scores(session_id);
CREATE INDEX IF NOT EXISTS idx_emoji_scores_player_id ON public.emoji_scores(player_id);
CREATE INDEX IF NOT EXISTS idx_emoji_scores_game_type_id ON public.emoji_scores(game_type_id);

-- Update existing records to have default values
UPDATE public.scores SET 
    stage = COALESCE(stage, 1),
    streak = COALESCE(streak, 0),
    timestamp = COALESCE(timestamp, created_at)
WHERE stage IS NULL OR streak IS NULL OR timestamp IS NULL;

UPDATE public.emoji_scores SET 
    stage = COALESCE(stage, 1),
    streak = COALESCE(streak, 0),
    timestamp = COALESCE(timestamp, created_at)
WHERE stage IS NULL OR streak IS NULL OR timestamp IS NULL;
