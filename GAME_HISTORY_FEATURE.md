# Game History Feature

## Overview

This feature prevents users from seeing games they have already played. Once a user plays any game, that game will no longer appear in their available games list on the main landing page.

## How It Works

### Database Schema

A new table `user_game_history` tracks which games each user has played:

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

### Key Functions

1. **`update_user_game_history(p_player_id, p_game_type_id, p_score)`** - Records when a user plays a game
2. **`get_unplayed_games(p_player_id)`** - Returns games the user hasn't played yet
3. **`get_played_games(p_player_id)`** - Returns games the user has played

### Frontend Implementation

#### GameHistoryService (`src/services/gameHistoryService.ts`)

Provides methods to:
- Record when a user plays a game
- Get unplayed games for filtering
- Check if a user has played a specific game

#### MainLanding Component Updates

- Filters available games based on user's play history
- Shows loading state while fetching game history
- Displays "All Games Completed!" message when user has played all games
- Falls back to showing all games for unauthenticated users

#### EmojiGame Component Updates

- Records game history when game starts
- Records game history when game ends (with final score)

## Setup Instructions

### 1. Run Database Migration

Execute the SQL in `db/user_game_history.sql` in your Supabase SQL editor:

```bash
# Copy the contents of db/user_game_history.sql and run in Supabase
```

### 2. Verify Migration

Check that the table and functions were created successfully:

```sql
-- Check if table exists
SELECT * FROM user_game_history LIMIT 1;

-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('update_user_game_history', 'get_unplayed_games', 'get_played_games');
```

### 3. Test the Feature

1. Start the application
2. Log in as a user
3. Play any game (e.g., Emoji Game)
4. Return to the main landing page
5. The played game should no longer appear in the available games list

## User Experience

### For Authenticated Users

- Only see games they haven't played yet
- If they've played all games, see a "All Games Completed!" message
- Game history is tracked per user account

### For Unauthenticated Users

- See all available games (no filtering)
- Game history is not tracked

### Loading States

- Shows skeleton loading animation while fetching game history
- Graceful fallback to showing all games if there's an error

## Technical Details

### Game Type Mapping

Games are mapped to database game types:
- Emoji Game → "emoji"
- Truth or Dare → "truth_or_dare" 
- Trivia Challenge → "trivia"
- Rock Paper Scissors → "rock_paper_scissors"

### Error Handling

- If game history service fails, falls back to showing all games
- Game history recording errors don't prevent games from working
- Graceful degradation for network issues

### Performance

- Game history is fetched once when landing page loads
- Cached in component state during session
- Database queries are optimized with proper indexes

## Future Enhancements

Potential improvements to consider:

1. **Time-based Reset**: Allow games to reappear after a certain time period
2. **Score-based Filtering**: Only hide games if user achieved a certain score
3. **Admin Override**: Allow admins to reset user game history
4. **Game Categories**: Group similar games and hide entire categories
5. **Progressive Unlocking**: Unlock new games based on performance in played games

## Troubleshooting

### Common Issues

1. **Games not hiding**: Check if user is authenticated and game history is being recorded
2. **All games hidden**: Verify game type names match between frontend and database
3. **Migration errors**: Ensure all SQL statements in `user_game_history.sql` were executed

### Debug Commands

```sql
-- Check user's game history
SELECT * FROM user_game_history WHERE player_id = 'your-user-id';

-- Check unplayed games for user
SELECT * FROM get_unplayed_games('your-user-id');

-- Check played games for user  
SELECT * FROM get_played_games('your-user-id');
```
