const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/REACT_APP_SUPABASE_URL=(.*)/)?.[1];
const key = env.match(/REACT_APP_SUPABASE_ANON_KEY=(.*)/)?.[1];

if (!url || !key) {
  console.error('URL or KEY not found');
  process.exit(1);
}

const supabase = createClient(url, key);

async function getSchema() {
  const { data, error } = await supabase.from('expo_applications').select('*').limit(1);
  if (error) {
    console.error(error);
    return;
  }
  if (data && data.length > 0) {
    console.log(JSON.stringify(Object.keys(data[0]), null, 2));
  } else {
    console.log('No data found in expo_applications');
  }
}

getSchema();
