// Script to run database migrations
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

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    // 1. Insert emoji game type
    console.log('\n1. Inserting emoji game type...');
    const { data: gameTypeData, error: gameTypeError } = await supabase
      .from('game_types')
      .insert([
        { 
          name: 'emoji', 
          description: 'Emoji guessing game where players identify emojis to earn points and rewards' 
        }
      ])
      .select();
    
    if (gameTypeError) {
      if (gameTypeError.code === '23505') { // Unique constraint violation
        console.log('Emoji game type already exists, skipping...');
      } else {
        console.error('Error inserting game type:', gameTypeError);
        return;
      }
    } else {
      console.log('Emoji game type created:', gameTypeData);
    }
    
    // 2. Fix emoji_scores table structure
    console.log('\n2. Fixing emoji_scores table structure...');
    
    // First, let's check the current table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('emoji_scores')
      .select('*')
      .limit(1);
    
    console.log('Current table structure check:', tableError ? 'Error' : 'OK');
    
    // Try to insert a test record to see what constraints exist
    const testRecord = {
      player_name: 'test_user',
      player_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      score: 100,
      stage: 1,
      session_id: 'test_session',
      streak: 0,
      timestamp: new Date().toISOString()
    };
    
    console.log('Attempting test insert...');
    const { data: testInsert, error: testError } = await supabase
      .from('emoji_scores')
      .insert(testRecord);
    
    if (testError) {
      console.log('Test insert failed (expected):', testError.message);
      console.log('This means the table still has constraints that need to be removed');
      console.log('You need to run the SQL migration manually in Supabase dashboard');
    } else {
      console.log('Test insert succeeded, table structure is correct');
      
      // Clean up test record
      await supabase
        .from('emoji_scores')
        .delete()
        .eq('player_name', 'test_user');
    }
    
    console.log('\nMigration check completed!');
    console.log('\nIf you see constraint errors above, you need to:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Run the SQL in db/fix_emoji_scores_anonymous.sql');
    console.log('3. Run the SQL in db/insert_emoji_game_type.sql');
    
  } catch (error) {
    console.error('Migration error:', error);
  }
}

runMigrations();
