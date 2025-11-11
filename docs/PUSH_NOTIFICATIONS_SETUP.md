# Web Push Notifications Setup Guide

This guide will help you set up Web Push notifications so users can receive notifications even when the app is closed.

## Prerequisites

1. Backend server running
2. Supabase database configured
3. VAPID keys generated

## Step 1: Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for Web Push. Generate them using:

```bash
npx web-push generate-vapid-keys
```

This will output:
- Public Key (VAPID_PUBLIC_KEY)
- Private Key (VAPID_PRIVATE_KEY)

## Step 2: Add Environment Variables

### Backend (.env file in `server/` directory)

```env
# VAPID Keys for Web Push
VAPID_PUBLIC_KEY=your-public-key-here
VAPID_PRIVATE_KEY=your-private-key-here
VAPID_SUBJECT=mailto:admin@yenege.com

# Supabase (for storing push subscriptions)
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Frontend (.env file in root directory)

```env
# Optional: VAPID Public Key (will be fetched from backend if not set)
REACT_APP_VAPID_PUBLIC_KEY=your-public-key-here

# Backend API URL
REACT_APP_API_URL=https://your-backend-url.com/api
```

## Step 3: Create Database Table

Run the SQL script in your Supabase SQL Editor:

```sql
-- File: docs/scripts/create-push-subscriptions-table.sql
```

This creates the `push_subscriptions` table to store user push subscriptions.

## Step 4: Install Backend Dependencies

In the `server/` directory:

```bash
npm install
```

This will install:
- `web-push` - For sending push notifications
- `@supabase/supabase-js` - For database operations

## Step 5: How It Works

### For Users:

1. **Install PWA**: When users install the app, they'll be prompted for notification permission
2. **Automatic Subscription**: Once permission is granted, the app automatically subscribes to push notifications
3. **Receive Notifications**: Users will receive notifications for:
   - New events launched
   - Events happening tomorrow (24-hour reminder)

### For Admins:

1. **Automatic Notifications**: When you create a new event in the admin panel, all subscribed users automatically receive a push notification
2. **Manual Send**: You can also send push notifications manually via the API endpoint `/api/push/send`

## Step 6: Testing

1. Install the PWA on your device
2. Grant notification permission
3. Create a new event in the admin panel
4. You should receive a push notification even if the app is closed!

## API Endpoints

### GET `/api/push/vapid-public-key`
Returns the VAPID public key for client subscription.

### POST `/api/push/subscribe`
Save a push subscription.
```json
{
  "endpoint": "https://...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

### POST `/api/push/unsubscribe`
Remove a push subscription.
```json
{
  "endpoint": "https://..."
}
```

### POST `/api/push/send`
Send a push notification to all subscribers (admin only).
```json
{
  "title": "Notification Title",
  "body": "Notification body text",
  "icon": "/icon-192x192.png",
  "image": "https://...",
  "url": "/events/123",
  "tag": "unique-tag"
}
```

## Troubleshooting

1. **Notifications not working?**
   - Check that VAPID keys are set correctly
   - Verify service worker is registered
   - Check browser console for errors
   - Ensure HTTPS is enabled (required for push notifications)

2. **Backend errors?**
   - Verify Supabase credentials are correct
   - Check that push_subscriptions table exists
   - Ensure web-push package is installed

3. **Permission denied?**
   - Users must grant notification permission
   - Some browsers require user interaction before requesting permission

## Security Notes

- VAPID private key should NEVER be exposed to the frontend
- Only the public key is sent to clients
- Push subscriptions are stored securely in the database
- Backend uses service role key to bypass RLS for sending notifications

