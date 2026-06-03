const { createClient } = require('@supabase/supabase-js');

const url = 'https://zjhnvtegoarvdqakqqkd.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaG52dGVnb2FydmRxYWtxcWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTEwNjcsImV4cCI6MjA3ODE2NzA2N30.psUwlT7mj-N9p4JN2DByHLnayrIkoeBdI81lcQWgmII';

const supabase = createClient(url, key);

async function run() {
  // Query supabase pg_catalog tables via RPC or check what queries we can make
  // Let's check common tables: 'profiles', 'users', 'user_roles', 'sponsorship_representatives', 'commission_sellers'
  const tables = ['profiles', 'users', 'user_roles', 'sponsorship_representatives', 'commission_sellers', 'ticket_scanners'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(5);
    console.log(`Table: ${table}`);
    console.log('Error:', error ? error.message : 'None');
    console.log('Data:', data);
    console.log('-------------------');
  }
}

run();
