-- Create table to track user content history
-- This enables the feature to prevent showing similar content to users who have already seen it

CREATE TABLE public.user_content_history (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    player_id uuid NOT NULL REFERENCES auth.users(id),
    game_type_id uuid NOT NULL REFERENCES public.game_types(id),
    content_id text NOT NULL, -- ID of the specific content item (emoji ID, question ID, etc.)
    content_type text NOT NULL, -- Type of content (emoji, question, card, etc.)
    first_seen_at timestamp with time zone DEFAULT now(),
    last_seen_at timestamp with time zone DEFAULT now(),
    times_seen integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_content_history_pkey PRIMARY KEY (id),
    CONSTRAINT user_content_history_unique UNIQUE (player_id, game_type_id, content_id)
);

-- Create indexes for better performance
CREATE INDEX idx_user_content_history_player_id ON public.user_content_history(player_id);
CREATE INDEX idx_user_content_history_game_type_id ON public.user_content_history(game_type_id);
CREATE INDEX idx_user_content_history_content_id ON public.user_content_history(content_id);
CREATE INDEX idx_user_content_history_content_type ON public.user_content_history(content_type);
CREATE INDEX idx_user_content_history_last_seen ON public.user_content_history(last_seen_at);

-- Enable Row Level Security
ALTER TABLE public.user_content_history ENABLE ROW LEVEL SECURITY;

-- Policies for user_content_history
CREATE POLICY "Users can view their own content history" ON public.user_content_history 
    FOR SELECT USING (auth.uid() = player_id);

CREATE POLICY "Users can insert their own content history" ON public.user_content_history 
    FOR INSERT WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can update their own content history" ON public.user_content_history 
    FOR UPDATE USING (auth.uid() = player_id);

-- Function to update user content history when content is seen
CREATE OR REPLACE FUNCTION update_user_content_history(
    p_player_id uuid,
    p_game_type_id uuid,
    p_content_id text,
    p_content_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_content_history (
        player_id,
        game_type_id,
        content_id,
        content_type,
        last_seen_at
    ) VALUES (
        p_player_id,
        p_game_type_id,
        p_content_id,
        p_content_type,
        now()
    )
    ON CONFLICT (player_id, game_type_id, content_id)
    DO UPDATE SET
        last_seen_at = now(),
        times_seen = user_content_history.times_seen + 1,
        updated_at = now();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_user_content_history(uuid, uuid, text, text) TO authenticated;

-- Function to get unseen content for a specific game type
CREATE OR REPLACE FUNCTION get_unseen_content(
    p_player_id uuid,
    p_game_type_id uuid,
    p_content_type text
)
RETURNS TABLE (
    content_id text,
    content_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This function will be implemented differently for each game type
    -- For now, return empty result
    RETURN QUERY SELECT NULL::text, NULL::jsonb WHERE false;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_unseen_content(uuid, uuid, text) TO authenticated;

-- Function to get unseen emojis for emoji game
CREATE OR REPLACE FUNCTION get_unseen_emojis(p_player_id uuid)
RETURNS TABLE (
    id uuid,
    emoji text,
    title text,
    difficulty integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.emoji,
        e.title,
        e.difficulty
    FROM public.emojis e
    WHERE e.id NOT IN (
        SELECT uch.content_id::uuid 
        FROM public.user_content_history uch 
        WHERE uch.player_id = p_player_id 
        AND uch.game_type_id = (SELECT gt.id FROM game_types gt WHERE gt.name = 'emoji')
        AND uch.content_type = 'emoji'
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_unseen_emojis(uuid) TO authenticated;

-- Function to get unseen questions for trivia game
CREATE OR REPLACE FUNCTION get_unseen_questions(p_player_id uuid)
RETURNS TABLE (
    id uuid,
    question text,
    options jsonb,
    correct_option integer,
    difficulty integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id,
        q.question,
        q.options,
        q.correct_option,
        q.difficulty
    FROM public.quiz_questions q
    WHERE q.id NOT IN (
        SELECT uch.content_id::uuid 
        FROM public.user_content_history uch 
        WHERE uch.player_id = p_player_id 
        AND uch.game_type_id = (SELECT gt.id FROM game_types gt WHERE gt.name = 'trivia')
        AND uch.content_type = 'question'
    );
END;
$$;

-- Function to get unseen truth/dare questions for lovers game
CREATE OR REPLACE FUNCTION get_unseen_lovers_questions(p_player_id uuid, p_type text, p_subtype text)
RETURNS TABLE (
    id uuid,
    content text,
    type text,
    subtype text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id,
        q.content,
        q.type,
        q.subtype
    FROM public.questions q
    WHERE q.type = p_type 
    AND q.subtype = p_subtype
    AND q.id NOT IN (
        SELECT uch.content_id::uuid 
        FROM public.user_content_history uch 
        WHERE uch.player_id = p_player_id 
        AND uch.game_type_id = (SELECT gt.id FROM game_types gt WHERE gt.name = 'truth_or_dare')
        AND uch.content_type = 'lovers_question'
    );
END;
$$;

-- Function to get unseen truth/dare questions for friends game
CREATE OR REPLACE FUNCTION get_unseen_friends_questions(p_player_id uuid, p_type text)
RETURNS TABLE (
    id uuid,
    question text,
    type text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.question,
        f.type
    FROM public.frquetion f
    WHERE f.type = p_type
    AND f.id NOT IN (
        SELECT uch.content_id::uuid 
        FROM public.user_content_history uch 
        WHERE uch.player_id = p_player_id 
        AND uch.game_type_id = (SELECT gt.id FROM game_types gt WHERE gt.name = 'truth_or_dare')
        AND uch.content_type = 'friends_question'
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_unseen_questions(uuid) TO authenticated;

-- Function to check if content has been seen
CREATE OR REPLACE FUNCTION has_seen_content(
    p_player_id uuid,
    p_game_type_id uuid,
    p_content_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_seen boolean;
BEGIN
    SELECT EXISTS(
        SELECT 1 
        FROM public.user_content_history 
        WHERE player_id = p_player_id 
        AND game_type_id = p_game_type_id 
        AND content_id = p_content_id
    ) INTO v_seen;
    
    RETURN v_seen;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION has_seen_content(uuid, uuid, text) TO authenticated;
