# Permission System Setup Guide

This guide will help you set up the admin and superadmin permission system correctly.

## Current Status

The system currently has:
- ✅ `profiles` table with user roles
- ✅ `permissions` table with available permissions
- ✅ `user_permissions` table for user-specific permissions
- ✅ `admin_activity_log` table for audit logging
- ✅ `permission_requests` table for permission requests
- ✅ `profile_permissions` table (legacy system)

**Missing tables that need to be created:**
- ❌ `role_permissions` - Default permissions for roles
- ❌ `admin_roles` - Custom admin roles
- ❌ `admin_role_permissions` - Permissions for custom roles
- ❌ `user_admin_roles` - User assignments to custom roles

## Step 1: Create Missing Database Tables

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `create_role_permissions_table.sql`
4. Click **Run** to execute the SQL

### Option B: Using Migration Script

If you prefer to use the migration script:

```bash
# Run the migration script
node simple_permission_migration.mjs
```

## Step 2: Verify Table Creation

Run the database state check:

```bash
node check_db_state.mjs
```

You should see:
- ✅ Table 'role_permissions' exists
- ✅ Table 'admin_roles' exists
- ✅ Table 'admin_role_permissions' exists
- ✅ Table 'user_admin_roles' exists

## Step 3: Test the Permission System

### Test User Permissions

```bash
# Check what permissions a user has
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/profile_permissions/permissions
```

### Test Admin Routes

```bash
# Test admin dashboard
curl -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  http://localhost:3000/api/admin/dashboard

# Test super admin routes
curl -H "Authorization: Bearer SUPER_ADMIN_JWT_TOKEN" \
  http://localhost:3000/api/super-admin/dashboard
```

## How the System Works

### 1. **Role Hierarchy**
- **USER** - Basic user with limited access
- **CAFE_OWNER** - Can manage cafe operations
- **ADMIN** - Can manage most system operations
- **SUPER_ADMIN** - Has full system access

### 2. **Permission Assignment**
- **Role-based**: Users automatically get permissions based on their role
- **Individual**: Super admins can grant/revoke specific permissions
- **Custom roles**: Super admins can create custom admin roles

### 3. **Permission Checking**
The system checks permissions in this order:
1. Direct user permissions (`user_permissions` table)
2. Role-based permissions (`role_permissions` table)
3. Denies access if no permission found

### 4. **Database Tables Structure**

#### `role_permissions` table
```sql
id SERIAL PRIMARY KEY,
role TEXT NOT NULL,           -- 'ADMIN', 'SUPER_ADMIN', 'CAFE_OWNER'
permission_name TEXT NOT NULL, -- Permission name
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
UNIQUE(role, permission_name)
```

#### `user_permissions` table
```sql
id UUID PRIMARY KEY,
user_id UUID NOT NULL,        -- References auth.users(id)
permission_name TEXT NOT NULL, -- Permission name
granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

#### `admin_roles` table
```sql
id UUID PRIMARY KEY,
name TEXT NOT NULL UNIQUE,    -- Custom role name
description TEXT,              -- Role description
created_by UUID NOT NULL,     -- Who created this role
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
is_active BOOLEAN DEFAULT true
```

## Step 4: Update Existing Users

After creating the tables, existing users need to be updated with role-based permissions:

```bash
# Run the user update script
node update_existing_users.mjs
```

This will:
1. Read all existing profiles
2. Get role permissions for each user's role
3. Insert user permissions based on their role

## Step 5: Test Admin Features

### Admin Dashboard
- Should show user count, role distribution
- Accessible to users with ADMIN or SUPER_ADMIN role

### Super Admin Panel
- Should show system-wide statistics
- Accessible only to users with SUPER_ADMIN role
- Can manage other admins and permissions

### Permission Management
- Super admins can create custom admin roles
- Super admins can assign/revoke permissions
- All actions are logged for audit purposes

## Troubleshooting

### Common Issues

1. **"relation does not exist" errors**
   - Tables weren't created properly
   - Run the SQL script in Supabase dashboard

2. **Permission denied errors**
   - User doesn't have the required permission
   - Check user's role and role permissions
   - Verify permission names match exactly

3. **Empty permissions array**
   - User has no direct permissions
   - Check if role_permissions table has data
   - Verify user's role is correct

### Debug Commands

```bash
# Check database state
node check_db_state.mjs

# Check permissions data
node check_permissions_data.mjs

# Check specific user permissions
node check_user_permissions.mjs USER_ID
```

## Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only see their own data
- Super admins can see everything

### Audit Logging
- All admin actions are logged
- Includes IP address, user agent, timestamp
- Stored in `admin_activity_log` table

### Permission Requests
- Admins can request additional permissions
- Super admins must approve/reject requests
- Full audit trail maintained

## Next Steps

After setup is complete:

1. **Test all admin routes** to ensure they work correctly
2. **Create custom admin roles** for specific use cases
3. **Set up monitoring** for permission requests and admin activities
4. **Train users** on the new permission system
5. **Document custom roles** and their permissions

## Support

If you encounter issues:

1. Check the database state: `node check_db_state.mjs`
2. Verify table schemas match the expected structure
3. Check user roles and permissions in the database
4. Review the server logs for detailed error messages

The system is designed to be robust and secure, with comprehensive audit logging and flexible permission management.
