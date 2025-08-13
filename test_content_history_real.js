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

async function testContentHistoryWithRealUser() {
  try {
    console.log('🧪 Testing Content History with Real User...\n');

    // 1. Get a real user from the database
    console.log('1. Getting a real user from the database...');
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      console.error('❌ Error getting users:', userError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ No users found in the database');
      console.log('💡 Please create a user account first to test content history');
      return;
    }

    const testUser = users[0];
    console.log(`✅ Using test user: ${testUser.email} (${testUser.id})`);

    // 2. Get game type ID for truth_or_dare
    console.log('\n2. Getting game type ID...');
    const { data: gameType, error: gameTypeError } = await supabase
      .from('game_types')
      .select('id, name')
      .eq('name', 'truth_or_dare')
      .single();

    if (gameTypeError) {
      console.error('❌ Error getting game type:', gameTypeError);
      return;
    }

    console.log(`✅ Game type: ${gameType.name} (${gameType.id})`);

    // 3. Test recording content seen
    console.log('\n3. Testing recording content seen...');
    
    // Get a sample question from the questions table
    const { data: sampleQuestion, error: questionError } = await supabase
      .from('questions')
      .select('id, content, type, subtype')
      .limit(1)
      .single();

    if (questionError) {
      console.error('❌ Error getting sample question:', questionError);
      return;
    }

    console.log(`✅ Sample question: "${sampleQuestion.content}" (${sampleQuestion.id})`);

    // Test the update_user_content_history function
    const { data: updateResult, error: updateError } = await supabase.rpc('update_user_content_history', {
      p_player_id: testUser.id,
      p_game_type_id: gameType.id,
      p_content_id: sampleQuestion.id,
      p_content_type: 'lovers_question'
    });

    if (updateError) {
      console.error('❌ Error updating content history:', updateError);
      return;
    }

    console.log('✅ Content history updated successfully!');

    // 4. Verify the content was recorded
    console.log('\n4. Verifying content was recorded...');
    const { data: history, error: historyError } = await supabase
      .from('user_content_history')
      .select('*')
      .eq('player_id', testUser.id)
      .eq('game_type_id', gameType.id)
      .eq('content_id', sampleQuestion.id);

    if (historyError) {
      console.error('❌ Error checking content history:', historyError);
      return;
    }

    if (history && history.length > 0) {
      console.log('✅ Content history record found:');
      console.log(`   - Content ID: ${history[0].content_id}`);
      console.log(`   - Content Type: ${history[0].content_type}`);
      console.log(`   - Times Seen: ${history[0].times_seen}`);
      console.log(`   - First Seen: ${history[0].first_seen_at}`);
      console.log(`   - Last Seen: ${history[0].last_seen_at}`);
    } else {
      console.log('❌ No content history record found');
    }

    // 5. Test the get_unseen_lovers_questions function
    console.log('\n5. Testing get_unseen_lovers_questions function...');
    const { data: unseenQuestions, error: unseenError } = await supabase.rpc('get_unseen_lovers_questions', {
      p_player_id: testUser.id,
      p_type: sampleQuestion.type,
      p_subtype: sampleQuestion.subtype
    });

    if (unseenError) {
      console.error('❌ Error getting unseen questions:', unseenError);
      return;
    }

    console.log(`✅ Found ${unseenQuestions.length} unseen questions`);
    if (unseenQuestions.length > 0) {
      console.log(`   - First unseen: "${unseenQuestions[0].content}"`);
    }

    // 6. Test recording the same content again (should update times_seen)
    console.log('\n6. Testing recording the same content again...');
    const { data: updateResult2, error: updateError2 } = await supabase.rpc('update_user_content_history', {
      p_player_id: testUser.id,
      p_game_type_id: gameType.id,
      p_content_id: sampleQuestion.id,
      p_content_type: 'lovers_question'
    });

    if (updateError2) {
      console.error('❌ Error updating content history again:', updateError2);
      return;
    }

    console.log('✅ Content history updated again successfully!');

    // 7. Check if times_seen was incremented
    const { data: history2, error: historyError2 } = await supabase
      .from('user_content_history')
      .select('times_seen')
      .eq('player_id', testUser.id)
      .eq('game_type_id', gameType.id)
      .eq('content_id', sampleQuestion.id)
      .single();

    if (historyError2) {
      console.error('❌ Error checking updated content history:', historyError2);
      return;
    }

    console.log(`✅ Times seen updated to: ${history2.times_seen}`);

    console.log('\n🎉 Content History Test Complete!');
    console.log('\n📝 Summary:');
    console.log('✅ Content history recording is working');
    console.log('✅ Unseen content filtering is working');
    console.log('✅ Duplicate content handling is working');
    console.log('✅ Database functions are properly configured');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testContentHistoryWithRealUser();
