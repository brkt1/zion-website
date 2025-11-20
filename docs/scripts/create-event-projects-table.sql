-- Event Projects/Tasks Table for Project Management
-- This table stores tasks and project items for events

CREATE TABLE IF NOT EXISTS event_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee_email TEXT,
  assignee_name TEXT,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_event_projects_event_id ON event_projects(event_id);
CREATE INDEX IF NOT EXISTS idx_event_projects_status ON event_projects(status);
CREATE INDEX IF NOT EXISTS idx_event_projects_assignee_email ON event_projects(assignee_email);
CREATE INDEX IF NOT EXISTS idx_event_projects_due_date ON event_projects(due_date);


-- Enable Row Level Security
ALTER TABLE event_projects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow admins full access to event_projects
-- Uses the is_admin function from user_roles table
CREATE POLICY "Allow admins full access to event_projects" ON event_projects
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

-- Policy: Allow event organizers to manage projects for their assigned events
CREATE POLICY "Allow event organizers to manage their event projects" ON event_projects
  FOR ALL
  USING (
    -- Check if user is an event organizer assigned to this event
    EXISTS (
      SELECT 1 FROM event_organizers
      WHERE event_organizers.event_id = event_projects.event_id
      AND event_organizers.user_id = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'event_organizer'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM event_organizers
      WHERE event_organizers.event_id = event_projects.event_id
      AND event_organizers.user_id = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'event_organizer'
    )
  );

-- Policy: Allow authenticated users to read their assigned tasks
CREATE POLICY "Allow users to read assigned tasks" ON event_projects
  FOR SELECT
  USING (
    -- Admins can read all
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
    OR
    -- Event organizers can read tasks for their assigned events
    EXISTS (
      SELECT 1 FROM event_organizers
      WHERE event_organizers.event_id = event_projects.event_id
      AND event_organizers.user_id = auth.uid()
    )
    OR
    -- Users can read tasks assigned to them (by email)
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = event_projects.assignee_email
    )
  );

-- Policy: Allow public read access (for viewing project status on event pages)
CREATE POLICY "Allow public read access on event_projects" ON event_projects
  FOR SELECT
  USING (true);

-- Add comment to explain the table
COMMENT ON TABLE event_projects IS 'Project management tasks and items for events';
COMMENT ON COLUMN event_projects.event_id IS 'Reference to the event this task belongs to';
COMMENT ON COLUMN event_projects.status IS 'Task status: pending, in_progress, completed, or cancelled';
COMMENT ON COLUMN event_projects.priority IS 'Task priority: low, medium, high, or urgent';
COMMENT ON COLUMN event_projects.assignee_email IS 'Email of the person assigned to this task';
COMMENT ON COLUMN event_projects.assignee_name IS 'Name of the person assigned to this task';
COMMENT ON COLUMN event_projects.due_date IS 'Due date for the task';
COMMENT ON COLUMN event_projects.completed_at IS 'Timestamp when the task was completed';

