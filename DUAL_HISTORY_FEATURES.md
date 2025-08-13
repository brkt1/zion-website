# Dual History Features

## Overview

This implementation provides **two complementary features** that work together to create a better user experience:

1. **Game History Feature**: Prevents users from seeing games they have already played
2. **Content History Feature**: Prevents users from seeing the same content twice within games

## Feature 1: Game History (Original Request)

### What it does
- **Prevents users from seeing games they have already played**
- Once a user plays any game, that game will no longer appear in their available games list
- Users can only see games they haven't played yet

### How it works
- Tracks which game types each user has played
- Filters the main landing page to only show unplayed games
- Records game history when a game starts and ends

### User Experience
- **First time users**: See all available games
- **Returning users**: Only see games they haven't played yet
- **If all games played**: See "All Games Completed!" message

## Feature 2: Content History (Enhanced Experience)

### What it does
- **Prevents users from seeing the same content twice within games**
- Tracks individual content items (emojis, questions, etc.)
- Ensures users always see fresh content within each game

### How it works
- Tracks which specific content items each user has seen
- Filters content within games to only show unseen items
- Falls back to recently seen content if all items have been seen

### User Experience
- **Within Emoji Game**: Only see emojis they haven't seen before
- **Within Trivia Game**: Only see questions they haven't seen before
- **Fallback**: If all content seen, shows recently seen content

## How Both Features Work Together

### Complete User Journey

1. **User visits landing page**
   - Game History: Shows only games they haven't played
   - If they've played all games, shows "All Games Completed!"

2. **User selects and plays a game**
   - Game History: Records that this game type has been played
   - Content History: Records each content item as it's shown

3. **User returns to landing page**
   - Game History: The played game no longer appears in the list
   - User sees different games to choose from

4. **User plays the same game again** (if they find another way to access it)
   - Game History: Game type is already recorded as played
   - Content History: Only shows content they haven't seen before

## Database Schema

### Game History Table
```sql
CREATE TABLE public.user_game_history (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    player_id uuid NOT NULL REFERENCES auth.users(id),
    game_type_id uuid NOT NULL REFERENCES public.game_types(id),
    first_played_at timestamp with time zone DEFAULT now(),
    last_played_at timestamp with time zone DEFAULT now(),
    total_sessions integer DEFAULT 1,
    total_score integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_game_history_pkey PRIMARY KEY (id),
    CONSTRAINT user_game_history_unique UNIQUE (player_id, game_type_id)
);
```

### Content History Table
```sql
CREATE TABLE public.user_content_history (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    player_id uuid NOT NULL REFERENCES auth.users(id),
    game_type_id uuid NOT NULL REFERENCES public.game_types(id),
    content_id text NOT NULL,
    content_type text NOT NULL,
    first_seen_at timestamp with time zone DEFAULT now(),
    last_seen_at timestamp with time zone DEFAULT now(),
    times_seen integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_content_history_pkey PRIMARY KEY (id),
    CONSTRAINT user_content_history_unique UNIQUE (player_id, game_type_id, content_id)
);
```

## Implementation Details

### Services Used

1. **GameHistoryService** (`src/services/gameHistoryService.ts`)
   - Records when users play games
   - Gets unplayed games for filtering
   - Prevents showing played games

2. **ContentHistoryService** (`src/services/contentHistoryService.ts`)
   - Records when users see specific content
   - Gets unseen content for filtering
   - Prevents showing repeated content

### Component Updates

**MainLanding Component:**
- Uses GameHistoryService to filter available games
- Shows loading states and fallback messages

**EmojiGame Component:**
- Records game history when game starts/ends
- Records content history when emojis are shown
- Fetches unseen emojis for authenticated users

**TriviaGame Component:**
- Records game history when game starts/ends
- Records content history when questions are shown
- Fetches unseen questions for authenticated users

## Setup Instructions

### 1. Run Both Database Migrations

Execute both SQL files in your Supabase SQL editor:

```bash
# Run game history migration
# Copy contents of db/user_game_history.sql

# Run content history migration  
# Copy contents of db/user_content_history.sql
```

### 2. Verify Both Features

```sql
-- Check game history table
SELECT * FROM user_game_history LIMIT 1;

-- Check content history table
SELECT * FROM user_content_history LIMIT 1;

-- Check functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'update_user_game_history', 
    'get_unplayed_games', 
    'update_user_content_history', 
    'get_unseen_emojis', 
    'get_unseen_questions'
);
```

### 3. Test Both Features

1. **Test Game History:**
   - Start the application and log in
   - Play any game (e.g., Emoji Game)
   - Return to main landing page
   - Verify the played game no longer appears

2. **Test Content History:**
   - Play the same game again (if you can access it)
   - Note the specific content you see
   - Play the game multiple times
   - Verify you see different content each time

## User Experience Examples

### Example 1: New User
1. **Landing Page**: Sees all 4 games (Emoji, Trivia, Truth or Dare, Rock Paper Scissors)
2. **Plays Emoji Game**: Sees emojis 🍕, 🚗, 🏠, 🌟
3. **Returns to Landing**: Now sees only 3 games (Trivia, Truth or Dare, Rock Paper Scissors)
4. **Plays Trivia Game**: Sees questions A, B, C, D
5. **Returns to Landing**: Now sees only 2 games (Truth or Dare, Rock Paper Scissors)

### Example 2: Returning User
1. **Landing Page**: Sees only games they haven't played
2. **If all games played**: Sees "All Games Completed!" message
3. **If they access a game directly**: Content history ensures they see fresh content

### Example 3: Content Variety
1. **User plays Emoji Game multiple times** (if they can access it)
2. **First session**: Sees 🍕, 🚗, 🏠, 🌟
3. **Second session**: Sees 🎮, 🎨, 🚀, 🌙
4. **Third session**: Sees 🍕, 🚗, 🏠, 🌟 (fallback to recently seen)

## Benefits of Dual Features

1. **Game Variety**: Users are encouraged to try different games
2. **Content Freshness**: Users always see new content within games
3. **Engagement**: Prevents boredom from repeated content
4. **Discovery**: Guides users to explore all available games
5. **Retention**: Keeps the experience fresh and interesting

## Troubleshooting

### Common Issues

1. **Games not hiding**: Check if user is authenticated and game history is being recorded
2. **Same content showing**: Check if content history is being recorded properly
3. **All games/content hidden**: Verify fallback systems are working

### Debug Commands

```sql
-- Check game history
SELECT * FROM user_game_history WHERE player_id = 'your-user-id';

-- Check content history
SELECT * FROM user_content_history WHERE player_id = 'your-user-id';

-- Check unplayed games
SELECT * FROM get_unplayed_games('your-user-id');

-- Check unseen emojis
SELECT * FROM get_unseen_emojis('your-user-id');
```

## Migration Notes

Both features can work independently:
- **Game History Only**: Prevents game repetition
- **Content History Only**: Prevents content repetition  
- **Both Together**: Provides complete variety and freshness

The implementation ensures both features work seamlessly together while maintaining backward compatibility.
