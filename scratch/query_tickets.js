const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let env = '';
try { env = fs.readFileSync('.env', 'utf8'); } catch (e) {}

const url = env.match(/REACT_APP_SUPABASE_URL=(.*)/)?.[1]?.trim() || "https://zjhnvtegoarvdqakqqkd.supabase.co";
const key = env.match(/REACT_APP_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaG52dGVnb2FydmRxYWtxcWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTEwNjcsImV4cCI6MjA3ODE2NzA2N30.psUwlT7mj-N9p4JN2DByHLnayrIkoeBdI81lcQWgmII";

const supabase = createClient(url, key);

async function check() {
  const { data: events } = await supabase.from('events').select('id, title');
  console.log("Events:");
  events.forEach(e => console.log(`  [${e.id}] "${e.title}"`));

  const { data: tickets } = await supabase.from('tickets')
    .select('id, event_id, event_title, status, tx_ref')
    .order('created_at', { ascending: false });
  
  console.log("\nTickets (showing event_id + event_title):");
  tickets.forEach(t => console.log(`  event_id=${t.event_id || 'NULL'}, event_title="${t.event_title || 'NULL'}", status=${t.status}, tx_ref=${t.tx_ref?.substring(0,20)}`));
  
  // Show null event_id tickets with event_title
  const nullEventIdWithTitle = tickets.filter(t => !t.event_id && t.event_title);
  console.log(`\nTickets with event_id=NULL but have event_title: ${nullEventIdWithTitle.length}`);
  nullEventIdWithTitle.forEach(t => console.log(`  event_title="${t.event_title}", status=${t.status}`));
}

check();
