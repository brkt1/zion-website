-- Add player_id column to winners table
ALTER TABLE winners 
ADD COLUMN player_id UUID;

-- Update existing rows to have a UUID
-- This will generate new UUIDs for existing winners
UPDATE winners 
SET player_id = gen_random_uuid()
WHERE player_id IS NULL;

-- Make player_id NOT NULL after updating existing rows
ALTER TABLE winners 
ALTER COLUMN player_id SET NOT NULL;

-- Add unique constraint to player_id
ALTER TABLE winners 
ADD CONSTRAINT winners_player_id_key UNIQUE (player_id);

-- Add index on player_id for faster lookups
CREATE INDEX idx_winners_player_id ON winners(player_id);
