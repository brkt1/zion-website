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

async function testGameHistory() {
  try {
    console.log('🧪 Testing Game History Feature...\n');

    // Test 1: Check if user_game_history table exists
    console.log('1. Checking if user_game_history table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('user_game_history')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table check failed:', tableError);
      return;
    }
    console.log('✅ user_game_history table exists\n');

    // Test 2: Check if functions exist
    console.log('2. Checking if database functions exist...');
    
    // Test get_unplayed_games function
    const { data: unplayedGames, error: unplayedError } = await supabase.rpc('get_unplayed_games', {
      p_player_id: '00000000-0000-0000-0000-000000000000' // Dummy UUID
    });
    
    if (unplayedError) {
      console.error('❌ get_unplayed_games function test failed:', unplayedError);
    } else {
      console.log('✅ get_unplayed_games function works');
    }

    // Test get_played_games function
    const { data: playedGames, error: playedError } = await supabase.rpc('get_played_games', {
      p_player_id: '00000000-0000-0000-0000-000000000000' // Dummy UUID
    });
    
    if (playedError) {
      console.error('❌ get_played_games function test failed:', playedError);
    } else {
      console.log('✅ get_played_games function works');
    }

    // Test update_user_game_history function
    const { error: updateError } = await supabase.rpc('update_user_game_history', {
      p_player_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      p_game_type_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      p_score: 100
    });
    
    if (updateError) {
      console.error('❌ update_user_game_history function test failed:', updateError);
    } else {
      console.log('✅ update_user_game_history function works');
    }

    console.log('\n3. Checking game types in database...');
    const { data: gameTypes, error: gameTypesError } = await supabase
      .from('game_types')
      .select('id, name, description');
    
    if (gameTypesError) {
      console.error('❌ Failed to fetch game types:', gameTypesError);
    } else {
      console.log('✅ Found game types:');
      gameTypes?.forEach(gt => {
        console.log(`   - ${gt.name}: ${gt.description}`);
      });
    }

    console.log('\n🎉 Game History Feature Test Complete!');
    console.log('\n📝 Next Steps:');
    console.log('1. Start the application');
    console.log('2. Log in as a user');
    console.log('3. Play any game (e.g., Emoji Game)');
    console.log('4. Return to the main landing page');
    console.log('5. Verify the played game no longer appears in the list');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testGameHistory();
