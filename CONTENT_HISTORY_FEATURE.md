# Content History Feature

## Overview

This feature prevents users from seeing **the same content** twice within games. Users can play any game they want, but they will never see the same content (emojis, questions, etc.) twice.

## How It Works

### Database Schema

A new table `user_content_history` tracks which specific content items each user has seen:

```sql
CREATE TABLE public.user_content_history (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    player_id uuid NOT NULL REFERENCES auth.users(id),
    game_type_id uuid NOT NULL REFERENCES public.game_types(id),
    content_id text NOT NULL, -- ID of the specific content item (emoji ID, question ID, etc.)
    content_type text NOT NULL, -- Type of content (emoji, question, card, etc.)
    first_seen_at timestamp with time zone DEFAULT now(),
    last_seen_at timestamp with time zone DEFAULT now(),
    times_seen integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_content_history_pkey PRIMARY KEY (id),
    CONSTRAINT user_content_history_unique UNIQUE (player_id, game_type_id, content_id)
);
```

### Key Functions

1. **`update_user_content_history(p_player_id, p_game_type_id, p_content_id, p_content_type)`** - Records when a user sees specific content
2. **`get_unseen_emojis(p_player_id)`** - Returns emojis the user hasn't seen yet
3. **`get_unseen_questions(p_player_id)`** - Returns questions the user hasn't seen yet
4. **`has_seen_content(p_player_id, p_game_type_id, p_content_id)`** - Checks if user has seen specific content

### Frontend Implementation

#### ContentHistoryService (`src/services/contentHistoryService.ts`)

Provides methods to:
- Record when a user sees specific content
- Get unseen content for filtering
- Check if a user has seen specific content
- Get fallback content when all content has been seen

#### Game Component Updates

**EmojiGame Component:**
- Fetches only unseen emojis for authenticated users
- Records each emoji as "seen" when it's displayed
- Falls back to recently seen emojis if all have been seen
- Uses original method for unauthenticated users

**TriviaGame Component:**
- Fetches only unseen questions for authenticated users
- Records each question as "seen" when it's displayed
- Falls back to recently seen questions if all have been seen
- Uses original method for unauthenticated users

## Setup Instructions

### 1. Run Database Migration

Execute the SQL in `db/user_content_history.sql` in your Supabase SQL editor:

```bash
# Copy the contents of db/user_content_history.sql and run in Supabase
```

### 2. Verify Migration

Check that the table and functions were created successfully:

```sql
-- Check if table exists
SELECT * FROM user_content_history LIMIT 1;

-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('update_user_content_history', 'get_unseen_emojis', 'get_unseen_questions', 'has_seen_content');
```

### 3. Test the Feature

1. Start the application
2. Log in as a user
3. Play the Emoji Game or Trivia Game
4. Note the specific emojis/questions you see
5. Play the same game again
6. Verify you see different emojis/questions (not the same ones)

## User Experience

### For Authenticated Users

- **All games available**: Can play any game they want
- **Emoji Game**: Only see emojis they haven't seen before
- **Trivia Game**: Only see questions they haven't seen before
- **Fallback System**: If all content has been seen, shows recently seen content
- **Content Tracking**: Each specific item is tracked individually

### For Unauthenticated Users

- See all available content (no filtering)
- Content history is not tracked

### Content Types Supported

- **Emojis**: Individual emoji items with their titles
- **Questions**: Individual trivia questions with options
- **Extensible**: System can be extended for other content types

## Technical Details

### Content Recording

Content is recorded as "seen" when:
- **Emoji Game**: An emoji is displayed to the user
- **Trivia Game**: A question is shown to the user

### Fallback Strategy

When a user has seen all available content:
1. System fetches recently seen content (last 20 items)
2. Shows this content to ensure the game can continue
3. Continues to track new "views" of this content

### Performance Optimizations

- Database indexes on frequently queried columns
- Efficient queries to get unseen content
- Fallback content is cached and reused
- Error handling with graceful degradation

### Error Handling

- If content history service fails, falls back to original method
- Content recording errors don't prevent games from working
- Graceful degradation for network issues

## Example Scenarios

### Scenario 1: First Time Player
1. User plays Emoji Game for the first time
2. Sees emojis: 🍕, 🚗, 🏠, 🌟
3. These emojis are recorded as "seen"
4. Next time they play, they'll see different emojis

### Scenario 2: Returning Player
1. User plays Emoji Game again
2. System fetches unseen emojis
3. User sees: 🎮, 🎨, 🚀, 🌙
4. These are also recorded as "seen"

### Scenario 3: All Content Seen
1. User has seen all available emojis
2. System fetches recently seen emojis as fallback
3. User sees some previously seen emojis
4. System continues to track views

## Database Queries

### Get Unseen Emojis
```sql
SELECT e.id, e.emoji, e.title, e.difficulty
FROM emojis e
WHERE e.id NOT IN (
    SELECT uch.content_id::uuid 
    FROM user_content_history uch 
    WHERE uch.player_id = 'user-id' 
    AND uch.game_type_id = (SELECT id FROM game_types WHERE name = 'emoji')
    AND uch.content_type = 'emoji'
);
```

### Record Content as Seen
```sql
INSERT INTO user_content_history (
    player_id, game_type_id, content_id, content_type, last_seen_at
) VALUES (
    'user-id', 'game-type-id', 'content-id', 'emoji', now()
)
ON CONFLICT (player_id, game_type_id, content_id)
DO UPDATE SET
    last_seen_at = now(),
    times_seen = user_content_history.times_seen + 1,
    updated_at = now();
```

## Future Enhancements

Potential improvements to consider:

1. **Time-based Reset**: Allow content to reappear after a certain time period
2. **Difficulty-based Filtering**: Show easier content first, then harder content
3. **Content Categories**: Group content by themes or categories
4. **User Preferences**: Allow users to mark content as "favorite" or "skip"
5. **Content Rotation**: Implement seasonal or themed content rotation
6. **Analytics**: Track which content is most/least popular

## Troubleshooting

### Common Issues

1. **Same content showing**: Check if user is authenticated and content history is being recorded
2. **No content available**: Verify content exists in the database
3. **Migration errors**: Ensure all SQL statements in `user_content_history.sql` were executed

### Debug Commands

```sql
-- Check user's content history
SELECT * FROM user_content_history WHERE player_id = 'your-user-id';

-- Check unseen emojis for user
SELECT * FROM get_unseen_emojis('your-user-id');

-- Check unseen questions for user  
SELECT * FROM get_unseen_questions('your-user-id');

-- Check if specific content has been seen
SELECT * FROM has_seen_content('your-user-id', 'game-type-id', 'content-id');
```

## Benefits

1. **Content Freshness**: Users always see new content within games
2. **Engagement**: Prevents boredom from repeated content
3. **Game Variety**: Users can play any game they want
4. **Retention**: Keeps the experience fresh and interesting
5. **User Choice**: Users have full control over which games to play
