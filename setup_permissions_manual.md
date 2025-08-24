# Manual Permission System Setup

Since you don't have Supabase CLI installed, you need to set up the permission system manually in your Supabase dashboard.

## 🚀 **Step-by-Step Setup**

### 1. **Access Your Supabase Dashboard**
- Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Select your project
- Navigate to **SQL Editor** in the left sidebar

### 2. **Run the Permission System Migration**
1. Click **New Query** in the SQL Editor
2. Copy the **entire contents** of `db/admin_permission_system.sql`
3. Paste it into the query editor
4. Click **Run** to execute the SQL

### 3. **Verify the Setup**
After running the migration, run this query to verify everything was created:

```sql
-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%permission%'
ORDER BY table_name;

-- Check if permissions were inserted
SELECT COUNT(*) as total_permissions FROM permissions;

-- Check if role permissions were set up
SELECT role, COUNT(*) as permission_count 
FROM role_permissions 
GROUP BY role 
ORDER BY role;
```

### 4. **Expected Results**
You should see:
- **8 new tables** created
- **~60+ permissions** inserted
- **Role permissions** set up for SUPER_ADMIN, ADMIN, CAFE_OWNER, and USER

## 🔧 **If Something Goes Wrong**

### **Error: "relation already exists"**
- Some tables might already exist
- This is usually harmless, the system will skip existing tables

### **Error: "permission denied"**
- Make sure you're running as a superuser or have the right permissions
- Check if RLS policies are blocking the operation

### **Error: "function does not exist"**
- The `extensions.uuid_generate_v4()` function might not be available
- Replace it with `gen_random_uuid()` if needed

## 📋 **Alternative: Run SQL in Parts**

If the full migration fails, you can run it in parts:

### **Part 1: Create Tables**
```sql
-- Run just the CREATE TABLE statements first
-- (Lines 1-100 of the migration file)
```

### **Part 2: Insert Data**
```sql
-- Run the INSERT statements for permissions
-- (Lines 100-200 of the migration file)
```

### **Part 3: Set Up RLS**
```sql
-- Run the RLS policy setup
-- (Lines 200-300 of the migration file)
```

### **Part 4: Create Functions**
```sql
-- Run the function and trigger creation
-- (Lines 300-400 of the migration file)
```

## ✅ **After Successful Setup**

1. **Restart your application server**
2. **Test the permission system**:
   - Go to SuperAdminPanel → Roles tab
   - Check if you can see all permissions
   - Try creating a custom admin role

3. **Check the logs** - you should see:
   - No more "No user permissions found" messages
   - Proper permission arrays instead of fallback permissions
   - Full permission sets for each role

## 🆘 **Still Having Issues?**

If you continue to have problems:

1. **Check the Supabase logs** for any SQL errors
2. **Verify your database connection** is working
3. **Check if you have the right database permissions**
4. **Try running the SQL in smaller chunks**

## 📞 **Need Help?**

The permission system is designed to be robust. Once set up correctly, you should see:
- **ADMIN users** get ~50+ permissions automatically
- **SUPER_ADMIN users** get all permissions
- **CAFE_OWNER users** get limited operational permissions
- **Regular users** get basic access permissions

Your current logs show the system is falling back to old permission names, which means the new permission system isn't fully active yet. Running the migration will fix this.
