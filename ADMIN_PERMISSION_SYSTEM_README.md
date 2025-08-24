# Admin Permission System

## Overview

The Admin Permission System is a comprehensive role-based access control (RBAC) system that allows super administrators to manage all admin permissions automatically. This system provides granular control over what different types of users can do within the application.

## Features

### 🔐 **Automatic Permission Management**
- **Role-based permissions**: Users automatically get permissions based on their role
- **Custom admin roles**: Super admins can create custom roles with specific permissions
- **Individual user permissions**: Grant/revoke specific permissions to individual users
- **Permission inheritance**: Users get both role-based and individual permissions

### 🎯 **Granular Permission Control**
- **User Management**: Create, edit, delete users, manage roles
- **Content Management**: View, create, edit, delete, approve content
- **Game Management**: Manage games, game types, and settings
- **Card Management**: Generate, scan, and manage cards
- **Database Management**: View, create, modify database structure
- **System Management**: Access system settings, logs, backups
- **Analytics**: View reports, export data, access dashboards
- **Certificate Management**: Generate and manage certificates
- **Winner Management**: Manage winner lists and rewards
- **Cafe Owner Management**: Approve and manage cafe owners

### 🛡️ **Security Features**
- **Row Level Security (RLS)**: Database-level permission enforcement
- **Audit Logging**: Complete record of all admin activities
- **Permission Requests**: Admins can request additional permissions
- **Automatic Expiration**: Permissions can have expiration dates
- **IP Tracking**: Log IP addresses for security monitoring

## Database Schema

### Core Tables

#### 1. `permissions`
Stores all available permissions in the system
```sql
- id: UUID (Primary Key)
- name: TEXT (Permission name, e.g., "CAN_CREATE_USERS")
- description: TEXT (Human-readable description)
- category: TEXT (Grouping, e.g., "user_management")
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 2. `user_permissions`
Assigns specific permissions to individual users
```sql
- id: UUID (Primary Key)
- user_id: UUID (References auth.users)
- permission_id: UUID (References permissions)
- granted_by: UUID (Who granted the permission)
- granted_at: TIMESTAMP
- expires_at: TIMESTAMP (Optional expiration)
```

#### 3. `role_permissions`
Defines default permissions for each role
```sql
- id: UUID (Primary Key)
- role: TEXT (Role name, e.g., "ADMIN")
- permission_id: UUID (References permissions)
- created_at: TIMESTAMP
```

#### 4. `admin_roles`
Custom admin roles created by super admins
```sql
- id: UUID (Primary Key)
- name: TEXT (Role name)
- description: TEXT (Role description)
- created_by: UUID (Who created the role)
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 5. `admin_role_permissions`
Permissions assigned to custom admin roles
```sql
- id: UUID (Primary Key)
- admin_role_id: UUID (References admin_roles)
- permission_id: UUID (References permissions)
- created_at: TIMESTAMP
```

#### 6. `user_admin_roles`
Users assigned to custom admin roles
```sql
- id: UUID (Primary Key)
- user_id: UUID (References auth.users)
- admin_role_id: UUID (References admin_roles)
- assigned_by: UUID (Who assigned the role)
- assigned_at: TIMESTAMP
- expires_at: TIMESTAMP (Optional expiration)
```

#### 7. `permission_requests`
System for admins to request additional permissions
```sql
- id: UUID (Primary Key)
- requester_id: UUID (Who requested the permission)
- permission_id: UUID (What permission was requested)
- reason: TEXT (Why the permission is needed)
- status: TEXT (PENDING, APPROVED, REJECTED)
- reviewed_by: UUID (Who reviewed the request)
- review_notes: TEXT
- created_at: TIMESTAMP
```

#### 8. `admin_activity_log`
Comprehensive audit log of all admin activities
```sql
- id: UUID (Primary Key)
- admin_id: UUID (Who performed the action)
- action: TEXT (What action was performed)
- target_type: TEXT (Type of target affected)
- target_id: UUID (ID of target affected)
- details: JSONB (Additional action details)
- ip_address: INET (IP address of the admin)
- user_agent: TEXT (Browser/client information)
- timestamp: TIMESTAMP
```

## Default Permission Assignments

### SUPER_ADMIN
- **All permissions** - Complete system access
- Can manage all aspects of the system
- Can create/delete other admins
- Can modify system schema and settings

### ADMIN
- **Most permissions** - Extensive system access
- Cannot create/delete other admins
- Cannot modify system schema
- Cannot restart system services
- Cannot manage system-wide permissions

### CAFE_OWNER
- **Limited permissions** - Basic operational access
- Can view users, content, games, cards
- Can use enhanced card features
- Can scan cards
- Can request additional permissions

### USER
- **Basic permissions** - Standard user access
- Access to basic game features
- Profile management

## Installation

### 1. Run the Migration Script
```bash
./run_admin_permission_migration.sh
```

### 2. Manual Installation (if script fails)
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `db/admin_permission_system.sql`
4. Execute the SQL

### 3. Restart Your Application
After the migration, restart your application server to ensure all changes take effect.

## Usage

### For Super Administrators

#### Managing Standard Roles
1. Go to **SuperAdminPanel** → **Roles** tab
2. View current role permissions
3. Modify permissions by checking/unchecking boxes
4. Changes apply to all users with that role

#### Creating Custom Admin Roles
1. Go to **SuperAdminPanel** → **Custom Admin Roles** tab
2. Click **Create Custom Role**
3. Enter role name and description
4. Select specific permissions
5. Save the role

#### Managing Individual Users
1. Go to **SuperAdminPanel** → **Admins** tab
2. View all admin users
3. Click the **Settings** icon to manage individual permissions
4. Grant/revoke specific permissions
5. Create new admin users with custom permissions

#### Permission Requests
1. Go to **SuperAdminPanel** → **Requests** tab
2. View pending permission requests
3. Approve or reject requests with notes
4. Monitor request history

### For Regular Administrators

#### Viewing Your Permissions
1. Go to **AdminPanel** → **Settings**
2. View your current permissions
3. See what actions you can perform

#### Requesting Additional Permissions
1. Go to **AdminPanel** → **Permission Requests**
2. Click **Request Permission**
3. Select the permission you need
4. Provide a reason for the request
5. Submit and wait for super admin approval

## API Endpoints

### Super Admin Routes

#### Permissions
- `GET /api/super-admin/permissions` - Get all permissions
- `POST /api/super-admin/role-permissions` - Grant role permission
- `DELETE /api/super-admin/role-permissions` - Revoke role permission

#### Admin Roles
- `GET /api/super-admin/admin-roles` - Get custom admin roles
- `POST /api/super-admin/admin-roles` - Create custom admin role
- `DELETE /api/super-admin/admin-roles/:id` - Delete custom admin role

#### User Permissions
- `GET /api/super-admin/user-permissions/:userId` - Get user permissions
- `POST /api/super-admin/user-permissions` - Grant user permission
- `DELETE /api/super-admin/user-permissions` - Revoke user permission

#### User Management
- `POST /api/super-admin/create-admin` - Create new admin user
- `DELETE /api/super-admin/delete-admin` - Delete admin user

### Profile Routes
- `GET /api/profile/permissions` - Get current user's permissions

## Security Considerations

### Row Level Security (RLS)
All permission-related tables have RLS policies that ensure:
- Users can only see their own permissions
- Super admins can see and modify all permissions
- Regular users cannot modify permissions

### Audit Logging
Every permission-related action is logged with:
- Who performed the action
- What action was performed
- When it was performed
- IP address and user agent
- Target details

### Permission Validation
The system validates permissions at multiple levels:
- Frontend UI (buttons/features hidden based on permissions)
- API endpoints (middleware checks permissions)
- Database level (RLS policies enforce access)

## Troubleshooting

### Common Issues

#### 1. Permissions Not Loading
- Check if the database migration ran successfully
- Verify the `permissions` table exists and has data
- Check browser console for API errors

#### 2. Users Not Getting Role Permissions
- Ensure the `role_permissions` table has entries for each role
- Check if the `assign_role_permissions` trigger is working
- Verify user profiles have the correct role set

#### 3. Permission Checks Failing
- Check if the `user_permissions` table has the correct entries
- Verify the permission middleware is working
- Check if RLS policies are properly configured

#### 4. Super Admin Access Issues
- Ensure the user has `SUPER_ADMIN` role in the profiles table
- Check if the user has all permissions in `user_permissions`
- Verify the authentication middleware is working

### Debug Steps

1. **Check Database Tables**
   ```sql
   SELECT * FROM permissions LIMIT 5;
   SELECT * FROM role_permissions LIMIT 5;
   SELECT * FROM user_permissions LIMIT 5;
   ```

2. **Check User Permissions**
   ```sql
   SELECT p.name, up.granted_at 
   FROM user_permissions up 
   JOIN permissions p ON up.permission_id = p.id 
   WHERE up.user_id = 'your-user-id';
   ```

3. **Check Role Permissions**
   ```sql
   SELECT p.name, rp.role 
   FROM role_permissions rp 
   JOIN permissions p ON rp.permission_id = p.id 
   WHERE rp.role = 'ADMIN';
   ```

4. **Check RLS Policies**
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
   FROM pg_policies 
   WHERE tablename LIKE '%permission%';
   ```

## Best Practices

### 1. **Principle of Least Privilege**
- Only grant permissions that are absolutely necessary
- Start with role-based permissions and add individual permissions as needed
- Regularly review and audit user permissions

### 2. **Permission Organization**
- Use descriptive permission names (e.g., `CAN_CREATE_USERS`)
- Group related permissions by category
- Document what each permission allows

### 3. **Security Monitoring**
- Regularly review admin activity logs
- Monitor for unusual permission changes
- Set up alerts for critical permission modifications

### 4. **User Management**
- Use custom admin roles for common permission sets
- Implement permission request workflows
- Document permission assignment decisions

### 5. **Testing**
- Test permission checks in development
- Verify RLS policies work correctly
- Test permission inheritance and overrides

## Migration from Old System

If you're migrating from an existing permission system:

1. **Backup your current system**
2. **Run the new migration**
3. **Map old permissions to new ones**
4. **Update your application code**
5. **Test thoroughly**
6. **Deploy to production**

## Support

For issues or questions about the Admin Permission System:

1. Check this README for common solutions
2. Review the database schema and RLS policies
3. Check the admin activity logs for clues
4. Verify permission assignments in the database
5. Test with a super admin account

## Future Enhancements

- **Permission Groups**: Organize permissions into logical groups
- **Time-based Permissions**: Grant permissions for specific time periods
- **Conditional Permissions**: Permissions that depend on other factors
- **Permission Templates**: Predefined permission sets for common roles
- **Advanced Auditing**: More detailed logging and reporting
- **Permission Analytics**: Usage statistics and insights
