const { createClient } = require('@supabase/supabase-js');

const url = 'https://zjhnvtegoarvdqakqqkd.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaG52dGVnb2FydmRxYWtxcWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTEwNjcsImV4cCI6MjA3ODE2NzA2N30.psUwlT7mj-N9p4JN2DByHLnayrIkoeBdI81lcQWgmII';

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from('masterclass_reservations').select('id, name, status, status_updated_by');
  console.log('Error:', error);
  if (data) {
    const updatedByValues = Array.from(new Set(data.map(r => r.status_updated_by).filter(Boolean)));
    console.log('Unique status_updated_by values:', updatedByValues);
  }
}

run();
