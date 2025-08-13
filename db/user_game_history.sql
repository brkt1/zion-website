-- Create table to track user game history
-- This enables the feature to prevent showing similar games to users who have already played one

CREATE TABLE public.user_game_history (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    player_id uuid NOT NULL REFERENCES auth.users(id),
    game_type_id uuid NOT NULL REFERENCES public.game_types(id),
    first_played_at timestamp with time zone DEFAULT now(),
    last_played_at timestamp with time zone DEFAULT now(),
    total_sessions integer DEFAULT 1,
    total_score integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_game_history_pkey PRIMARY KEY (id),
    CONSTRAINT user_game_history_unique UNIQUE (player_id, game_type_id)
);

-- Create indexes for better performance
CREATE INDEX idx_user_game_history_player_id ON public.user_game_history(player_id);
CREATE INDEX idx_user_game_history_game_type_id ON public.user_game_history(game_type_id);
CREATE INDEX idx_user_game_history_last_played ON public.user_game_history(last_played_at);

-- Enable Row Level Security
ALTER TABLE public.user_game_history ENABLE ROW LEVEL SECURITY;

-- Policies for user_game_history
CREATE POLICY "Users can view their own game history" ON public.user_game_history 
    FOR SELECT USING (auth.uid() = player_id);

CREATE POLICY "Users can insert their own game history" ON public.user_game_history 
    FOR INSERT WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can update their own game history" ON public.user_game_history 
    FOR UPDATE USING (auth.uid() = player_id);

-- Function to update user game history when a game is played
CREATE OR REPLACE FUNCTION update_user_game_history(
    p_player_id uuid,
    p_game_type_id uuid,
    p_score integer DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_game_history (
        player_id,
        game_type_id,
        total_score,
        last_played_at
    ) VALUES (
        p_player_id,
        p_game_type_id,
        p_score,
        now()
    )
    ON CONFLICT (player_id, game_type_id)
    DO UPDATE SET
        last_played_at = now(),
        total_sessions = user_game_history.total_sessions + 1,
        total_score = user_game_history.total_score + p_score,
        updated_at = now();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_user_game_history(uuid, uuid, integer) TO authenticated;

-- Function to get games that user has not played yet
CREATE OR REPLACE FUNCTION get_unplayed_games(p_player_id uuid)
RETURNS TABLE (
    game_type_id uuid,
    game_name text,
    game_description text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gt.id,
        gt.name,
        gt.description
    FROM public.game_types gt
    WHERE gt.id NOT IN (
        SELECT ugh.game_type_id 
        FROM public.user_game_history ugh 
        WHERE ugh.player_id = p_player_id
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_unplayed_games(uuid) TO authenticated;

-- Function to get games that user has played
CREATE OR REPLACE FUNCTION get_played_games(p_player_id uuid)
RETURNS TABLE (
    game_type_id uuid,
    game_name text,
    game_description text,
    first_played_at timestamp with time zone,
    last_played_at timestamp with time zone,
    total_sessions integer,
    total_score integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gt.id,
        gt.name,
        gt.description,
        ugh.first_played_at,
        ugh.last_played_at,
        ugh.total_sessions,
        ugh.total_score
    FROM public.user_game_history ugh
    JOIN public.game_types gt ON ugh.game_type_id = gt.id
    WHERE ugh.player_id = p_player_id
    ORDER BY ugh.last_played_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_played_games(uuid) TO authenticated;
