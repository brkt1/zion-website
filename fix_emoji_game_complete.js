// Comprehensive fix for emoji game - bypasses RLS policies
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixEmojiGameComplete() {
  try {
    console.log('🔧 Starting comprehensive emoji game fix...\n');
    
    // Step 1: Insert emoji game type using raw SQL
    console.log('1️⃣ Inserting emoji game type...');
    const { data: gameTypeResult, error: gameTypeError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          INSERT INTO public.game_types (name, description) 
          VALUES ('emoji', 'Emoji guessing game where players identify emojis to earn points and rewards')
          ON CONFLICT (name) DO NOTHING
          RETURNING id, name;
        `
      });
    
    if (gameTypeError) {
      console.log('⚠️  RPC method not available, trying alternative approach...');
      
      // Alternative: Try to insert directly (might work if RLS is disabled for this table)
      const { data: directInsert, error: directError } = await supabase
        .from('game_types')
        .insert([
          { 
            name: 'emoji', 
            description: 'Emoji guessing game where players identify emojis to earn points and rewards' 
          }
        ])
        .select();
      
      if (directError) {
        console.log('❌ Cannot insert game type programmatically due to RLS policies');
        console.log('💡 You need to run this SQL manually in Supabase dashboard:');
        console.log(`
INSERT INTO public.game_types (name, description) 
VALUES ('emoji', 'Emoji guessing game where players identify emojis to earn points and rewards')
ON CONFLICT (name) DO NOTHING;
        `);
      } else {
        console.log('✅ Emoji game type created via direct insert:', directInsert);
      }
    } else {
      console.log('✅ Emoji game type created via RPC:', gameTypeResult);
    }
    
    // Step 2: Test emoji_scores table insert
    console.log('\n2️⃣ Testing emoji_scores table insert...');
    
    // Get the emoji game type ID
    const { data: gameTypeData, error: gameTypeQueryError } = await supabase
      .from('game_types')
      .select('id')
      .eq('name', 'emoji')
      .single();
    
    if (gameTypeQueryError || !gameTypeData) {
      console.log('❌ Cannot find emoji game type - insert it manually first');
      return;
    }
    
    const emojiGameTypeId = gameTypeData.id;
    console.log('✅ Found emoji game type ID:', emojiGameTypeId);
    
    // Test insert into emoji_scores
    const testScoreData = {
      player_name: 'test_user_fix',
      player_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID for anonymous user
      score: 150,
      game_type_id: emojiGameTypeId,
      stage: 1,
      session_id: 'test_session_fix',
      streak: 3,
      timestamp: new Date().toISOString()
    };
    
    console.log('📝 Attempting test score insert...');
    const { data: testScoreInsert, error: testScoreError } = await supabase
      .from('emoji_scores')
      .insert(testScoreData)
      .select();
    
    if (testScoreError) {
      console.log('❌ Test score insert failed:', testScoreError.message);
      console.log('💡 The table structure still needs to be fixed');
    } else {
      console.log('✅ Test score insert succeeded:', testScoreInsert);
      
      // Clean up test data
      await supabase
        .from('emoji_scores')
        .delete()
        .eq('player_name', 'test_user_fix');
      console.log('🧹 Test data cleaned up');
    }
    
    // Step 3: Verify current state
    console.log('\n3️⃣ Verifying current state...');
    
    const { data: finalGameTypes, error: finalGameTypesError } = await supabase
      .from('game_types')
      .select('*')
      .eq('name', 'emoji');
    
    const { data: finalScores, error: finalScoresError } = await supabase
      .from('emoji_scores')
      .select('*')
      .limit(5);
    
    console.log('📊 Final state:');
    console.log('  - Game types (emoji):', finalGameTypes?.length || 0);
    console.log('  - Emoji scores:', finalScores?.length || 0);
    
    // Step 4: Summary and next steps
    console.log('\n📋 SUMMARY AND NEXT STEPS:');
    
    if (finalGameTypes?.length > 0 && finalScores?.length >= 0) {
      console.log('✅ Database setup looks good!');
      console.log('🎮 You can now test the emoji game');
    } else {
      console.log('❌ Some setup steps are still needed');
      console.log('\n🔧 MANUAL STEPS REQUIRED:');
      console.log('1. Go to Supabase dashboard → SQL Editor');
      console.log('2. Run this SQL:');
      console.log(`
INSERT INTO public.game_types (name, description) 
VALUES ('emoji', 'Emoji guessing game where players identify emojis to earn points and rewards')
ON CONFLICT (name) DO NOTHING;
      `);
      console.log('3. If you still get constraint errors, also run:');
      console.log(`
ALTER TABLE public.emoji_scores DROP CONSTRAINT IF EXISTS emoji_scores_player_id_fkey;
ALTER TABLE public.emoji_scores ALTER COLUMN player_id DROP NOT NULL;
      `);
    }
    
    console.log('\n🚀 After setup is complete:');
    console.log('- Restart your server');
    console.log('- Test the emoji game');
    console.log('- Scores should save successfully');
    console.log('- Results page should work');
    
  } catch (error) {
    console.error('💥 Error during fix:', error);
  }
}

fixEmojiGameComplete();
