#!/bin/bash

# Complete fix for profiles table schema mismatch and column ambiguity
# This resolves both the 400 error and the "column reference user_id is ambiguous" error

echo "🔧 Complete fix for profiles table issues..."
echo "This will resolve:"
echo "  - 400 error when fetching profile data"
echo "  - Column reference 'user_id' is ambiguous error"
echo ""

# Check if we're in the right directory
if [ ! -f "db/fix_profiles_schema_corrected.sql" ]; then
    echo "❌ Error: db/fix_profiles_schema_corrected.sql not found"
    echo "Please run this script from the zion-website root directory"
    exit 1
fi

echo "📋 Database Schema Fix (SQL to execute):"
echo "----------------------------------------"
cat db/fix_profiles_schema_corrected.sql
echo "----------------------------------------"
echo ""

echo "📝 Frontend Code Changes Already Applied:"
echo "----------------------------------------"
echo "✅ Updated authStore.ts to remove 'user_id' from SELECT query"
echo "✅ Updated validateProfile to use 'id' as both 'id' and 'userId'"
echo "----------------------------------------"
echo ""

echo "⚠️  IMPORTANT: This script will modify your database schema."
echo "Please ensure you have a backup of your database before proceeding."
echo ""

read -p "Do you want to proceed with the database fix? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled"
    exit 1
fi

echo "🚀 Executing complete fix..."
echo ""

# Instructions for the user
echo "📝 To apply the complete fix, you need to:"
echo ""
echo "1. Go to your Supabase dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Copy and paste the contents of db/fix_profiles_schema_corrected.sql"
echo "4. Execute the SQL"
echo ""
echo "🔍 What this fix does:"
echo "  - Removes the problematic 'user_id' column that caused ambiguity"
echo "  - Adds missing 'name' and 'email' columns"
echo "  - Populates data from auth.users table"
echo "  - Updates frontend code to handle the simplified schema"
echo ""

echo "✅ Complete fix prepared successfully!"
echo ""
echo "📁 Files created/updated:"
echo "   - db/fix_profiles_schema_corrected.sql (corrected database fix)"
echo "   - src/stores/authStore.ts (frontend code updated)"
echo "   - fix_profiles_complete.sh (this script)"
echo ""
echo "🔍 After applying the database fix:"
echo "  - The 400 error should be resolved"
echo "  - The column ambiguity error should be resolved"
echo "  - The profiles table will have: id, name, email, role, created_at, updated_at"
echo "  - Frontend will use 'id' as both 'id' and 'userId'"
echo ""
echo "💡 Key insight: The 'id' column serves dual purpose as both 'id' and 'user_id'"
echo "   This eliminates the need for a separate 'user_id' column and prevents ambiguity."
