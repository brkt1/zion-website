const { createClient } = require('@supabase/supabase-js');

const url = "https://zjhnvtegoarvdqakqqkd.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaG52dGVnb2FydmRxYWtxcWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTEwNjcsImV4cCI6MjA3ODE2NzA2N30.psUwlT7mj-N9p4JN2DByHLnayrIkoeBdI81lcQWgmII";

const supabase = createClient(url, key);

async function run() {
  // Step 1: Load all events
  const { data: events, error: eventsError } = await supabase.from('events').select('id, title');
  if (eventsError) { console.error('Cannot load events:', eventsError.message); return; }
  console.log(`\n=== Step 1: Loaded ${events.length} events ===`);

  // Step 2: Load all tickets
  const { data: tickets, error: ticketsError } = await supabase.from('tickets').select('id, tx_ref, event_id, event_title, status, quantity');
  if (ticketsError) { console.error('Cannot load tickets:', ticketsError.message); return; }
  console.log(`=== Step 2: Loaded ${tickets.length} tickets ===`);

  // Step 3: Link orphan tickets to events by matching event_title
  const orphans = tickets.filter(t => !t.event_id && t.event_title);
  console.log(`\n=== Step 3: Fixing ${orphans.length} orphan tickets with event_title but no event_id ===`);

  // Build event lookup map (title -> id, case-insensitive, trimmed)
  const eventMap = {};
  for (const e of events) {
    eventMap[e.title.trim().toLowerCase()] = e.id;
  }

  let linked = 0;
  for (const ticket of orphans) {
    const eventTitle = ticket.event_title?.trim().toLowerCase();
    const eventId = eventMap[eventTitle];
    if (eventId) {
      const { error } = await supabase.from('tickets').update({ event_id: eventId }).eq('id', ticket.id);
      if (error) { console.error(`  ✗ Failed to link ticket ${ticket.tx_ref}:`, error.message); }
      else { console.log(`  ✓ Linked ticket ${ticket.tx_ref?.slice(0,25)} → event_id ${eventId}`); linked++; }
    } else {
      console.log(`  ? No matching event for title: "${ticket.event_title}"`);
    }
  }
  console.log(`\n  Linked ${linked} orphan tickets.`);

  // Special case: Link Nana's ticket that has null event_title too
  const { data: nanaTicket } = await supabase.from('tickets').select('id').eq('tx_ref', 'YENEGE-MQN9Y3WSFFJ8ZS26WXD').single();
  if (nanaTicket) {
    // Find Splash & Run event
    const splashId = events.find(e => e.title.toLowerCase().includes('splash'))?.id;
    if (splashId) {
      await supabase.from('tickets').update({ event_id: splashId, event_title: 'Splash & Run Carnival 2026' }).eq('id', nanaTicket.id);
      console.log('\n  ✓ Fixed Nana Na ticket → Splash & Run Carnival 2026');
    }
  }

  // Step 4: Remove test ticket
  await supabase.from('tickets').delete().eq('tx_ref', 'TEST-INSERT-197633');
  console.log('\n  ✓ Removed test ticket TEST-INSERT-197633');

  // Step 5: Re-load tickets (now updated) and recalculate attendees per event
  const { data: allTickets } = await supabase.from('tickets').select('event_id, status, quantity, tx_ref');
  
  console.log('\n=== Step 5: Recalculating attendee counts for each event ===');
  for (const event of events) {
    const eventTickets = allTickets.filter(t => t.event_id === event.id && t.status === 'success');
    // Deduplicate: the free_reg_ tickets are duplicates of the FREE- tickets for same person
    // Filter to keep only unique tickets (free_reg_ are paired with FREE- for the same registration)
    const uniqueTxRefs = new Set();
    let totalQty = 0;
    for (const t of eventTickets) {
      // Skip the free_reg_ duplicates (they duplicate the FREE- entries)
      if (t.tx_ref && t.tx_ref.startsWith('free_reg_')) continue;
      if (!uniqueTxRefs.has(t.tx_ref)) {
        uniqueTxRefs.add(t.tx_ref);
        totalQty += Number(t.quantity) || 1;
      }
    }

    const { error: updateError } = await supabase.from('events').update({ attendees: totalQty }).eq('id', event.id);
    if (updateError) {
      console.error(`  ✗ Failed to update "${event.title}":`, updateError.message);
    } else {
      console.log(`  ✓ "${event.title}" attendees → ${totalQty}`);
    }
  }

  console.log('\n=== Done! Database is synced. ===\n');
}

run().catch(console.error);
