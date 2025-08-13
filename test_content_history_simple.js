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

async function testContentHistorySimple() {
  try {
    console.log('🧪 Testing Content History Functions...\n');

    // 1. Check if the update_user_content_history function exists
    console.log('1. Checking if update_user_content_history function exists...');
    
    // Test with a dummy call to see if the function exists
    try {
      const { data, error } = await supabase.rpc('update_user_content_history', {
        p_player_id: '00000000-0000-0000-0000-000000000000',
        p_game_type_id: '00000000-0000-0000-0000-000000000000',
        p_content_id: 'test-content-id',
        p_content_type: 'test-type'
      });
      
      if (error && error.code === '23503') {
        // This is expected - foreign key constraint violation
        console.log('✅ update_user_content_history function exists (foreign key error is expected)');
      } else if (error) {
        console.log('❌ Function error:', error);
      } else {
        console.log('✅ update_user_content_history function works');
      }
    } catch (funcError) {
      console.log('❌ Function does not exist or has issues:', funcError.message);
    }

    // 2. Check if the get_unseen_lovers_questions function exists
    console.log('\n2. Checking if get_unseen_lovers_questions function exists...');
    try {
      const { data, error } = await supabase.rpc('get_unseen_lovers_questions', {
        p_player_id: '00000000-0000-0000-0000-000000000000',
        p_type: 'Truth',
        p_subtype: 'Normal'
      });
      
      if (error && error.code === '23503') {
        console.log('✅ get_unseen_lovers_questions function exists (foreign key error is expected)');
      } else if (error) {
        console.log('❌ Function error:', error);
      } else {
        console.log('✅ get_unseen_lovers_questions function works');
      }
    } catch (funcError) {
      console.log('❌ Function does not exist or has issues:', funcError.message);
    }

    // 3. Check if the get_unseen_friends_questions function exists
    console.log('\n3. Checking if get_unseen_friends_questions function exists...');
    try {
      const { data, error } = await supabase.rpc('get_unseen_friends_questions', {
        p_player_id: '00000000-0000-0000-0000-000000000000',
        p_type: 'Truth'
      });
      
      if (error && error.code === '23503') {
        console.log('✅ get_unseen_friends_questions function exists (foreign key error is expected)');
      } else if (error) {
        console.log('❌ Function error:', error);
      } else {
        console.log('✅ get_unseen_friends_questions function works');
      }
    } catch (funcError) {
      console.log('❌ Function does not exist or has issues:', funcError.message);
    }

    // 4. Check the content tables
    console.log('\n4. Checking content tables...');
    
    // Check questions table
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, content, type, subtype')
      .limit(3);

    if (questionsError) {
      console.log('❌ Error accessing questions table:', questionsError);
    } else {
      console.log(`✅ Questions table accessible - found ${questions.length} questions`);
      questions.forEach((q, i) => {
        console.log(`   ${i + 1}. "${q.content}" (${q.type}/${q.subtype})`);
      });
    }

    // Check frquetion table
    const { data: frquetion, error: frquetionError } = await supabase
      .from('frquetion')
      .select('id, question, type')
      .limit(3);

    if (frquetionError) {
      console.log('❌ Error accessing frquetion table:', frquetionError);
    } else {
      console.log(`✅ Frquetion table accessible - found ${frquetion.length} questions`);
      frquetion.forEach((q, i) => {
        console.log(`   ${i + 1}. "${q.question}" (${q.type})`);
      });
    }

    // 5. Check game_types table
    console.log('\n5. Checking game_types table...');
    const { data: gameTypes, error: gameTypesError } = await supabase
      .from('game_types')
      .select('id, name');

    if (gameTypesError) {
      console.log('❌ Error accessing game_types table:', gameTypesError);
    } else {
      console.log(`✅ Game types table accessible - found ${gameTypes.length} game types`);
      gameTypes.forEach(gt => {
        console.log(`   - ${gt.name} (${gt.id})`);
      });
    }

    // 6. Check user_content_history table
    console.log('\n6. Checking user_content_history table...');
    const { data: history, error: historyError } = await supabase
      .from('user_content_history')
      .select('*')
      .limit(5);

    if (historyError) {
      console.log('❌ Error accessing user_content_history table:', historyError);
    } else {
      console.log(`✅ User content history table accessible - found ${history.length} records`);
      if (history.length > 0) {
        history.forEach((h, i) => {
          console.log(`   ${i + 1}. Player: ${h.player_id}, Content: ${h.content_id}, Type: ${h.content_type}`);
        });
      }
    }

    console.log('\n🎉 Content History Function Test Complete!');
    console.log('\n📝 Next Steps:');
    console.log('1. If functions exist but show foreign key errors, that\'s expected');
    console.log('2. The functions will work properly with real user IDs');
    console.log('3. Test the games in your application with a logged-in user');
    console.log('4. Check the user_content_history table after playing games');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testContentHistorySimple();
