# Event Project Management System

## Overview

The Event Project Management system allows you to create and manage tasks for events. It supports role-based access control with two main roles:

- **Admin**: Can manage projects for all events
- **Event Organizer**: Can manage projects only for events they're assigned to

## Setup Instructions

### 1. Database Setup

Run these SQL scripts in your Supabase SQL Editor in order:

1. **Update user_roles table** (if not already done):
   ```sql
   -- Update the role check constraint to include 'event_organizer'
   ALTER TABLE user_roles 
   DROP CONSTRAINT IF EXISTS user_roles_role_check;
   
   ALTER TABLE user_roles 
   ADD CONSTRAINT user_roles_role_check 
   CHECK (role IN ('admin', 'user', 'event_organizer'));
   ```

2. **Create event_projects table**:
   - Run: `docs/scripts/create-event-projects-table.sql`

3. **Create event_organizers table**:
   - Run: `docs/scripts/create-event-organizers-table.sql`

### 2. Assign Event Organizer Role

To make a user an event organizer:

```sql
-- Replace 'USER_EMAIL_HERE' with the email of the user
INSERT INTO user_roles (user_id, role)
SELECT id, 'event_organizer'
FROM auth.users
WHERE email = 'USER_EMAIL_HERE'
ON CONFLICT (user_id) DO UPDATE SET role = 'event_organizer';
```

### 3. Assign Organizers to Events

Admins can assign event organizers to specific events. This can be done through the admin API or directly in the database:

```sql
-- Assign an organizer to an event
-- Replace EVENT_ID, USER_ID, and USER_EMAIL with actual values
INSERT INTO event_organizers (event_id, user_id, user_email)
VALUES (
  'EVENT_ID_HERE',
  'USER_ID_HERE',
  'user@example.com'
);
```

## Features

### For Admins

- View and manage projects for all events
- Assign event organizers to events
- Create, edit, and delete tasks
- View progress statistics

### For Event Organizers

- View and manage projects only for assigned events
- Create, edit, and delete tasks for their events
- Assign tasks to team members
- Track task progress

## Task Management

### Task Properties

- **Title**: Required task name
- **Description**: Optional detailed description
- **Status**: pending, in_progress, completed, cancelled
- **Priority**: low, medium, high, urgent
- **Assignee**: Name and email of person responsible
- **Due Date**: Optional deadline

### Task Status Flow

```
pending → in_progress → completed
         ↓
      cancelled
```

## Access Control

### Row Level Security (RLS)

The system uses Supabase RLS policies to enforce access:

1. **Admins**: Full access to all event projects
2. **Event Organizers**: Can only manage projects for events they're assigned to
3. **Public**: Read-only access to view project status

### API Access

- Event organizers can only query projects for their assigned events
- Admins can query all projects
- Users can read tasks assigned to them (by email)

## Usage

### Accessing the Project Management Page

1. Navigate to `/admin/event-projects`
2. Select an event from the dropdown
3. View existing tasks or create new ones

### Creating a Task

1. Click "Add Task" button
2. Fill in task details:
   - Title (required)
   - Description (optional)
   - Status
   - Priority
   - Assignee information
   - Due date
3. Click "Create"

### Managing Tasks

- **Mark Complete**: Click the checkbox next to a task
- **Edit**: Click the edit icon
- **Delete**: Click the delete icon
- **Filter**: Use status and priority filters

## Progress Tracking

The system automatically calculates:
- Total tasks
- Completed tasks
- In progress tasks
- Pending tasks
- Overall progress percentage

## Best Practices

1. **Assign Clear Tasks**: Use descriptive titles and detailed descriptions
2. **Set Priorities**: Use priority levels to focus on important tasks
3. **Set Due Dates**: Help team members manage deadlines
4. **Assign Responsibilities**: Use assignee fields to track ownership
5. **Update Status**: Keep task status current for accurate progress tracking

## Troubleshooting

### Event Organizer Can't See Events

- Verify the user has `event_organizer` role in `user_roles` table
- Check that the user is assigned to events in `event_organizers` table
- Ensure the user is logged in with the correct account

### Can't Create/Edit Tasks

- Verify RLS policies are correctly set up
- Check that the user has the correct role
- Ensure the user is assigned to the event (for organizers)

### Tasks Not Showing

- Check filters (status, priority)
- Verify the event is selected
- Ensure RLS policies allow access

