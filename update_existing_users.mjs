import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

async function updateExistingUsers() {
  console.log('🚀 Updating Existing Users with Role-Based Permissions...\n');

  try {
    // Step 1: Check if role_permissions table exists
    console.log('📋 Step 1: Checking if role_permissions table exists...');
    
    try {
      const { data: rolePerms, error: rolePermsError } = await supabase
        .from('role_permissions')
        .select('role, permission_name')
        .limit(1);
      
      if (rolePermsError) {
        console.log('❌ role_permissions table does not exist or is not accessible');
        console.log('Please run the SQL script in your Supabase dashboard first:');
        console.log('1. Go to Supabase Dashboard > SQL Editor');
        console.log('2. Copy and paste the contents of create_role_permissions_table.sql');
        console.log('3. Click Run');
        console.log('4. Then run this script again');
        return;
      }
      
      console.log('✅ role_permissions table exists and is accessible');
    } catch (e) {
      console.log('❌ Error checking role_permissions table:', e.message);
      return;
    }

    // Step 2: Get all existing profiles
    console.log('\n📋 Step 2: Getting existing profiles...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role, created_at');
    
    if (profilesError) {
      console.log('❌ Could not fetch profiles:', profilesError.message);
      return;
    }
    
    console.log(`Found ${profiles.length} profiles to update`);
    
    // Step 3: Update each user with role-based permissions
    console.log('\n📋 Step 3: Updating users with role-based permissions...');
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const profile of profiles) {
      if (!profile.role) {
        console.log(`⚠️  User ${profile.email || profile.id} has no role, skipping...`);
        skippedCount++;
        continue;
      }
      
      console.log(`\n🔄 Updating user: ${profile.email || profile.id} (Role: ${profile.role})`);
      
      try {
        // Get role permissions for this user's role
        const { data: rolePerms, error: rolePermsError } = await supabase
          .from('role_permissions')
          .select('permission_name')
          .eq('role', profile.role.toUpperCase());
        
        if (rolePermsError) {
          console.log(`  ❌ Could not get role permissions for ${profile.role}:`, rolePermsError.message);
          skippedCount++;
          continue;
        }
        
        if (!rolePerms || rolePerms.length === 0) {
          console.log(`  ⚠️  No role permissions found for role ${profile.role}`);
          skippedCount++;
          continue;
        }
        
        console.log(`  📋 Found ${rolePerms.length} permissions for role ${profile.role}`);
        
        // Check existing user permissions
        const { data: existingPerms, error: existingPermsError } = await supabase
          .from('user_permissions')
          .select('permission_name')
          .eq('user_id', profile.id);
        
        if (existingPermsError) {
          console.log(`  ⚠️  Could not check existing permissions:`, existingPermsError.message);
        }
        
        const existingPermissionNames = existingPerms ? existingPerms.map(p => p.permission_name) : [];
        console.log(`  📋 User already has ${existingPermissionNames.length} permissions`);
        
        // Insert missing permissions
        let insertedCount = 0;
        for (const rolePerm of rolePerms) {
          if (!existingPermissionNames.includes(rolePerm.permission_name)) {
            try {
              const { error } = await supabase
                .from('user_permissions')
                .insert({
                  user_id: profile.id,
                  permission_name: rolePerm.permission_name,
                  granted_at: new Date().toISOString()
                });
              
              if (error) {
                if (error.message.includes('duplicate key')) {
                  console.log(`    ⚠️  Permission ${rolePerm.permission_name} already exists`);
                } else {
                  console.log(`    ❌ Error inserting permission ${rolePerm.permission_name}:`, error.message);
                }
              } else {
                console.log(`    ✅ Added permission: ${rolePerm.permission_name}`);
                insertedCount++;
              }
            } catch (e) {
              if (e.message.includes('duplicate key')) {
                console.log(`    ⚠️  Permission ${rolePerm.permission_name} already exists`);
              } else {
                console.log(`    ❌ Error inserting permission ${rolePerm.permission_name}:`, e.message);
              }
            }
          } else {
            console.log(`    ⏭️  Permission ${rolePerm.permission_name} already exists, skipping`);
          }
        }
        
        if (insertedCount > 0) {
          console.log(`  ✅ Added ${insertedCount} new permissions`);
          updatedCount++;
        } else {
          console.log(`  ⏭️  No new permissions needed`);
          updatedCount++;
        }
        
      } catch (error) {
        console.log(`  ❌ Error updating user ${profile.email || profile.id}:`, error.message);
        skippedCount++;
      }
    }
    
    // Step 4: Summary
    console.log('\n🎉 User Update Completed!');
    console.log('\n📊 Summary:');
    console.log(`✅ Successfully updated: ${updatedCount} users`);
    console.log(`⚠️  Skipped: ${skippedCount} users`);
    console.log(`📋 Total profiles processed: ${profiles.length}`);
    
    if (updatedCount > 0) {
      console.log('\n🔍 Next steps:');
      console.log('1. Test the permission system with different user roles');
      console.log('2. Verify admin routes work correctly');
      console.log('3. Check that users can access features based on their permissions');
      
      console.log('\n🧪 Test commands:');
      console.log('# Check user permissions');
      console.log('curl -H "Authorization: Bearer USER_JWT_TOKEN" \\');
      console.log('  http://localhost:3000/api/profile_permissions/permissions');
      
      console.log('\n# Test admin dashboard');
      console.log('curl -H "Authorization: Bearer ADMIN_JWT_TOKEN" \\');
      console.log('  http://localhost:3000/api/admin/dashboard');
    }
    
  } catch (error) {
    console.error('❌ Update failed:', error);
  }
}

updateExistingUsers();
