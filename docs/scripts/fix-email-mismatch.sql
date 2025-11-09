-- Fix email mismatch for ticket scanner
-- Update the email in ticket_scanners table to match the login email

-- Option 1: Update the ticket_scanners table to use the login email
UPDATE ticket_scanners
SET email = 'bereketyosef16@gmail.com'
WHERE email = 'bereketyosef49@gmail.com';

-- Option 2: If you want to keep the database email, update the auth.users email instead
-- (This requires the user to verify the new email)
-- UPDATE auth.users
-- SET email = 'bereketyosef49@gmail.com'
-- WHERE email = 'bereketyosef16@gmail.com';

