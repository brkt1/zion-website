-- ============================================================
-- FIX: Payment not saving to Supabase / Tickets not created
-- ============================================================
-- 
-- PROBLEM: After a user pays via Chapa, the ticket doesn't appear
-- in Supabase and they don't get registered.
--
-- ROOT CAUSE: RLS blocks INSERT/UPDATE from the anon key.
-- The frontend tries to save tickets using the anon key, but
-- only SELECT is allowed for anon.
--
-- SOLUTION: Allow anon to INSERT and UPDATE tickets so both the
-- frontend (PaymentSuccess page) and any fallback paths work.
-- The backend should use SERVICE_ROLE key (bypasses RLS) but
-- as a safety net, we also allow anon writes.
-- ============================================================

-- ── 1. Allow anon to INSERT tickets ──────────────────────────
DROP POLICY IF EXISTS "Allow anon insert on tickets" ON tickets;
CREATE POLICY "Allow anon insert on tickets"
  ON tickets FOR INSERT TO anon
  WITH CHECK (true);

-- ── 2. Allow anon to UPDATE tickets ──────────────────────────
DROP POLICY IF EXISTS "Allow anon update on tickets" ON tickets;
CREATE POLICY "Allow anon update on tickets"
  ON tickets FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- ── 3. Allow authenticated to full CRUD on tickets ───────────
DROP POLICY IF EXISTS "Authenticated users can manage tickets" ON tickets;
CREATE POLICY "Authenticated users can manage tickets"
  ON tickets FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── 4. Allow anon to UPDATE events (for attendee count) ──────
DROP POLICY IF EXISTS "Allow anon update attendees on events" ON events;
CREATE POLICY "Allow anon update attendees on events"
  ON events FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- ── 5. Add 'used' status to tickets status CHECK constraint ──
-- The markTicketAsUsed function sets status to 'used' but the
-- CHECK constraint doesn't include it.
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
ALTER TABLE tickets ADD CONSTRAINT tickets_status_check 
  CHECK (status IN ('pending', 'success', 'failed', 'cancelled', 'used'));

-- ── 6. Verify policies are correct ──────────────────────────
-- Run this to see all policies on tickets:
-- SELECT * FROM pg_policies WHERE tablename = 'tickets';
-- SELECT * FROM pg_policies WHERE tablename = 'events';
