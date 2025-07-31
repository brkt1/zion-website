-- Table to track leaderboard bonus grants
CREATE TABLE IF NOT EXISTS leaderboard_bonus (
  id SERIAL PRIMARY KEY,
  player_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  granted_at TIMESTAMP DEFAULT NOW(),
  game_type VARCHAR(50), -- 'emoji' or 'trivia' or NULL for global
  UNIQUE(player_id, session_id, game_type)
);
