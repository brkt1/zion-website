-- Update ticket scanner email to match login email
-- This will update the email in ticket_scanners table to match what you use to log in

UPDATE ticket_scanners
SET email = 'bereketyosef16@gmail.com'
WHERE email = 'bereketyosef49@gmail.com';

-- Verify the update
SELECT * FROM ticket_scanners WHERE email = 'bereketyosef16@gmail.com';

