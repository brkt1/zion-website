-- Enhanced Cards Table
CREATE TABLE IF NOT EXISTS enhanced_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_number VARCHAR(13) UNIQUE NOT NULL,
    duration INTEGER NOT NULL,
    game_type_id UUID NOT NULL REFERENCES game_types(id),
    route_access TEXT[] NOT NULL DEFAULT '{}',
    used BOOLEAN DEFAULT FALSE,
    player_id VARCHAR(8),
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Winner Cards Table
CREATE TABLE IF NOT EXISTS winner_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    winner_card_id VARCHAR(50) UNIQUE NOT NULL,
    player_id VARCHAR(8) NOT NULL,
    player_name VARCHAR(255) NOT NULL,
    game_type VARCHAR(100) NOT NULL,
    score INTEGER NOT NULL,
    prize VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'unclaimed',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    claimed_at TIMESTAMPTZ,
    claimed_by UUID REFERENCES auth.users(id)
);

-- Reward Claims Table (for logging)
CREATE TABLE IF NOT EXISTS reward_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    winner_card_id VARCHAR(50) NOT NULL REFERENCES winner_cards(winner_card_id),
    player_id VARCHAR(8) NOT NULL,
    player_name VARCHAR(255) NOT NULL,
    prize VARCHAR(255) NOT NULL,
    claimed_by UUID NOT NULL REFERENCES auth.users(id),
    claimed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS enhanced_cards_card_number_idx ON enhanced_cards(card_number);
CREATE INDEX IF NOT EXISTS enhanced_cards_game_type_idx ON enhanced_cards(game_type_id);
CREATE INDEX IF NOT EXISTS enhanced_cards_used_idx ON enhanced_cards(used);
CREATE INDEX IF NOT EXISTS enhanced_cards_player_idx ON enhanced_cards(player_id);

CREATE INDEX IF NOT EXISTS winner_cards_winner_card_id_idx ON winner_cards(winner_card_id);
CREATE INDEX IF NOT EXISTS winner_cards_player_id_idx ON winner_cards(player_id);
CREATE INDEX IF NOT EXISTS winner_cards_status_idx ON winner_cards(status);

CREATE INDEX IF NOT EXISTS reward_claims_winner_card_id_idx ON reward_claims(winner_card_id);
CREATE INDEX IF NOT EXISTS reward_claims_player_id_idx ON reward_claims(player_id);
CREATE INDEX IF NOT EXISTS reward_claims_claimed_by_idx ON reward_claims(claimed_by);

-- RLS Policies for enhanced_cards
ALTER TABLE enhanced_cards ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all cards
CREATE POLICY "Allow authenticated users to read enhanced_cards" ON enhanced_cards
    FOR SELECT TO authenticated USING (true);

-- Allow admins to insert cards
CREATE POLICY "Allow admins to insert enhanced_cards" ON enhanced_cards
    FOR INSERT TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );

-- Allow authenticated users to update cards (for marking as used)
CREATE POLICY "Allow authenticated users to update enhanced_cards" ON enhanced_cards
    FOR UPDATE TO authenticated USING (true);

-- RLS Policies for winner_cards
ALTER TABLE winner_cards ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all winner cards
CREATE POLICY "Allow authenticated users to read winner_cards" ON winner_cards
    FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert winner cards
CREATE POLICY "Allow authenticated users to insert winner_cards" ON winner_cards
    FOR INSERT TO authenticated USING (true);

-- Allow cafe owners and admins to update winner cards
CREATE POLICY "Allow cafe owners and admins to update winner_cards" ON winner_cards
    FOR UPDATE TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('ADMIN', 'CAFE_OWNER')
        )
    );

-- RLS Policies for reward_claims
ALTER TABLE reward_claims ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read reward claims
CREATE POLICY "Allow authenticated users to read reward_claims" ON reward_claims
    FOR SELECT TO authenticated USING (true);

-- Allow cafe owners and admins to insert reward claims
CREATE POLICY "Allow cafe owners and admins to insert reward_claims" ON reward_claims
    FOR INSERT TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('ADMIN', 'CAFE_OWNER')
        )
    );

-- Add some sample game types if they don't exist
INSERT INTO game_types (id, name, description) VALUES 
    (gen_random_uuid(), 'Trivia Challenge', 'Test your knowledge with challenging questions'),
    (gen_random_uuid(), 'Truth or Dare', 'Classic party game with fun challenges'),
    (gen_random_uuid(), 'Rock Paper Scissors', 'Strategic hand game tournament'),
    (gen_random_uuid(), 'Emoji Puzzle', 'Guess the meaning behind emoji combinations')
ON CONFLICT (name) DO NOTHING;
