# Profiles Schema Fix

## Problem Description

The application is experiencing a **400 error** when trying to fetch profile data from the database. This error occurs because there's a **schema mismatch** between what the frontend code expects and what actually exists in the database.

### Error Details
```
Failed to load resource: the server responded with a status of 400 ()
Profile query error: Object
Error fetching profile or permissions: Object
```

### Root Cause

The frontend code in `src/stores/authStore.ts` is trying to query the `profiles` table with these columns:
```typescript
.select("id, user_id, name, email, role, created_at, updated_at")
```

However, the current `profiles` table schema only contains:
```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    role TEXT NOT NULL DEFAULT 'USER',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Missing columns:**
- `user_id` 
- `name`
- `email`

## Solution

We need to update the database schema to include the missing columns that the frontend expects.

### Files Created

1. **`db/fix_profiles_schema.sql`** - Comprehensive fix script (recommended)
2. **`db/update_profiles_schema.sql`** - Schema update only
3. **`db/populate_profiles_data.sql`** - Data population only
4. **`fix_profiles_schema.sh`** - Helper script to guide the fix

### How to Apply the Fix

#### Option 1: Using the Helper Script (Recommended)
```bash
./fix_profiles_schema.sh
```

#### Option 2: Manual Application

1. **Go to your Supabase dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the contents of `db/fix_profiles_schema.sql`**
4. **Execute the SQL**

#### Option 3: Using Supabase CLI
```bash
supabase db reset --linked
```

### What the Fix Does

1. **Adds missing columns** to the profiles table:
   - `user_id` (UUID, references auth.users)
   - `name` (TEXT)
   - `email` (TEXT)

2. **Populates existing data** from the auth.users table

3. **Creates indexes** for better performance

4. **Adds documentation** to the table and columns

### Expected Result

After applying the fix, the `profiles` table will have this structure:
```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'USER',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Verification

The fix script includes verification steps that will show:
- Updated table schema
- Sample data to confirm the fix worked

### Impact

- ✅ **Fixes the 400 error** when fetching profile data
- ✅ **Maintains backward compatibility** with existing data
- ✅ **Improves performance** with new indexes
- ✅ **Adds proper documentation** to the schema

### Rollback (if needed)

If you need to rollback the changes, you can:
```sql
-- Remove the added columns
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS user_id,
DROP COLUMN IF EXISTS name,
DROP COLUMN IF EXISTS email;

-- Remove the index
DROP INDEX IF EXISTS idx_profiles_user_id;
```

## Support

If you encounter any issues during the fix process, please:
1. Check the Supabase logs for detailed error messages
2. Ensure you have proper database permissions
3. Verify that the auth.users table exists and is accessible
