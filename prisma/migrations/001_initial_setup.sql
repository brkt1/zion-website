-- Initial database setup for Yenege GameHub
-- This migration creates all the necessary tables and relationships

-- Create UserRole enum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'CAFE_OWNER');

-- Create RewardStatus enum
CREATE TYPE "RewardStatus" AS ENUM ('UNCLAIMED', 'CLAIMED', 'EXPIRED');

-- Create game_types table
CREATE TABLE "game_types" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT UNIQUE NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW()
);

-- Create cards table
CREATE TABLE "cards" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "used" BOOLEAN DEFAULT false,
    "gameTypeId" UUID NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
    FOREIGN KEY ("gameTypeId") REFERENCES "game_types"("id")
);

-- Create certificates table
CREATE TABLE "certificates" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "player_name" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "has_won_coffee" BOOLEAN DEFAULT false,
    "has_won_prize" BOOLEAN DEFAULT false,
    "reward_type" TEXT,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "session_id" TEXT NOT NULL,
    "prize_delivered" BOOLEAN DEFAULT false,
    "prize_amount" DECIMAL,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
    "gameTypeId" UUID NOT NULL,
    FOREIGN KEY ("gameTypeId") REFERENCES "game_types"("id")
);

-- Create emoji_certificates table
CREATE TABLE "emoji_certificates" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "player_name" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "has_won_coffee" BOOLEAN DEFAULT false,
    "has_won_prize" BOOLEAN DEFAULT false,
    "reward_type" TEXT,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "session_id" TEXT NOT NULL,
    "prize_delivered" BOOLEAN DEFAULT false,
    "prize_amount" DECIMAL,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
    "gameTypeId" UUID NOT NULL,
    FOREIGN KEY ("gameTypeId") REFERENCES "game_types"("id")
);

-- Create emoji_player_progress table
CREATE TABLE "emoji_player_progress" (
    "player_id" TEXT PRIMARY KEY,
    "current_stage" INTEGER DEFAULT 1,
    "total_wins" INTEGER DEFAULT 0,
    "last_win" TIMESTAMPTZ(6),
    "rewards_claimed" TEXT[] DEFAULT '{}',
    "sessions_played" INTEGER DEFAULT 0
);

-- Create emoji_scores table
CREATE TABLE "emoji_scores" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "player_name" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "stage" INTEGER NOT NULL,
    "session_id" TEXT NOT NULL,
    "streak" INTEGER NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "gameTypeId" UUID NOT NULL,
    FOREIGN KEY ("gameTypeId") REFERENCES "game_types"("id")
);

-- Create emojis table
CREATE TABLE "emojis" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "emoji" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL
);

-- Create questions table
CREATE TABLE "questions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "question" TEXT NOT NULL,
    "options" TEXT[] NOT NULL,
    "correct_option" INTEGER NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "gameTypeId" UUID NOT NULL,
    FOREIGN KEY ("gameTypeId") REFERENCES "game_types"("id")
);

-- Create player_progress table
CREATE TABLE "player_progress" (
    "player_id" TEXT PRIMARY KEY,
    "current_stage" INTEGER DEFAULT 1,
    "total_wins" INTEGER DEFAULT 0,
    "last_win" TIMESTAMPTZ(6),
    "rewards_claimed" TEXT[] DEFAULT '{}',
    "sessions_played" INTEGER DEFAULT 0
);

-- Create scores table
CREATE TABLE "scores" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "player_name" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "stage" INTEGER NOT NULL,
    "session_id" TEXT NOT NULL,
    "streak" INTEGER NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "gameTypeId" UUID NOT NULL,
    FOREIGN KEY ("gameTypeId") REFERENCES "game_types"("id")
);

-- Create rewards table
CREATE TABLE "rewards" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "player_id" TEXT NOT NULL,
    "reward_code" TEXT UNIQUE NOT NULL,
    "reward_details" TEXT NOT NULL,
    "status" "RewardStatus" DEFAULT 'UNCLAIMED',
    "issued_by" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW()
);

-- Create payments table
CREATE TABLE "payments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "player_id" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW()
);

-- Create cafe_owners table
CREATE TABLE "cafe_owners" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW()
);

-- Create users table
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT UNIQUE NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
    "auth_user_id" UUID UNIQUE NOT NULL
);

-- Create profiles table
CREATE TABLE "profiles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID UNIQUE NOT NULL,
    "role" "UserRole" DEFAULT 'USER',
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ(6) DEFAULT NOW(),
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX "cards_game_type_idx" ON "cards"("gameTypeId");
CREATE INDEX "certificates_player_idx" ON "certificates"("player_id");
CREATE INDEX "certificates_session_idx" ON "certificates"("session_id");
CREATE INDEX "certificates_game_type_idx" ON "certificates"("gameTypeId");
CREATE INDEX "emoji_certificates_player_idx" ON "emoji_certificates"("player_id");
CREATE INDEX "emoji_certificates_game_type_idx" ON "emoji_certificates"("gameTypeId");
CREATE INDEX "emoji_scores_player_idx" ON "emoji_scores"("player_id");
CREATE INDEX "emoji_scores_session_idx" ON "emoji_scores"("session_id");
CREATE INDEX "emoji_scores_game_type_idx" ON "emoji_scores"("gameTypeId");
CREATE INDEX "questions_game_type_idx" ON "questions"("gameTypeId");
CREATE INDEX "scores_player_idx" ON "scores"("player_id");
CREATE INDEX "scores_session_idx" ON "scores"("session_id");
CREATE INDEX "scores_game_type_idx" ON "scores"("gameTypeId");
CREATE INDEX "rewards_player_idx" ON "rewards"("player_id");
CREATE INDEX "payments_player_idx" ON "payments"("player_id");
CREATE INDEX "users_auth_user_idx" ON "users"("auth_user_id");
CREATE INDEX "profiles_user_idx" ON "profiles"("user_id");

-- Insert initial game types
INSERT INTO "game_types" ("name", "description") VALUES
('Trivia Challenge', 'Test your knowledge across various categories'),
('Truth or Dare', 'Classic party game for friends and lovers'),
('Rock Paper Scissors', 'The ultimate showdown game'),
('Emoji Game', 'Guess the hidden emoji phrases');

-- Insert sample questions for Trivia Challenge
INSERT INTO "questions" ("question", "options", "correct_option", "difficulty", "gameTypeId") 
SELECT 
    'What is the capital of France?',
    ARRAY['London', 'Berlin', 'Paris', 'Madrid'],
    2,
    1,
    id
FROM "game_types" WHERE "name" = 'Trivia Challenge';

INSERT INTO "questions" ("question", "options", "correct_option", "difficulty", "gameTypeId") 
SELECT 
    'Which planet is known as the Red Planet?',
    ARRAY['Venus', 'Mars', 'Jupiter', 'Saturn'],
    1,
    1,
    id
FROM "game_types" WHERE "name" = 'Trivia Challenge';

-- Insert sample emojis
INSERT INTO "emojis" ("emoji", "title", "difficulty") VALUES
('🍕🏠', 'Pizza House', 1),
('🌙⭐', 'Moonlight', 1),
('🎵🎤', 'Music Singer', 2),
('🏖️🌊', 'Beach Waves', 2),
('🎬🍿', 'Movie Theater', 3);

-- Insert sample cards
INSERT INTO "cards" ("content", "duration", "gameTypeId", "cardNumber") 
SELECT 
    'Premium Game Session - 5 Minutes',
    5,
    id,
    '1234567890123'
FROM "game_types" WHERE "name" = 'Trivia Challenge';

INSERT INTO "cards" ("content", "duration", "gameTypeId", "cardNumber") 
SELECT 
    'Premium Game Session - 10 Minutes',
    10,
    id,
    '1234567890124'
FROM "game_types" WHERE "name" = 'Truth or Dare';
