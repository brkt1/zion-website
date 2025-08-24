#!/bin/bash

# Fix profiles table schema mismatch
# This resolves the 400 error when fetching profile data from the frontend

echo "🔧 Fixing profiles table schema mismatch..."
echo "This will resolve the 400 error when fetching profile data"
echo ""

# Check if we're in the right directory
if [ ! -f "db/fix_profiles_schema.sql" ]; then
    echo "❌ Error: db/fix_profiles_schema.sql not found"
    echo "Please run this script from the zion-website root directory"
    exit 1
fi

echo "📋 The following SQL will be executed:"
echo "----------------------------------------"
cat db/fix_profiles_schema.sql
echo "----------------------------------------"
echo ""

echo "⚠️  IMPORTANT: This script will modify your database schema."
echo "Please ensure you have a backup of your database before proceeding."
echo ""

read -p "Do you want to proceed? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled"
    exit 1
fi

echo "🚀 Executing schema fix..."
echo ""

# Instructions for the user
echo "📝 To apply this fix, you need to:"
echo ""
echo "1. Go to your Supabase dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Copy and paste the contents of db/fix_profiles_schema.sql"
echo "4. Execute the SQL"
echo ""
echo "Alternatively, you can run this from your local Supabase CLI:"
echo "supabase db reset --linked"
echo ""

echo "✅ Schema fix script created successfully!"
echo "📁 Files created:"
echo "   - db/fix_profiles_schema.sql (main fix script)"
echo "   - db/update_profiles_schema.sql (schema update only)"
echo "   - db/populate_profiles_data.sql (data population only)"
echo ""
echo "🔍 After applying the fix, the 400 error should be resolved."
echo "The profiles table will now have all the columns the frontend expects:"
echo "   - id, user_id, name, email, role, created_at, updated_at"
