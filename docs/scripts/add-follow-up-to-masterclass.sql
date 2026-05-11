-- Add follow-up capabilities to masterclass reservations
ALTER TABLE masterclass_reservations 
ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMP WITH TIME ZONE;

-- Add index for performance when filtering by follow-up date
CREATE INDEX IF NOT EXISTS idx_masterclass_reservations_follow_up ON masterclass_reservations(follow_up_date);
