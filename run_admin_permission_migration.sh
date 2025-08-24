#!/bin/bash

# Admin Permission System Migration Script
# This script will set up the comprehensive admin permission system

echo "🚀 Starting Admin Permission System Migration..."

# Check if we're in the right directory
if [ ! -f "db/admin_permission_system.sql" ]; then
    echo "❌ Error: admin_permission_system.sql not found in db/ directory"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Warning: Supabase CLI not found. You may need to run the SQL manually."
    echo "You can copy the contents of db/admin_permission_system.sql and run it in your Supabase dashboard."
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Function to run SQL migration
run_migration() {
    local sql_file=$1
    local description=$2
    
    echo "📋 Running: $description"
    
    if command -v supabase &> /dev/null; then
        # Try to use Supabase CLI
        echo "Using Supabase CLI..."
        supabase db reset --linked
        if [ $? -eq 0 ]; then
            echo "✅ $description completed successfully"
        else
            echo "❌ Failed to run migration with Supabase CLI"
            echo "Please run the SQL manually in your Supabase dashboard"
            return 1
        fi
    else
        echo "⚠️  Supabase CLI not available. Please run the SQL manually:"
        echo "1. Go to your Supabase dashboard"
        echo "2. Navigate to SQL Editor"
        echo "3. Copy and paste the contents of $sql_file"
        echo "4. Execute the SQL"
        echo ""
        read -p "Press Enter when you've completed the manual migration..."
    fi
}

# Run the main migration
run_migration "db/admin_permission_system.sql" "Admin Permission System Setup"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Migration completed successfully!"
    echo ""
    echo "What was created:"
    echo "✅ permissions table - All available system permissions"
    echo "✅ user_permissions table - User-specific permissions"
    echo "✅ role_permissions table - Default permissions for roles"
    echo "✅ admin_roles table - Custom admin roles"
    echo "✅ admin_role_permissions table - Permissions for custom roles"
    echo "✅ user_admin_roles table - User assignments to custom roles"
    echo "✅ permission_requests table - Permission request system"
    echo "✅ admin_activity_log table - Comprehensive audit logging"
    echo ""
    echo "Default permissions assigned:"
    echo "🔑 SUPER_ADMIN - All permissions"
    echo "🔑 ADMIN - Most permissions (excluding super admin specific ones)"
    echo "🔑 CAFE_OWNER - Limited permissions for cafe operations"
    echo ""
    echo "Next steps:"
    echo "1. Restart your application server"
    echo "2. Test the new permission system"
    echo "3. Use the SuperAdminPanel to manage permissions"
    echo ""
    echo "The system will automatically assign role-based permissions to new users!"
else
    echo ""
    echo "❌ Migration failed. Please check the errors above and try again."
    exit 1
fi
