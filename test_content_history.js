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

async function testContentHistory() {
  try {
    console.log('🧪 Testing Content History Feature...\n');

    // Test 1: Check if user_content_history table exists
    console.log('1. Checking if user_content_history table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('user_content_history')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table check failed:', tableError);
      return;
    }
    console.log('✅ user_content_history table exists\n');

    // Test 2: Check if functions exist
    console.log('2. Checking if database functions exist...');
    
    // Test get_unseen_emojis function
    const { data: unseenEmojis, error: unseenEmojisError } = await supabase.rpc('get_unseen_emojis', {
      p_player_id: '00000000-0000-0000-0000-000000000000' // Dummy UUID
    });
    
    if (unseenEmojisError) {
      console.error('❌ get_unseen_emojis function test failed:', unseenEmojisError);
    } else {
      console.log('✅ get_unseen_emojis function works');
    }

    // Test get_unseen_questions function
    const { data: unseenQuestions, error: unseenQuestionsError } = await supabase.rpc('get_unseen_questions', {
      p_player_id: '00000000-0000-0000-0000-000000000000' // Dummy UUID
    });
    
    if (unseenQuestionsError) {
      console.error('❌ get_unseen_questions function test failed:', unseenQuestionsError);
    } else {
      console.log('✅ get_unseen_questions function works');
    }

    // Test update_user_content_history function
    const { error: updateError } = await supabase.rpc('update_user_content_history', {
      p_player_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      p_game_type_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      p_content_id: 'test-content-id',
      p_content_type: 'test'
    });
    
    if (updateError) {
      console.error('❌ update_user_content_history function test failed:', updateError);
    } else {
      console.log('✅ update_user_content_history function works');
    }

    // Test has_seen_content function
    const { data: hasSeen, error: hasSeenError } = await supabase.rpc('has_seen_content', {
      p_player_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      p_game_type_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      p_content_id: 'test-content-id'
    });
    
    if (hasSeenError) {
      console.error('❌ has_seen_content function test failed:', hasSeenError);
    } else {
      console.log('✅ has_seen_content function works');
    }

    console.log('\n3. Checking content in database...');
    
    // Check emojis
    const { data: emojis, error: emojisError } = await supabase
      .from('emojis')
      .select('id, emoji, title')
      .limit(5);
    
    if (emojisError) {
      console.error('❌ Failed to fetch emojis:', emojisError);
    } else {
      console.log('✅ Found emojis:');
      emojis?.forEach(emoji => {
        console.log(`   - ${emoji.emoji}: ${emoji.title} (ID: ${emoji.id})`);
      });
    }

    // Check questions
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('id, question')
      .limit(3);
    
    if (questionsError) {
      console.error('❌ Failed to fetch questions:', questionsError);
    } else {
      console.log('\n✅ Found questions:');
      questions?.forEach(question => {
        console.log(`   - ${question.question.substring(0, 50)}... (ID: ${question.id})`);
      });
    }

    console.log('\n🎉 Content History Feature Test Complete!');
    console.log('\n📝 How it works:');
    console.log('1. When a user plays a game, specific content (emojis, questions) is recorded as "seen"');
    console.log('2. Future game sessions will only show content the user hasn\'t seen before');
    console.log('3. If all content has been seen, the system falls back to recently seen content');
    console.log('4. This ensures users always see fresh content and never repeat the same items');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testContentHistory();
