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

async function updateContentHistoryFunctions() {
  try {
    console.log('🔄 Updating content history functions...\n');

    // Update get_unseen_emojis function
    console.log('1. Updating get_unseen_emojis function...');
    const updateEmojisFunction = `
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
    `;

    // Note: This needs to be run in Supabase SQL editor
    console.log('Please run the following SQL in your Supabase SQL editor:');
    console.log(updateEmojisFunction);

    // Update get_unseen_questions function
    console.log('\n2. Updating get_unseen_questions function...');
    const updateQuestionsFunction = `
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
    `;

    console.log('Please also run this SQL in your Supabase SQL editor:');
    console.log(updateQuestionsFunction);

    console.log('\n✅ Function update instructions provided!');
    console.log('\n📝 Next Steps:');
    console.log('1. Copy the SQL above and run it in your Supabase SQL editor');
    console.log('2. Run the test again: node test_content_history.js');
    console.log('3. Start your application and test the content history feature');

  } catch (error) {
    console.error('❌ Update failed:', error);
  }
}

updateContentHistoryFunctions();
