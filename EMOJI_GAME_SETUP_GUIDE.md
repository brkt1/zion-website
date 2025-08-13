# 🎮 Emoji Game Setup Guide

## 🚨 Current Issues
- ❌ 400 Bad Request when saving scores
- ❌ 404 Not Found when retrieving results
- ❌ Missing emoji game type in database
- ❌ Table constraints preventing anonymous users

## 🔧 Step-by-Step Fix

### Step 1: Fix Database Schema
Go to your **Supabase Dashboard** → **SQL Editor** and run these commands:

#### 1.1 Insert Emoji Game Type
```sql
INSERT INTO public.game_types (name, description) 
VALUES ('emoji', 'Emoji guessing game where players identify emojis to earn points and rewards')
ON CONFLICT (name) DO NOTHING;

-- Verify it was inserted
SELECT id, name, description FROM public.game_types WHERE name = 'emoji';
```

#### 1.2 Fix Emoji Scores Table (if needed)
If you still get constraint errors, also run:
```sql
-- Remove foreign key constraint
ALTER TABLE public.emoji_scores DROP CONSTRAINT IF EXISTS emoji_scores_player_id_fkey;

-- Make player_id nullable
ALTER TABLE public.emoji_scores ALTER COLUMN player_id DROP NOT NULL;

-- Verify the changes
\d public.emoji_scores
```

### Step 2: Restart Your Server
```bash
# Stop the current server (Ctrl+C)
# Then restart
cd server && npm start
```

### Step 3: Test the Setup
1. **Open your emoji game** in the browser
2. **Check the browser console** for these messages:
   - ✅ Rewards loaded: X
   - ✅ Stage requirements loaded: X  
   - ✅ Emoji game type loaded: [UUID]
   - ✅ Configuration loading completed

3. **Play a quick game** to test score saving
4. **Check the results page** - should no longer get 404

## 🧪 Testing Checklist

- [ ] Emoji game loads without configuration errors
- [ ] Console shows "✅ Emoji game type loaded: [UUID]"
- [ ] Game plays without errors
- [ ] Score saves successfully (check console for "Score saved successfully!")
- [ ] Results page loads without 404 errors
- [ ] Database shows scores in emoji_scores table

## 🔍 Debugging

### If you still get errors:

1. **Check browser console** for specific error messages
2. **Check server console** for route errors
3. **Verify database setup** by running the check script:
   ```bash
   node check_emoji_scores.js
   ```

### Common Error Codes:
- `23503`: Foreign key constraint violation
- `42501`: Permission denied (RLS policy issue)
- `PGRST116`: No rows returned (game type not found)

## 📊 Expected Database State

After setup, you should have:
- ✅ `game_types` table with emoji entry
- ✅ `emoji_scores` table with proper RLS policies
- ✅ Server routes handling both score tables
- ✅ Frontend component with retry logic

## 🚀 What This Fixes

- **Anonymous users** can now save scores
- **Authenticated users** can save scores  
- **Score retrieval** works for both tables
- **Error handling** is more user-friendly
- **Configuration loading** has retry logic
- **Database constraints** are properly managed

## 📞 Need Help?

If you're still having issues:
1. Check the browser console for error messages
2. Verify the database setup with the check script
3. Ensure your server is running and restarted
4. Check that all SQL commands executed successfully

---

**After completing these steps, your emoji game should work perfectly! 🎉**
