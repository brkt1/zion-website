# Security Documentation for Admin Access Control

## Overview

This document explains the security model for the admin access control system and how it prevents common security vulnerabilities.

## Security Model

### 1. Role-Based Access Control (RBAC)

The system uses a `user_roles` table to store user roles. Only two roles are supported:
- `admin`: Full access to admin panel
- `user`: Regular user (no admin access)

### 2. Row Level Security (RLS) Policies

#### SELECT Policy: "Users can read their own role"
```sql
CREATE POLICY "Users can read their own role" ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);
```

**Security Benefits:**
- ✅ Users can only read their own role record
- ✅ Prevents users from discovering other users' roles
- ✅ Prevents information leakage
- ✅ Allows the `isAdmin()` function to work correctly

**What it prevents:**
- Users cannot query other users' roles
- Users cannot enumerate admin users
- Users cannot see who has admin access

#### INSERT/UPDATE/DELETE Policies: None (Most Secure)

**Security Benefits:**
- ✅ No regular users can create, modify, or delete roles
- ✅ Only the SERVICE ROLE can modify roles
- ✅ Prevents privilege escalation attacks
- ✅ Prevents self-promotion to admin

**How to grant admin access:**
1. **Supabase SQL Editor** (Recommended)
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('user-id-here', 'admin')
   ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
   ```

2. **Supabase Dashboard**
   - Go to Authentication > Users
   - Edit user metadata and add `{"is_admin": true}` (fallback method)

3. **Backend API** (Future)
   - Use service role key in backend
   - Create an admin-only endpoint to manage roles

## Security Features

### ✅ Prevents Privilege Escalation
- Users cannot modify their own role
- Users cannot grant themselves admin access
- Only service role can modify roles

### ✅ Prevents Information Leakage
- Users can only see their own role
- Users cannot enumerate admin users
- Role information is private

### ✅ Prevents Self-Promotion
- No INSERT/UPDATE/DELETE policies for regular users
- Role changes require database-level access
- Admin privileges can only be granted by trusted administrators

### ✅ Defense in Depth
- Primary: `user_roles` table check
- Fallback: User metadata check (`is_admin: true`)
- Both methods are checked for redundancy

## Common Attack Vectors (Mitigated)

### 1. Self-Promotion Attack
**Attack:** User tries to INSERT/UPDATE their role to 'admin'
**Mitigation:** No INSERT/UPDATE policies exist, only service role can modify

### 2. Role Enumeration Attack
**Attack:** User tries to query all admin users
**Mitigation:** Users can only read their own role record

### 3. Privilege Escalation via API
**Attack:** User tries to call admin API endpoints
**Mitigation:** `isAdmin()` check on every admin page/API call

### 4. Session Hijacking
**Attack:** Attacker steals session token
**Mitigation:** Role is checked on every request, not just login

## Best Practices

### ✅ DO:
- Grant admin access only via Supabase SQL Editor or Dashboard
- Use strong passwords for admin accounts
- Enable 2FA for admin accounts (if available)
- Regularly audit admin users
- Use service role key only in secure backend environments

### ❌ DON'T:
- Don't create INSERT/UPDATE policies for user_roles table
- Don't allow users to modify their own roles
- Don't expose service role key in frontend code
- Don't rely solely on user metadata (use user_roles table)

## Monitoring and Auditing

### Check Current Admin Users
```sql
SELECT 
  ur.user_id,
  ur.role,
  ur.created_at,
  au.email
FROM user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
WHERE ur.role = 'admin';
```

### Check RLS Policies
```sql
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_roles';
```

### Verify No Write Policies Exist
```sql
SELECT 
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'user_roles' 
  AND cmd IN ('INSERT', 'UPDATE', 'DELETE');
-- Should return 0 rows
```

## Troubleshooting

### Issue: "infinite recursion detected in policy"
**Cause:** Policy queries user_roles table to check admin status, triggering itself
**Solution:** Remove the "Admins can read all roles" policy (see `fix-rls-policies.sql`)

### Issue: User has admin role but can't access admin panel
**Causes:**
1. RLS policy blocking the query
2. Session not refreshed
3. User ID mismatch

**Solutions:**
1. Run `fix-rls-policies.sql` to fix RLS policies
2. Sign out and sign back in
3. Verify user_id matches in user_roles table

## Security Checklist

- [ ] RLS is enabled on `user_roles` table
- [ ] Only "Users can read their own role" SELECT policy exists
- [ ] No INSERT/UPDATE/DELETE policies exist
- [ ] Service role key is kept secure (not in frontend)
- [ ] Admin users are regularly audited
- [ ] Strong passwords are used for admin accounts
- [ ] 2FA is enabled for admin accounts (if available)

## Questions?

If you have security concerns or questions, review:
- `fix-rls-policies.sql` - Quick fix for RLS issues
- `secure-rls-policies.sql` - Comprehensive secure setup
- `ADMIN_ROLES_SETUP.md` - Setup guide

