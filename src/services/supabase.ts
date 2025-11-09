import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://zjhnvtegoarvdqakqqkd.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaG52dGVnb2FydmRxYWtxcWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTEwNjcsImV4cCI6MjA3ODE2NzA2N30.psUwlT7mj-N9p4JN2DByHLnayrIkoeBdI81lcQWgmII';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase config check:', {
    url: supabaseUrl ? 'set' : 'missing',
    key: supabaseAnonKey ? 'set' : 'missing',
    env: process.env.NODE_ENV
  });
  throw new Error(
    'Missing Supabase configuration. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY environment variables.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);