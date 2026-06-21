const { createClient } = require('@supabase/supabase-js');

const url = "https://zjhnvtegoarvdqakqqkd.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaG52dGVnb2FydmRxYWtxcWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTEwNjcsImV4cCI6MjA3ODE2NzA2N30.psUwlT7mj-N9p4JN2DByHLnayrIkoeBdI81lcQWgmII";

const supabase = createClient(url, key);

async function run() {
  console.log("1. Linking Nana Na's ticket YENEGE-MQN9Y3WSFFJ8ZS26WXD...");
  const { data: nanaUpdate, error: nanaError } = await supabase
    .from('tickets')
    .update({
      event_id: 'e89d5048-8baf-4f17-b488-3171dc427a7f',
      event_title: 'Splash & Run Carnival 2026'
    })
    .eq('tx_ref', 'YENEGE-MQN9Y3WSFFJ8ZS26WXD');

  if (nanaError) {
    console.error("Error linking Nana's ticket:", nanaError);
  } else {
    console.log("Successfully linked Nana's ticket!");
  }

  console.log("\n2. Linking other legacy tickets by title...");
  // Fetch events to match titles
  const { data: events, error: eventsError } = await supabase.from('events').select('id, title');
  if (eventsError) {
    console.error("Error fetching events:", eventsError);
    return;
  }

  for (const event of events) {
    const { data: linkedData, error: linkError } = await supabase
      .from('tickets')
      .update({ event_id: event.id })
      .is('event_id', null)
      .eq('event_title', event.title);

    if (linkError) {
      console.error(`Error linking tickets for "${event.title}":`, linkError);
    } else {
      console.log(`Matched tickets for "${event.title}"`);
    }
  }

  console.log("\n3. Recalculating and syncing attendee counts for all events...");
  for (const event of events) {
    // Fetch count of successful ticket quantities for this event
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('quantity')
      .eq('event_id', event.id)
      .eq('status', 'success');

    if (ticketsError) {
      console.error(`Error fetching tickets for event ${event.title}:`, ticketsError);
      continue;
    }

    const totalQuantity = tickets.reduce((sum, t) => sum + (Number(t.quantity) || 1), 0);
    console.log(`Event "${event.title}": calculated attendees = ${totalQuantity}`);

    const { error: updateError } = await supabase
      .from('events')
      .update({ attendees: totalQuantity })
      .eq('id', event.id);

    if (updateError) {
      console.error(`Error updating attendees for event ${event.title}:`, updateError);
    } else {
      console.log(`Synced event "${event.title}" attendees count to ${totalQuantity}!`);
    }
  }

  console.log("\nDatabase sync complete!");
}

run();
