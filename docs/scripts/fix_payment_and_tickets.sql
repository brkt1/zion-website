-- ============================================================
-- EMERGENCY FIX: Restore ticket visibility after RLS changes
-- ============================================================
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================================

-- ── STEP 1: Ensure SELECT policy exists for tickets ──────────
-- This is the most critical policy - without it, no one can see tickets
DROP POLICY IF EXISTS "Allow public read access on tickets" ON tickets;
CREATE POLICY "Allow public read access on tickets"
  ON tickets FOR SELECT USING (true);

-- ── STEP 2: Ensure SELECT policy exists for events ───────────
DROP POLICY IF EXISTS "Allow public read access on events" ON events;
CREATE POLICY "Allow public read access on events"
  ON events FOR SELECT USING (true);

-- ── STEP 3: Allow anon to INSERT tickets (for frontend) ──────
DROP POLICY IF EXISTS "Allow anon insert on tickets" ON tickets;
CREATE POLICY "Allow anon insert on tickets"
  ON tickets FOR INSERT WITH CHECK (true);

-- ── STEP 4: Allow anon to UPDATE tickets ─────────────────────
DROP POLICY IF EXISTS "Allow anon update on tickets" ON tickets;
CREATE POLICY "Allow anon update on tickets"
  ON tickets FOR UPDATE USING (true) WITH CHECK (true);

-- ── STEP 5: Allow authenticated full CRUD on tickets ─────────
DROP POLICY IF EXISTS "Authenticated users can manage tickets" ON tickets;
CREATE POLICY "Authenticated users can manage tickets"
  ON tickets FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── STEP 6: Allow anon to UPDATE events (attendee count) ─────
DROP POLICY IF EXISTS "Allow anon update attendees on events" ON events;
CREATE POLICY "Allow anon update attendees on events"
  ON events FOR UPDATE USING (true) WITH CHECK (true);

-- ── STEP 7: Allow authenticated full CRUD on events ──────────
DROP POLICY IF EXISTS "Admins can manage events" ON events;
CREATE POLICY "Admins can manage events"
  ON events FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── STEP 8: Fix the CHECK constraint safely ──────────────────
-- First, find and drop ALL check constraints on the status column
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE rel.relname = 'tickets'
      AND con.contype = 'c'  -- check constraint
      AND pg_get_constraintdef(con.oid) LIKE '%status%'
  LOOP
    EXECUTE 'ALTER TABLE tickets DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    RAISE NOTICE 'Dropped constraint: %', r.conname;
  END LOOP;
END $$;

-- Now add the correct constraint with all valid statuses
ALTER TABLE tickets ADD CONSTRAINT tickets_status_check 
  CHECK (status IN ('pending', 'success', 'failed', 'cancelled', 'used'));

-- ── STEP 9: Verify everything looks good ─────────────────────
-- Show all policies on tickets
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('tickets', 'events')
ORDER BY tablename, policyname;
