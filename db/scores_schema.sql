CREATE TABLE public.scores (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    player_id uuid NOT NULL REFERENCES auth.users(id),
    player_name text NOT NULL,
    score integer NOT NULL,
    stage integer DEFAULT 1,
    session_id text,
    streak integer DEFAULT 0,
    game_type_id uuid REFERENCES public.game_types(id),
    timestamp timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT scores_pkey PRIMARY KEY (id)
);

CREATE TABLE public.emoji_scores (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    player_id uuid NOT NULL REFERENCES auth.users(id),
    player_name text NOT NULL,
    score integer NOT NULL,
    stage integer DEFAULT 1,
    session_id text,
    streak integer DEFAULT 0,
    game_type_id uuid REFERENCES public.game_types(id),
    timestamp timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT emoji_scores_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emoji_scores ENABLE ROW LEVEL SECURITY;

-- Policies for scores
CREATE POLICY "Public can view scores" ON public.scores FOR SELECT USING (true);
CREATE POLICY "Users can insert their own scores" ON public.scores FOR INSERT WITH CHECK (auth.uid() = player_id);
CREATE POLICY "Users can update their own scores" ON public.scores FOR UPDATE USING (auth.uid() = player_id);

-- Policies for emoji_scores
CREATE POLICY "Public can view emoji_scores" ON public.emoji_scores FOR SELECT USING (true);
CREATE POLICY "Users can insert their own emoji_scores" ON public.emoji_scores FOR INSERT WITH CHECK (auth.uid() = player_id);
CREATE POLICY "Users can update their own emoji_scores" ON public.emoji_scores FOR UPDATE USING (auth.uid() = player_id);
