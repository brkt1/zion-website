# Commission Seller Authentication System

## Overview

Commission sellers can now log in to view their commission information, but they have **limited access** - they can only see their own data and cannot edit or manage other sellers. Only full admins have full access to manage all commission sellers.

## How It Works

### 1. Authentication Flow

- **Commission sellers** are identified by matching their login email with the `commission_sellers` table
- When a commission seller logs in, they are redirected to `/admin/commission-sellers`
- When a full admin logs in, they are redirected to `/admin/dashboard`

### 2. Access Levels

#### Commission Sellers (Limited Access)
- ✅ Can log in with their email/password
- ✅ Can view their own commission information
- ✅ Can see their commission rate and status
- ❌ Cannot edit their information
- ❌ Cannot add/delete sellers
- ❌ Cannot access other admin pages
- ❌ Cannot see other sellers' information

#### Full Admins
- ✅ Full access to all admin pages
- ✅ Can manage all commission sellers
- ✅ Can add, edit, and delete sellers
- ✅ Can set commission rates

### 3. Database Setup

Run the SQL script `create-commission-sellers-table.sql` in your Supabase SQL Editor. This creates:
- The `commission_sellers` table
- Row Level Security (RLS) policies that allow:
  - Commission sellers to read their own data
  - Admins to read/write all data

### 4. Adding a Commission Seller

1. **Create a user account** in Supabase Authentication (or have them sign up)
2. **Add them to the commission_sellers table** via the admin panel:
   - Go to Admin Dashboard → Commission Sellers
   - Click "Add Seller"
   - Enter their name, email (must match their login email), phone, commission rate, and type
   - Set them as "Active"
3. **They can now log in** using their email and password

### 5. Important Notes

- The email in the `commission_sellers` table **must match** the user's login email exactly (case-insensitive)
- Only **active** commission sellers can log in
- Commission sellers are automatically redirected to their page and cannot access the dashboard
- If a commission seller tries to access other admin pages, they will be redirected to login with an "unauthorized" error

## Security

- Commission sellers can only read their own data (enforced by RLS policies)
- Commission sellers cannot modify any data
- All admin pages (except commission sellers page) still require full admin access
- Authentication is checked on every page load

## Testing

1. Create a test user account in Supabase Authentication
2. Add them as a commission seller in the admin panel
3. Log out and log in as that user
4. You should be redirected to `/admin/commission-sellers` and see only your own information
5. Try accessing `/admin/dashboard` - you should be redirected to login

