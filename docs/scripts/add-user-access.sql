-- Add user access to the system
-- Replace 'bereketyosef16@gmail.com' with the actual email address
-- Run this in your Supabase SQL Editor

-- Option 1: Make user an ADMIN (full access to everything)
-- Uncomment and run this if you want to make them an admin:
/*
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'bereketyosef16@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
*/

-- Option 2: Add user as a COMMISSION SELLER
-- Uncomment and run this if you want to make them a commission seller:
/*
INSERT INTO commission_sellers (name, email, phone, commission_rate, commission_type, is_active)
VALUES (
  'Bereket Yosef',  -- Replace with actual name
  'bereketyosef16@gmail.com',
  '+251978639887',  -- Replace with actual phone if needed
  35,  -- Commission rate
  'percentage',  -- or 'fixed'
  true
)
ON CONFLICT (email) DO UPDATE SET is_active = true;
*/

-- Option 3: Add user as a TICKET SCANNER
-- Uncomment and run this if you want to make them a ticket scanner:
/*
INSERT INTO ticket_scanners (name, email, phone, is_active)
VALUES (
  'Bereket Yosef',  -- Replace with actual name
  'bereketyosef16@gmail.com',
  '+251978639887',  -- Replace with actual phone if needed
  true
)
ON CONFLICT (email) DO UPDATE SET is_active = true;
*/

-- To check what role a user currently has:
/*
SELECT 
  u.email,
  ur.role as user_role,
  cs.name as commission_seller_name,
  cs.is_active as seller_active,
  ts.name as scanner_name,
  ts.is_active as scanner_active
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN commission_sellers cs ON cs.email = u.email
LEFT JOIN ticket_scanners ts ON ts.email = u.email
WHERE u.email = 'bereketyosef16@gmail.com';
*/

