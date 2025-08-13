# Supabase Setup Guide for Content History Feature

## Overview

This guide will help you set up the Content History Feature using your Supabase database. The feature prevents users from seeing the same content twice within games.

## Prerequisites

- Supabase project with database access
- Environment variables configured in your project

## Step 1: Database Migration

### 1.1 Create the Content History Table

Copy and run the following SQL in your Supabase SQL editor:

```sql
-- Create table to track user content history
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

-- Create indexes for better performance
CREATE INDEX idx_user_content_history_player_id ON public.user_content_history(player_id);
CREATE INDEX idx_user_content_history_game_type_id ON public.user_content_history(game_type_id);
CREATE INDEX idx_user_content_history_content_id ON public.user_content_history(content_id);
CREATE INDEX idx_user_content_history_content_type ON public.user_content_history(content_type);
CREATE INDEX idx_user_content_history_last_seen ON public.user_content_history(last_seen_at);

-- Enable Row Level Security
ALTER TABLE public.user_content_history ENABLE ROW LEVEL SECURITY;

-- Policies for user_content_history
CREATE POLICY "Users can view their own content history" ON public.user_content_history 
    FOR SELECT USING (auth.uid() = player_id);

CREATE POLICY "Users can insert their own content history" ON public.user_content_history 
    FOR INSERT WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can update their own content history" ON public.user_content_history 
    FOR UPDATE USING (auth.uid() = player_id);
```

### 1.2 Create Database Functions

Run these functions in your Supabase SQL editor:

```sql
-- Function to update user content history when content is seen
CREATE OR REPLACE FUNCTION update_user_content_history(
    p_player_id uuid,
    p_game_type_id uuid,
    p_content_id text,
    p_content_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_content_history (
        player_id,
        game_type_id,
        content_id,
        content_type,
        last_seen_at
    ) VALUES (
        p_player_id,
        p_game_type_id,
        p_content_id,
        p_content_type,
        now()
    )
    ON CONFLICT (player_id, game_type_id, content_id)
    DO UPDATE SET
        last_seen_at = now(),
        times_seen = user_content_history.times_seen + 1,
        updated_at = now();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_user_content_history(uuid, uuid, text, text) TO authenticated;
```

### 1.3 Create Content-Specific Functions

```sql
-- Function to get unseen emojis for emoji game
CREATE OR REPLACE FUNCTION get_unseen_emojis(p_player_id uuid)
RETURNS TABLE (
    id uuid,
    emoji text,
    title text,
    difficulty integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.emoji,
        e.title,
        e.difficulty
    FROM public.emojis e
    WHERE e.id NOT IN (
        SELECT uch.content_id::uuid 
        FROM public.user_content_history uch 
        WHERE uch.player_id = p_player_id 
        AND uch.game_type_id = (SELECT gt.id FROM game_types gt WHERE gt.name = 'emoji')
        AND uch.content_type = 'emoji'
    );
END;
$$;

-- Function to get unseen questions for trivia game
CREATE OR REPLACE FUNCTION get_unseen_questions(p_player_id uuid)
RETURNS TABLE (
    id uuid,
    question text,
    options jsonb,
    correct_option integer,
    difficulty integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id,
        q.question,
        q.options,
        q.correct_option,
        q.difficulty
    FROM public.quiz_questions q
    WHERE q.id NOT IN (
        SELECT uch.content_id::uuid 
        FROM public.user_content_history uch 
        WHERE uch.player_id = p_player_id 
        AND uch.game_type_id = (SELECT gt.id FROM game_types gt WHERE gt.name = 'trivia')
        AND uch.content_type = 'question'
    );
END;
$$;

-- Function to get unseen truth/dare questions for lovers game
CREATE OR REPLACE FUNCTION get_unseen_lovers_questions(p_player_id uuid, p_type text, p_subtype text)
RETURNS TABLE (
    id uuid,
    content text,
    type text,
    subtype text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id,
        q.content,
        q.type,
        q.subtype
    FROM public.questions q
    WHERE q.type = p_type 
    AND q.subtype = p_subtype
    AND q.id NOT IN (
        SELECT uch.content_id::uuid 
        FROM public.user_content_history uch 
        WHERE uch.player_id = p_player_id 
        AND uch.game_type_id = (SELECT gt.id FROM game_types gt WHERE gt.name = 'truth_or_dare')
        AND uch.content_type = 'lovers_question'
    );
END;
$$;

-- Function to get unseen truth/dare questions for friends game
CREATE OR REPLACE FUNCTION get_unseen_friends_questions(p_player_id uuid, p_type text)
RETURNS TABLE (
    id uuid,
    question text,
    type text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.question,
        f.type
    FROM public.frquetion f
    WHERE f.type = p_type
    AND f.id NOT IN (
        SELECT uch.content_id::uuid 
        FROM public.user_content_history uch 
        WHERE uch.player_id = p_player_id 
        AND uch.game_type_id = (SELECT gt.id FROM game_types gt WHERE gt.name = 'truth_or_dare')
        AND uch.content_type = 'friends_question'
    );
END;
$$;

-- Function to check if content has been seen
CREATE OR REPLACE FUNCTION has_seen_content(
    p_player_id uuid,
    p_game_type_id uuid,
    p_content_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_seen boolean;
BEGIN
    SELECT EXISTS(
        SELECT 1 
        FROM public.user_content_history 
        WHERE player_id = p_player_id 
        AND game_type_id = p_game_type_id 
        AND content_id = p_content_id
    ) INTO v_seen;
    
    RETURN v_seen;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_unseen_emojis(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unseen_questions(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unseen_lovers_questions(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unseen_friends_questions(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION has_seen_content(uuid, uuid, text) TO authenticated;
```

## Step 2: Verify Setup

### 2.1 Check Table Creation

Run this query to verify the table exists:

```sql
SELECT * FROM user_content_history LIMIT 1;
```

### 2.2 Check Functions

Run this query to verify all functions exist:

```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'update_user_content_history', 
    'get_unseen_emojis', 
    'get_unseen_questions', 
    'get_unseen_lovers_questions',
    'get_unseen_friends_questions',
    'has_seen_content'
);
```

### 2.3 Test Functions

Test the functions with a dummy user ID:

```sql
-- Test get_unseen_emojis
SELECT * FROM get_unseen_emojis('00000000-0000-0000-0000-000000000000');

-- Test get_unseen_questions
SELECT * FROM get_unseen_questions('00000000-0000-0000-0000-000000000000');

-- Test get_unseen_lovers_questions
SELECT * FROM get_unseen_lovers_questions('00000000-0000-0000-0000-000000000000', 'Truth', 'Normal');

-- Test get_unseen_friends_questions
SELECT * FROM get_unseen_friends_questions('00000000-0000-0000-0000-000000000000', 'Truth');

-- Test has_seen_content
SELECT * FROM has_seen_content('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'test');
```

## Step 3: Environment Configuration

### 3.1 Frontend Environment Variables

Ensure your `.env` file contains:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3.2 Backend Environment Variables (if applicable)

Ensure your backend `.env` file contains:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Step 4: Test the Feature

### 4.1 Run the Test Script

```bash
node test_content_history.js
```

### 4.2 Manual Testing

1. Start your application
2. Log in as a user
3. Play the Emoji Game
4. Note the emojis you see
5. Play the Emoji Game again
6. Verify you see different emojis
7. Play Truth or Dare (Lovers)
8. Note the questions you see
9. Play Truth or Dare (Lovers) again
10. Verify you see different questions
11. Play Truth or Dare (Friends)
12. Note the questions you see
13. Play Truth or Dare (Friends) again
14. Verify you see different questions

## Step 5: Monitor and Debug

### 5.1 Check User Content History

```sql
-- View a user's content history
SELECT 
    uch.content_type,
    uch.content_id,
    uch.first_seen_at,
    uch.times_seen
FROM user_content_history uch
WHERE uch.player_id = 'your-user-id'
ORDER BY uch.last_seen_at DESC;
```

### 5.2 Check Unseen Content

```sql
-- Check unseen emojis for a user
SELECT * FROM get_unseen_emojis('your-user-id');

-- Check unseen questions for a user
SELECT * FROM get_unseen_questions('your-user-id');

-- Check unseen lovers questions for a user
SELECT * FROM get_unseen_lovers_questions('your-user-id', 'Truth', 'Normal');

-- Check unseen friends questions for a user
SELECT * FROM get_unseen_friends_questions('your-user-id', 'Truth');
```

### 5.3 Check Content Statistics

```sql
-- Count total content items
SELECT 
    'emojis' as content_type,
    COUNT(*) as total_count
FROM emojis
UNION ALL
SELECT 
    'questions' as content_type,
    COUNT(*) as total_count
FROM quiz_questions;

-- Count seen content per user
SELECT 
    uch.content_type,
    COUNT(*) as seen_count
FROM user_content_history uch
WHERE uch.player_id = 'your-user-id'
GROUP BY uch.content_type;
```

## Troubleshooting

### Common Issues

1. **"column reference is ambiguous" error**
   - Solution: The functions have been updated to use table aliases

2. **"foreign key constraint" error**
   - Solution: Ensure the user exists in the auth.users table

3. **"function does not exist" error**
   - Solution: Run the function creation SQL in Supabase

4. **"permission denied" error**
   - Solution: Check RLS policies and user authentication

### Debug Commands

```sql
-- Check if user exists
SELECT * FROM auth.users WHERE id = 'your-user-id';

-- Check game types
SELECT * FROM game_types WHERE name IN ('emoji', 'trivia', 'truth_or_dare');

-- Check content tables
SELECT COUNT(*) FROM emojis;
SELECT COUNT(*) FROM quiz_questions;
SELECT COUNT(*) FROM questions;
SELECT COUNT(*) FROM frquetion;
```

## Performance Optimization

### Indexes

The following indexes are automatically created:
- `idx_user_content_history_player_id`
- `idx_user_content_history_game_type_id`
- `idx_user_content_history_content_id`
- `idx_user_content_history_content_type`
- `idx_user_content_history_last_seen`

### Query Optimization

- Functions use efficient NOT IN queries
- Content is filtered at the database level
- Fallback content is limited to 20 items

## Security

### Row Level Security (RLS)

- Users can only view their own content history
- Users can only insert/update their own content history
- Functions use SECURITY DEFINER for proper permissions

### Data Privacy

- Content history is tied to user accounts
- Unauthenticated users don't have content history tracked
- No sensitive data is stored in content history

## Maintenance

### Regular Tasks

1. **Monitor table size**: Check if user_content_history table is growing too large
2. **Clean old data**: Consider archiving old content history
3. **Update content**: Add new emojis and questions regularly

### Backup

The user_content_history table is automatically backed up with your Supabase project.

## Support

If you encounter issues:

1. Check the Supabase logs in your dashboard
2. Verify all SQL statements were executed successfully
3. Test with the provided test scripts
4. Check the troubleshooting section above

The content history feature is now fully integrated with your Supabase database!
