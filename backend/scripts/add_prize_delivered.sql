-- Add prize_delivered column to winners table
ALTER TABLE winners 
ADD COLUMN prize_delivered BOOLEAN DEFAULT FALSE;

-- Update existing rows to have prize_delivered set to false
UPDATE winners 
SET prize_delivered = FALSE 
WHERE prize_delivered IS NULL;
