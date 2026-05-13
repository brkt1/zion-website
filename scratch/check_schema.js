const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let url, key;
try {
  const env = fs.readFileSync('.env', 'utf8');
  url = env.match(/REACT_APP_SUPABASE_URL=(.*)/)?.[1];
  key = env.match(/REACT_APP_SUPABASE_ANON_KEY=(.*)/)?.[1];
} catch (e) {
  console.error('Could not read .env file');
  process.exit(1);
}

if (!url || !key) {
  console.error('URL or KEY not found in .env');
  process.exit(1);
}

const supabase = createClient(url.trim(), key.trim());

async function checkSchema() {
  console.log('Checking schema for masterclass_reservations...');
  const { data, error } = await supabase.from('masterclass_reservations').select('*').limit(1);
  if (error) {
    console.error('Error fetching data:', error.message);
    return;
  }
  if (data && data.length > 0) {
    console.log('Columns found:', Object.keys(data[0]));
  } else {
    // If no data, try to insert a dummy and rollback? No, just try to select something specific.
    console.log('No data found in masterclass_reservations to infer schema.');
  }
}

checkSchema();
