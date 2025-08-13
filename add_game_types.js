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

async function addGameTypes() {
  try {
    console.log('🔄 Adding missing game types...\n');

    // Define the game types we need
    const gameTypes = [
      { name: 'emoji', display_name: 'Emoji Game', description: 'Guess the movie from emojis' },
      { name: 'trivia', display_name: 'Trivia Game', description: 'Answer trivia questions' },
      { name: 'truth_or_dare', display_name: 'Truth or Dare', description: 'Truth or dare challenges' },
      { name: 'rock_paper_scissors', display_name: 'Rock Paper Scissors', description: 'Classic rock paper scissors game' }
    ];

    console.log('1. Checking existing game types...');
    const { data: existingTypes, error: checkError } = await supabase
      .from('game_types')
      .select('name');

    if (checkError) {
      console.error('❌ Error checking game types:', checkError);
      return;
    }

    const existingNames = existingTypes.map(gt => gt.name);
    console.log(`✅ Found ${existingTypes.length} existing game types:`, existingNames);

    // Filter out game types that already exist
    const newGameTypes = gameTypes.filter(gt => !existingNames.includes(gt.name));

    if (newGameTypes.length === 0) {
      console.log('✅ All game types already exist!');
      return;
    }

    console.log(`\n2. Adding ${newGameTypes.length} new game types...`);
    
    for (const gameType of newGameTypes) {
      console.log(`   Adding: ${gameType.name} - ${gameType.display_name}`);
      
      const { data, error } = await supabase
        .from('game_types')
        .insert([gameType])
        .select();

      if (error) {
        console.error(`   ❌ Error adding ${gameType.name}:`, error);
      } else {
        console.log(`   ✅ Added ${gameType.name} successfully`);
      }
    }

    // Verify all game types exist now
    console.log('\n3. Verifying all game types exist...');
    const { data: allTypes, error: verifyError } = await supabase
      .from('game_types')
      .select('*')
      .order('name');

    if (verifyError) {
      console.error('❌ Error verifying game types:', verifyError);
      return;
    }

    console.log(`✅ Total game types in database: ${allTypes.length}`);
    allTypes.forEach(gt => {
      console.log(`   - ${gt.name}: ${gt.display_name}`);
    });

    console.log('\n🎉 Game types setup complete!');
    console.log('\n📝 Next Steps:');
    console.log('1. Test the content history feature in your application');
    console.log('2. Play games and check if content history is being recorded');
    console.log('3. Verify that users see different content on subsequent plays');

  } catch (error) {
    console.error('❌ Failed to add game types:', error);
  }
}

addGameTypes();
