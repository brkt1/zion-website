# E-Learning Access Control: How Accepted Users Are Identified

## Overview

The e-learning portal uses the `applications` table in Supabase to determine which users have access. Only users with **accepted internship applications** can access the e-learning portal.

## How It Works

### 1. Application Submission
- Users submit internship applications through the `/apply` page
- Applications are stored in the `applications` table with:
  - `email`: User's email address
  - `type`: 'internship' or 'volunteer'
  - `status`: 'pending' (default), 'reviewed', 'accepted', or 'rejected'

### 2. Admin Review Process
- Admins access `/admin/applications` to review applications
- Admins can update the `status` field to:
  - **'accepted'** - User can now access e-learning
  - **'rejected'** - User cannot access e-learning
  - **'reviewed'** - Still pending, cannot access
  - **'pending'** - Still pending, cannot access

### 3. Access Check Logic

The system checks access in two places:

#### A. Before Signup (`hasAcceptedApplication` function)
```typescript
// Checks if email has an accepted internship application
- Queries: applications table
- Conditions:
  - email matches (case-insensitive)
  - status = 'accepted'
  - type = 'internship'
```

#### B. After Login (`isElearningUser` function)
```typescript
// Checks if logged-in user has access
- Gets user's email from session
- Calls hasAcceptedApplication(userEmail)
- Returns true/false
```

### 4. Access Flow

```
User Applies → Admin Reviews → Status = 'accepted' → User Can Sign Up/Login → Access Granted
```

## Database Structure

### Applications Table
```sql
applications (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,           -- Used to match with user account
  phone TEXT,
  type TEXT,            -- 'internship' or 'volunteer'
  status TEXT,          -- 'pending', 'reviewed', 'accepted', 'rejected'
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Key Functions

### `hasAcceptedApplication(email: string)`
- **Purpose**: Check if an email has an accepted internship application
- **Used in**: Signup process (before account creation)
- **Returns**: `true` if email has status='accepted' and type='internship'

### `isElearningUser()`
- **Purpose**: Check if current logged-in user has e-learning access
- **Used in**: Login process, route protection
- **Returns**: `true` if user's email has an accepted internship application

## Admin Actions

### To Grant E-Learning Access:
1. Go to `/admin/applications`
2. Find the internship application
3. Click "View" to open details
4. Click "Accept" button or update status to "accepted"
5. User can now sign up/login to e-learning

### To Revoke E-Learning Access:
1. Go to `/admin/applications`
2. Find the application
3. Update status to "rejected" or "pending"
4. User will lose access on next login attempt

## Security Notes

- Email matching is **case-insensitive** (handles different email formats)
- Only `type='internship'` applications grant e-learning access
- Only `status='accepted'` applications grant access
- Access is checked on every login attempt
- Users without accepted applications are automatically logged out

## Troubleshooting

### User says they can't access e-learning:
1. Check if application exists: `/admin/applications`
2. Verify email matches exactly (case-insensitive)
3. Verify `status = 'accepted'`
4. Verify `type = 'internship'`
5. Check browser console for errors

### User was accepted but still can't login:
1. User may need to sign up first (if they haven't created an account)
2. Check if email confirmation is required
3. Verify the application status was saved correctly
4. Clear browser cache and try again

