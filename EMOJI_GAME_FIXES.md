# Emoji Game Fixes

## Issues Identified

1. **400 Bad Request for emoji_scores**: The table expects `player_id` to reference `auth.users(id)`, but anonymous users generate UUIDs that don't exist in auth table.

2. **404 for scores/result**: The server is looking for scores in the `scores` table, but emoji game saves to `emoji_scores` table.

3. **Field mismatch**: The code tries to insert `game_type: "emoji"` but the table expects `game_type_id: uuid`.

## Fixes Applied

### 1. Database Schema Updates

Run these SQL scripts in your Supabase database:

```sql
-- Fix emoji_scores table to allow anonymous users
-- File: db/fix_emoji_scores_anonymous.sql

-- Insert emoji game type
-- File: db/insert_emoji_game_type.sql
```

### 2. Code Updates

- ✅ Updated `scoreRoutes.js` to check both `emoji_scores` and `scores` tables
- ✅ Fixed `EmojiGame.tsx` to use `game_type_id` instead of `game_type`
- ✅ Added logic to fetch emoji game type ID from database
- ✅ Added better error handling and logging

### 3. Steps to Fix

1. **Run the database migrations** in Supabase:
   ```sql
   -- Run fix_emoji_scores_anonymous.sql first
   -- Then run insert_emoji_game_type.sql
   ```

2. **Restart your server** to pick up the route changes

3. **Test the emoji game** - it should now save scores successfully

## What Was Fixed

- **Anonymous users**: Can now save scores without authentication
- **Game type**: Properly references the game_types table
- **Server routes**: Now handle both emoji_scores and scores tables
- **Error handling**: Better logging and error messages

## Testing

After applying fixes:
1. Start a new emoji game as an anonymous user
2. Complete the game and check console for successful score save
3. Navigate to results page - should no longer get 404
4. Check Supabase dashboard to confirm scores are being saved

## Notes

- The `emoji_scores` table now allows anonymous inserts
- Both authenticated and anonymous users can save scores
- The server will check both tables for results
- All existing functionality is preserved
