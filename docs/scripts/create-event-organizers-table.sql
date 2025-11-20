-- Event Organizers Table
-- This table assigns event organizers (users with 'event_organizer' role) to specific events

CREATE TABLE IF NOT EXISTS event_organizers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_event_organizers_event_id ON event_organizers(event_id);
CREATE INDEX IF NOT EXISTS idx_event_organizers_user_id ON event_organizers(user_id);
CREATE INDEX IF NOT EXISTS idx_event_organizers_user_email ON event_organizers(user_email);

-- Enable Row Level Security
ALTER TABLE event_organizers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow admins full access
CREATE POLICY "Allow admins full access to event_organizers" ON event_organizers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Policy: Allow event organizers to read their own assignments
CREATE POLICY "Allow organizers to read their assignments" ON event_organizers
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Add comments
COMMENT ON TABLE event_organizers IS 'Assigns event organizers to specific events for project management';
COMMENT ON COLUMN event_organizers.event_id IS 'The event this organizer is assigned to';
COMMENT ON COLUMN event_organizers.user_id IS 'The user ID of the event organizer';
COMMENT ON COLUMN event_organizers.user_email IS 'The email of the event organizer (for easier lookups)';

