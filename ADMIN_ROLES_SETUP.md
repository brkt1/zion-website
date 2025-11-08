# Admin Roles Setup Guide

## Current Issue
Right now, the system only checks if a user is **authenticated**, not if they have **admin privileges**. This means any user who can log in can access the admin panel.

## Solution
I've implemented a role-based access control (RBAC) system that checks if a user has the "admin" role.

## Setup Steps

### 1. Create the User Roles Table

Run the SQL in `supabase-user-roles.sql` in your Supabase SQL Editor:

```sql
-- This creates the user_roles table and sets up proper policies
```

### 2. Make a User an Admin

After a user signs up or is created, you need to assign them the admin role. You can do this in two ways:

#### Option A: Via Supabase SQL Editor (Recommended)

```sql
-- Replace 'admin@example.com' with the email of the user you want to make admin
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

#### Option B: Via Supabase Dashboard

1. Go to Authentication > Users
2. Find the user you want to make admin
3. Edit their metadata and add:
   ```json
   {
     "role": "admin"
   }
   ```
   OR
   ```json
   {
     "is_admin": true
   }
   ```

### 3. How It Works

The system now checks admin status in this order:

1. **Primary**: Checks the `user_roles` table for a role = 'admin'
2. **Fallback**: Checks user metadata for `role: 'admin'` or `is_admin: true`

### 4. Security

- Only authenticated users with the "admin" role can access admin pages
- Non-admin users will be redirected to login with an error message
- The check happens on every admin page load

## Testing

1. Create a test user account
2. Try to access `/admin/login` - you should be able to log in
3. Try to access `/admin/dashboard` - you should be redirected with "unauthorized" error
4. Make that user an admin using the SQL above
5. Try again - you should now have access

## Important Notes

- **All existing authenticated users will lose admin access** until you assign them the admin role
- Make sure to assign the admin role to at least one user before testing
- The system falls back to user metadata, so if you've been using metadata, it will still work

