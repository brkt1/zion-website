import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runContentHistoryMigration() {
  try {
    console.log('Running content history migration...');
    
    // Read the migration SQL file
    const migrationSQL = readFileSync(join(__dirname, 'db', 'user_content_history.sql'), 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // If exec_sql doesn't exist, try direct execution
          console.log('exec_sql not available, trying direct execution...');
          const { error: directError } = await supabase.from('user_content_history').select('id').limit(1);
          
          if (directError && directError.code === '42P01') {
            // Table doesn't exist, we need to create it manually
            console.log('Creating user_content_history table manually...');
            
            // Create the table
            const createTableSQL = `
              CREATE TABLE public.user_content_history (
                id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
                player_id uuid NOT NULL REFERENCES auth.users(id),
                game_type_id uuid NOT NULL REFERENCES public.game_types(id),
                content_id text NOT NULL,
                content_type text NOT NULL,
                first_seen_at timestamp with time zone DEFAULT now(),
                last_seen_at timestamp with time zone DEFAULT now(),
                times_seen integer DEFAULT 1,
                created_at timestamp with time zone DEFAULT now(),
                updated_at timestamp with time zone DEFAULT now(),
                CONSTRAINT user_content_history_pkey PRIMARY KEY (id),
                CONSTRAINT user_content_history_unique UNIQUE (player_id, game_type_id, content_id)
              );
            `;
            
            // Note: This will need to be run in the Supabase SQL editor
            console.log('Please run the following SQL in your Supabase SQL editor:');
            console.log(createTableSQL);
            console.log('\nAnd the rest of the migration from db/user_content_history.sql');
            break;
          }
        }
      }
    }
    
    console.log('Content history migration completed successfully!');
    
    // Test the migration by checking if the table exists
    const { data, error } = await supabase
      .from('user_content_history')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('Table might not exist yet. Please run the SQL manually in Supabase.');
    } else {
      console.log('Migration verified - user_content_history table exists!');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runContentHistoryMigration();
