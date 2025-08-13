// Script to check emoji_scores table
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

async function checkEmojiScores() {
  try {
    console.log('Checking emoji_scores table...');
    
    // Check if table exists and has data
    const { data, error } = await supabase
      .from('emoji_scores')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Error querying emoji_scores:', error);
      return;
    }
    
    console.log('emoji_scores table data:', data);
    console.log('Total records found:', data.length);
    
    // Check game_types table
    const { data: gameTypes, error: gameTypesError } = await supabase
      .from('game_types')
      .select('*')
      .eq('name', 'emoji');
    
    if (gameTypesError) {
      console.error('Error querying game_types:', gameTypesError);
    } else {
      console.log('Emoji game type:', gameTypes);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkEmojiScores();
