import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

// Create Supabase client only if credentials are provided
// This allows the server to start even without Supabase (for basic Telegram bot functionality)
let supabase: SupabaseClient;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase credentials not configured. Some features (push notifications, database queries) may not work.');
  // Create a dummy client that will fail gracefully when used
  // This prevents the server from crashing on startup
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
} else {
  // Use service role key for backend operations (bypasses RLS)
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

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

