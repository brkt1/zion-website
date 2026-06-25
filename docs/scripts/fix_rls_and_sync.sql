-- ============================================================
-- SECURE RLS POLICY FIX
-- 
-- Architecture:
--   anon (browser/public)  → READ ONLY
--   authenticated (admin)  → FULL CRUD on events, read tickets
--   service_role (backend) → Bypasses RLS entirely (set SUPABASE_SERVICE_ROLE_KEY on Render)
--
-- The backend server uses the service_role key to insert/update
-- tickets and update attendee counts after payment verification.
-- ============================================================

-- ── TICKETS table ────────────────────────────────────────────

-- Drop ALL existing policies (safe if they don't exist)
DROP POLICY IF EXISTS "Allow public read access on tickets" ON tickets;
DROP POLICY IF EXISTS "Allow public insert on tickets" ON tickets;
DROP POLICY IF EXISTS "Allow public update on tickets" ON tickets;
DROP POLICY IF EXISTS "Allow anon insert on tickets" ON tickets;
DROP POLICY IF EXISTS "Allow anon update on tickets" ON tickets;
DROP POLICY IF EXISTS "Allow anon select on tickets" ON tickets;

-- ✅ Public can READ tickets (for QR verification, ticket lookup)
CREATE POLICY "Allow public read access on tickets"
  ON tickets FOR SELECT TO anon USING (true);

-- 🔒 Only the backend (service_role) can INSERT/UPDATE tickets
--    No anon INSERT or UPDATE — this prevents fake ticket creation


-- ── EVENTS table ──────────────────────────────────────────────

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Allow public read access on events" ON events;
DROP POLICY IF EXISTS "Allow anon update on events" ON events;
DROP POLICY IF EXISTS "Allow anon update attendees on events" ON events;
DROP POLICY IF EXISTS "Allow anon select on events" ON events;
DROP POLICY IF EXISTS "Public Events are viewable by everyone." ON events;
DROP POLICY IF EXISTS "Enable read access for all users" ON events;

-- ✅ Public can READ events (homepage, event listing)
CREATE POLICY "Allow public read access on events"
  ON events FOR SELECT TO anon USING (true);

-- ✅ Authenticated admins can fully manage events
CREATE POLICY "Admins can manage events"
  ON events FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 🔒 Only backend (service_role) updates attendee counts
--    No anon UPDATE — this prevents count manipulation


-- ============================================================
-- DATA FIX: Link orphan tickets and sync attendee counts
-- (These run as superuser in the SQL editor, so they work
--  regardless of RLS policies above)
-- ============================================================

-- 1. Link Nana Na's ticket to Splash & Run
UPDATE tickets
SET
  event_id    = 'e89d5048-8baf-4f17-b488-3171dc427a7f',
  event_title = 'Splash & Run Carnival 2026'
WHERE tx_ref = 'YENEGE-MQN9Y3WSFFJ8ZS26WXD'
  AND event_id IS NULL;

-- 2. Link remaining orphan tickets that have event_title but no event_id
UPDATE tickets t
SET event_id = e.id
FROM events e
WHERE t.event_id IS NULL
  AND lower(trim(t.event_title)) = lower(trim(e.title));

-- 3. Remove test ticket
DELETE FROM tickets WHERE tx_ref = 'TEST-INSERT-197633';

-- 4. Recalculate attendee counts (skip free_reg_ duplicates)
UPDATE events e
SET attendees = (
  SELECT COALESCE(SUM(t.quantity), 0)
  FROM tickets t
  WHERE t.event_id = e.id
    AND t.status   = 'success'
    AND t.tx_ref NOT LIKE 'free_reg_%'
);
