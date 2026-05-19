-- ============================================================
--  YENEGE UNITY — Supabase Database Migration
--  Run this in your Supabase SQL Editor or via `supabase db push`
-- ============================================================

-- ─────────────────────────────────────────
-- TABLE: yenege_unity_attendees
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS yenege_unity_attendees (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Personal
  full_name                 TEXT        NOT NULL,
  profile_photo             TEXT,
  gender                    TEXT        NOT NULL DEFAULT 'Male',
  age_range                 TEXT        NOT NULL DEFAULT '25-34',
  phone                     TEXT        NOT NULL,
  email                     TEXT        NOT NULL UNIQUE,
  city                      TEXT        NOT NULL,
  country                   TEXT        NOT NULL DEFAULT 'Ethiopia',

  -- Professional
  job_title                 TEXT        NOT NULL,
  company_name              TEXT        NOT NULL,
  industry                  TEXT        NOT NULL,
  years_of_experience       INTEGER     NOT NULL DEFAULT 0,
  company_size              TEXT        NOT NULL DEFAULT '1-9',
  website                   TEXT,
  linkedin                  TEXT,
  business_description      TEXT        NOT NULL,

  -- Networking Goals (Step 3)
  why_attend                TEXT        NOT NULL,
  opportunities_sought      TEXT,
  target_peoples            TEXT,
  selected_goals            TEXT[]      NOT NULL DEFAULT '{}',

  -- Business Intelligence (Step 4)
  biggest_challenge         TEXT,
  current_goals             TEXT,
  value_offer               TEXT,
  partnerships_open         TEXT,
  target_networking_sectors TEXT[]      NOT NULL DEFAULT '{}',
  connection_purpose        TEXT[]      NOT NULL DEFAULT '{}',

  -- Event Expectations (Step 5)
  event_expectations        TEXT,
  networking_style          TEXT        NOT NULL DEFAULT 'structured',
  sessions_interest         TEXT[]      NOT NULL DEFAULT '{}',
  sponsorship_interest      BOOLEAN     NOT NULL DEFAULT FALSE,

  -- CRM / Admin Fields
  status                    TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','reviewed','accepted','rejected')),
  called_status             TEXT        NOT NULL DEFAULT 'not_called'
                              CHECK (called_status IN ('not_called','called','no_answer','left_message')),
  follow_up_needed          BOOLEAN     NOT NULL DEFAULT TRUE,
  interest_level            TEXT        NOT NULL DEFAULT 'medium'
                              CHECK (interest_level IN ('low','medium','high','vip')),
  confirmed_attendance      BOOLEAN     NOT NULL DEFAULT FALSE,
  vip_candidate             BOOLEAN     NOT NULL DEFAULT FALSE,
  payment_status            TEXT        NOT NULL DEFAULT 'unpaid'
                              CHECK (payment_status IN ('unpaid','paid','waived')),
  tags                      TEXT[]      NOT NULL DEFAULT '{}',
  internal_notes            TEXT        NOT NULL DEFAULT '',

  -- Communication History stored as JSONB array
  communication_history     JSONB       NOT NULL DEFAULT '[]'::JSONB,

  -- Check-in
  checked_in                BOOLEAN     NOT NULL DEFAULT FALSE,
  checked_in_at             TIMESTAMPTZ,
  qr_code                   TEXT        UNIQUE,
  badge_printed             BOOLEAN     NOT NULL DEFAULT FALSE,

  -- Timestamps
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION update_yenege_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_attendees_updated_at ON yenege_unity_attendees;
CREATE TRIGGER trg_attendees_updated_at
  BEFORE UPDATE ON yenege_unity_attendees
  FOR EACH ROW EXECUTE FUNCTION update_yenege_updated_at();

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_yenege_attendees_status    ON yenege_unity_attendees(status);
CREATE INDEX IF NOT EXISTS idx_yenege_attendees_industry  ON yenege_unity_attendees(industry);
CREATE INDEX IF NOT EXISTS idx_yenege_attendees_email     ON yenege_unity_attendees(email);
CREATE INDEX IF NOT EXISTS idx_yenege_attendees_created   ON yenege_unity_attendees(created_at DESC);

-- ─────────────────────────────────────────
-- TABLE: yenege_unity_events
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS yenege_unity_events (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  date        TEXT    NOT NULL,  -- stored as 'YYYY-MM-DD' for simplicity
  time        TEXT    NOT NULL DEFAULT '',
  location    TEXT    NOT NULL DEFAULT '',
  capacity    INTEGER NOT NULL DEFAULT 120,

  -- Sessions and sponsors stored as JSONB arrays
  sessions    JSONB   NOT NULL DEFAULT '[]'::JSONB,
  sponsors    JSONB   NOT NULL DEFAULT '[]'::JSONB,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_events_updated_at ON yenege_unity_events;
CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON yenege_unity_events
  FOR EACH ROW EXECUTE FUNCTION update_yenege_updated_at();

-- ─────────────────────────────────────────
-- TABLE: yenege_unity_groups  (Networking Circles / Seating Tables)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS yenege_unity_groups (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT    NOT NULL,
  description   TEXT    NOT NULL DEFAULT '',
  attendee_ids  UUID[]  NOT NULL DEFAULT '{}',
  type          TEXT    NOT NULL DEFAULT 'circle'
                  CHECK (type IN ('circle','table','roundtable','lounge')),

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_groups_updated_at ON yenege_unity_groups;
CREATE TRIGGER trg_groups_updated_at
  BEFORE UPDATE ON yenege_unity_groups
  FOR EACH ROW EXECUTE FUNCTION update_yenege_updated_at();

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────

-- Attendees: public can INSERT (application form), only authenticated admins can SELECT/UPDATE/DELETE
ALTER TABLE yenege_unity_attendees ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application
CREATE POLICY "allow_public_insert_attendees"
  ON yenege_unity_attendees FOR INSERT
  WITH CHECK (TRUE);

-- Only authenticated users (admins) can read all attendees
CREATE POLICY "allow_auth_select_attendees"
  ON yenege_unity_attendees FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only authenticated users can update
CREATE POLICY "allow_auth_update_attendees"
  ON yenege_unity_attendees FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Only authenticated users can delete
CREATE POLICY "allow_auth_delete_attendees"
  ON yenege_unity_attendees FOR DELETE
  USING (auth.role() = 'authenticated');

-- Events: admin-only full access
ALTER TABLE yenege_unity_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_auth_all_events"
  ON yenege_unity_events FOR ALL
  USING (auth.role() = 'authenticated');

-- Groups: admin-only full access
ALTER TABLE yenege_unity_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_auth_all_groups"
  ON yenege_unity_groups FOR ALL
  USING (auth.role() = 'authenticated');
