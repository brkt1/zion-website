-- Update user_roles table to allow 'event_organizer' role
-- This fixes the check constraint violation error

-- First, drop the existing constraint
ALTER TABLE user_roles 
DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- Add the new constraint that includes 'event_organizer'
ALTER TABLE user_roles 
ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('admin', 'user', 'event_organizer'));

-- Verify the constraint was updated
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'user_roles'::regclass
  AND conname = 'user_roles_role_check';


