-- Add or update ticket scanner user
-- This will add the user if they don't exist, or update if they do
-- Run this in your Supabase SQL Editor

-- Option 1: Update existing record to match login email
UPDATE ticket_scanners
SET email = 'bereketyosef16@gmail.com'
WHERE email = 'bereketyosef49@gmail.com';

-- Option 2: If the update doesn't work, insert a new record (will fail if email already exists)
-- INSERT INTO ticket_scanners (name, email, phone, is_active)
-- VALUES (
--   'Bereket Yosef',
--   'bereketyosef16@gmail.com',
--   '0978639887',
--   true
-- )
-- ON CONFLICT (email) DO UPDATE 
-- SET is_active = true, name = 'Bereket Yosef', phone = '0978639887';

-- Verify the user exists and is active
SELECT * FROM ticket_scanners WHERE email = 'bereketyosef16@gmail.com';

