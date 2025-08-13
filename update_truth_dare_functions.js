import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateTruthDareFunctions() {
  try {
    console.log('🔄 Updating Truth and Dare functions...\n');

    // Update get_unseen_lovers_questions function
    console.log('1. Updating get_unseen_lovers_questions function...');
    const updateLoversFunction = `
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
    `;

    console.log('Please run the following SQL in your Supabase SQL editor:');
    console.log(updateLoversFunction);

    // Update get_unseen_friends_questions function
    console.log('\n2. Updating get_unseen_friends_questions function...');
    const updateFriendsFunction = `
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
    `;

    console.log('Please also run this SQL in your Supabase SQL editor:');
    console.log(updateFriendsFunction);

    // Grant execute permissions
    console.log('\n3. Granting execute permissions...');
    const grantPermissions = `
      GRANT EXECUTE ON FUNCTION get_unseen_lovers_questions(uuid, text, text) TO authenticated;
      GRANT EXECUTE ON FUNCTION get_unseen_friends_questions(uuid, text) TO authenticated;
    `;

    console.log('Please also run this SQL in your Supabase SQL editor:');
    console.log(grantPermissions);

    console.log('\n✅ Truth and Dare function update instructions provided!');
    console.log('\n📝 Next Steps:');
    console.log('1. Copy the SQL above and run it in your Supabase SQL editor');
    console.log('2. Test the Truth and Dare games with content history');
    console.log('3. Verify that users see different questions each time');

  } catch (error) {
    console.error('❌ Update failed:', error);
  }
}

updateTruthDareFunctions();
