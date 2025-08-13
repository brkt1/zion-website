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

async function checkGameTypesSchema() {
  try {
    console.log('🔍 Checking game_types table structure...\n');

    // Try to get the table structure by selecting all columns
    const { data, error } = await supabase
      .from('game_types')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error accessing game_types table:', error);
      return;
    }

    console.log('✅ game_types table is accessible');
    console.log('📋 Table structure (from sample data):');
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      columns.forEach(col => {
        console.log(`   - ${col}: ${typeof data[0][col]}`);
      });
    } else {
      console.log('   Table is empty, no columns to show');
    }

    // Try to insert a simple record to see what columns are required
    console.log('\n🧪 Testing insert with minimal data...');
    const { data: insertData, error: insertError } = await supabase
      .from('game_types')
      .insert([{ name: 'test_game' }])
      .select();

    if (insertError) {
      console.error('❌ Insert error:', insertError);
    } else {
      console.log('✅ Insert successful with minimal data');
      console.log('Inserted data:', insertData);
      
      // Clean up the test record
      const { error: deleteError } = await supabase
        .from('game_types')
        .delete()
        .eq('name', 'test_game');
      
      if (deleteError) {
        console.error('❌ Error cleaning up test record:', deleteError);
      } else {
        console.log('✅ Test record cleaned up');
      }
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkGameTypesSchema();
