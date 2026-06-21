const { createClient } = require('@supabase/supabase-js');

const url = "https://zjhnvtegoarvdqakqqkd.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaG52dGVnb2FydmRxYWtxcWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTEwNjcsImV4cCI6MjA3ODE2NzA2N30.psUwlT7mj-N9p4JN2DByHLnayrIkoeBdI81lcQWgmII";

const supabase = createClient(url, key);

async function test() {
  const tx_ref = "TEST-INSERT-" + Math.floor(Math.random() * 1000000);
  console.log("Testing insert with tx_ref:", tx_ref);
  const { data, error } = await supabase.from('tickets').insert([{
    tx_ref,
    customer_email: "test@example.com",
    amount: 10,
    quantity: 1,
    status: "success"
  }]);
  if (error) {
    console.error("Insert Error:", error.message, error.details, error.hint);
  } else {
    console.log("Insert Success! Data:", data);
  }

  // Also test update
  console.log("\nTesting update...");
  const { data: updateData, error: updateError } = await supabase.from('tickets')
    .update({ status: 'failed' })
    .eq('tx_ref', 'YENEGE-MQN9Y3WSFFJ8ZS26WXD');
  if (updateError) {
    console.error("Update Error:", updateError.message, updateError.details, updateError.hint);
  } else {
    console.log("Update Success! Data:", updateData);
  }
  
  // Also test event update
  console.log("\nTesting event update...");
  const { data: eventData, error: eventError } = await supabase.from('events')
    .update({ attendees: 20 })
    .eq('id', 'e89d5048-8baf-4f17-b488-3171dc427a7f');
  if (eventError) {
    console.error("Event Update Error:", eventError.message, eventError.details, eventError.hint);
  } else {
    console.log("Event Update Success! Data:", eventData);
  }
}

test();
