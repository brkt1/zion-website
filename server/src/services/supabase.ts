import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://zjhnvtegoarvdqakqqkd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaG52dGVnb2FydmRxYWtxcWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTEwNjcsImV4cCI6MjA3ODE2NzA2N30.psUwlT7mj-N9p4JN2DByHLnayrIkoeBdI81lcQWgmII';

// Log which key is being used (critical for debugging ticket save issues)
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('✅ Supabase: Using SERVICE_ROLE key (full database access, bypasses RLS)');
} else if (process.env.SUPABASE_ANON_KEY) {
  console.warn('⚠️  Supabase: Using ANON key — ticket INSERT/UPDATE may fail due to RLS!');
  console.warn('   Set SUPABASE_SERVICE_ROLE_KEY in server/.env for full write access.');
} else {
  console.warn('⚠️  Supabase: Using hardcoded ANON key — ticket INSERT/UPDATE may fail due to RLS!');
  console.warn('   Set SUPABASE_SERVICE_ROLE_KEY in server/.env for full write access.');
}

// Create Supabase client
let supabase: SupabaseClient;

// Use service role key or anon key for backend operations
supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!(
    supabaseUrl && 
    supabaseServiceKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseServiceKey !== 'placeholder-key' &&
    supabaseUrl.startsWith('https://') &&
    supabaseServiceKey.length > 20 // Real keys are much longer
  );
};

export { supabase };

