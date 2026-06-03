const { createClient } = require('@supabase/supabase-js');

const url = 'https://zjhnvtegoarvdqakqqkd.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaG52dGVnb2FydmRxYWtxcWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTEwNjcsImV4cCI6MjA3ODE2NzA2N30.psUwlT7mj-N9p4JN2DByHLnayrIkoeBdI81lcQWgmII';

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from('user_roles').select('*');
  console.log('Error:', error);
  console.log('Data:', data);
}

run();
