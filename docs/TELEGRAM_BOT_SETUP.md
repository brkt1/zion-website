# Telegram Bot Setup Guide

This guide will help you set up the Yenege Events Telegram bot to provide event information, ticket verification, and notifications to your users.

## Features

The Telegram bot provides the following features:

- 📅 **View Upcoming Events** - Users can see upcoming events with details
- 🎫 **Ticket Verification** - Verify tickets using transaction reference
- 🔔 **Event Notifications** - Subscribe to receive notifications about new events
- ℹ️ **Event Information** - Get detailed information about specific events
- 💬 **Interactive Commands** - Easy-to-use commands for all features

## Prerequisites

1. A Telegram bot token (you already have this: `8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI`)
2. Your backend server running and accessible via HTTPS (for webhook)
3. Supabase database with the `telegram_subscriptions` table created

## Step 1: Create Database Table

Run the SQL script to create the Telegram subscriptions table:

```bash
# In Supabase SQL Editor, run:
docs/scripts/create-telegram-subscriptions-table.sql
```

Or manually execute:

```sql
CREATE TABLE IF NOT EXISTS telegram_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  username TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telegram_subscriptions_chat_id ON telegram_subscriptions(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_subscriptions_user_id ON telegram_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_subscriptions_is_active ON telegram_subscriptions(is_active);

ALTER TABLE telegram_subscriptions ENABLE ROW LEVEL SECURITY;
```

## Step 2: Configure Environment Variables

Add the Telegram bot configuration to your server's `.env` file:

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI

# Admin API Token (for protecting admin endpoints)
# Generated with: openssl rand -hex 32
TELEGRAM_ADMIN_API_TOKEN=2d26b8e7c3a0a11a05c1287975c4934628ccaf83482cc741b0c862e6abb7466a

# Telegram Admin User IDs (comma-separated)
# Get your Telegram user ID by messaging @userinfobot on Telegram
# Example: TELEGRAM_ADMIN_USER_IDS=123456789,987654321
TELEGRAM_ADMIN_USER_IDS=YOUR_TELEGRAM_USER_ID
```

**Important:** 
- Make sure this is in the `server/.env` file, not the root `.env` file.
- To get your Telegram user ID, message [@userinfobot](https://t.me/userinfobot) on Telegram
- Add your user ID to `TELEGRAM_ADMIN_USER_IDS` to enable admin commands
- The `TELEGRAM_ADMIN_API_TOKEN` protects admin API endpoints

## Step 3: Set Up Webhook

The bot uses webhooks to receive updates from Telegram. You need to set the webhook URL to point to your backend server.

### Option A: Using Telegram Bot API Directly (Easiest)

```bash
# Replace with your actual backend URL (likely: https://zion-website-yy1v.onrender.com)
curl -X POST "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://zion-website-yy1v.onrender.com/api/telegram/webhook"}'
```

**Note:** Replace `zion-website-yy1v.onrender.com` with your actual backend URL if different.

### Option B: Using the API Endpoint (Requires Admin Token)

Once your server is running, set the webhook:

```bash
# Replace YOUR_BACKEND_URL with your actual backend URL
curl -X POST "https://YOUR_BACKEND_URL/api/telegram/set-webhook" \
  -H "Authorization: Bearer 2d26b8e7c3a0a11a05c1287975c4934628ccaf83482cc741b0c862e6abb7466a" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://YOUR_BACKEND_URL/api/telegram/webhook"}'
```

### Option C: Using the Bot Info Endpoint

Test if your bot is configured correctly:

```bash
curl https://YOUR_BACKEND_URL/api/telegram/info
```

## Step 4: Add Bot to Your Telegram Group

1. Open your Telegram group
2. Go to group settings → Administrators
3. Click "Add Administrator"
4. Search for your bot: `@Yenege_bot`
5. **Important:** Grant the bot these permissions:
   - ✅ Delete messages
   - ✅ Ban users
   - ✅ Restrict members
   - ✅ Pin messages
   - ✅ Add new admins (optional)

## Step 5: Verify Bot is Updated

**Quick Check:**
1. Send `/version` to the bot in Telegram
2. You should see "Version: 2.0.0" and a list of features including "Group moderation"

If you see the new version, the bot is updated! ✅

For detailed verification steps, see [TELEGRAM_BOT_VERIFICATION.md](./TELEGRAM_BOT_VERIFICATION.md)

## Step 6: Test the Bot

### In Private Chat:
1. Open Telegram and search for your bot: `@Yenege_bot`
2. Start a conversation with `/start`
3. Try the following commands:
   - `/events` - View upcoming events
   - `/help` - See all available commands
   - `/subscribe` - Subscribe to notifications

### In Group:
1. Add the bot to your group (see Step 4)
2. Make the bot an administrator with proper permissions
3. Try group admin commands:
   - `/rules` - Show group rules
   - `/groupinfo` - Get group information
   - Reply to a message and use `/ban` to ban a user (test with caution!)

## Available Commands

### User Commands

| Command | Description |
|---------|-------------|
| `/start` | Start the bot and see welcome message |
| `/help` | Show help message with all commands |
| `/events` | View upcoming events (shows up to 5) |
| `/event_[id]` | Get details about a specific event |
| `/verify [tx_ref]` | Verify a ticket by transaction reference |
| `/subscribe` | Subscribe to event notifications |
| `/unsubscribe` | Unsubscribe from notifications |

### Admin Commands (Requires Admin Access)

| Command | Description |
|---------|-------------|
| `/stats` | Get website statistics (events, tickets, revenue, subscribers) |
| `/activity [limit]` | Get recent ticket sales (default: 10, max: 50) |
| `/broadcast [message]` | Broadcast message to all subscribers |
| `/admin_help` | Show admin commands help |

**To enable admin commands:**
1. Get your Telegram user ID by messaging [@userinfobot](https://t.me/userinfobot)
2. Add your user ID to `TELEGRAM_ADMIN_USER_IDS` in `server/.env` (comma-separated for multiple admins)
3. Restart your server

### Group Admin Commands (For Telegram Groups)

These commands work in Telegram groups and require the bot to be an admin with appropriate permissions:

| Command | Description | Usage |
|---------|-------------|-------|
| `/ban` | Ban a user from the group | Reply to user's message and use `/ban` |
| `/unban [user_id]` | Unban a user | Reply to message or provide user ID |
| `/kick` | Kick a user from the group | Reply to user's message and use `/kick` |
| `/mute [hours]` | Mute a user (default: 24 hours) | Reply to message and use `/mute 12` |
| `/unmute` | Unmute a user | Reply to user's message and use `/unmute` |
| `/del` or `/delete` | Delete a message | Reply to message and use `/del` |
| `/pin [silent]` | Pin a message | Reply to message and use `/pin` (add `silent` for no notification) |
| `/unpin` | Unpin the pinned message | Use `/unpin` |
| `/groupinfo` or `/ginfo` | Get group information | Use `/groupinfo` |
| `/rules` | Show group rules | Use `/rules` |

**Note:** The bot automatically sends welcome messages when new members join the group.

## Example Usage

### View Upcoming Events
```
User: /events
Bot: [Shows list of upcoming events with details]
```

### Verify a Ticket
```
User: /verify YENEGE123456
Bot: [Shows ticket status and details]
```

### Get Event Details
```
User: /event_abc123-def456-ghi789
Bot: [Shows detailed event information]
```

## Admin Features

### Setting Up Admin Access

**Option 1: Using Environment Variable (Quick Setup)**

1. Get your Telegram user ID:
   - Message [@userinfobot](https://t.me/userinfobot) on Telegram
   - Copy your user ID (it's a number like `123456789`)

2. Add to `server/.env`:
   ```bash
   TELEGRAM_ADMIN_USER_IDS=123456789,987654321
   ```
   (Use comma to separate multiple admin IDs)

3. Restart your server

**Option 2: Using Database (Recommended for Production)**

1. Create the admin users table:
   ```sql
   -- Run in Supabase SQL Editor
   docs/scripts/create-telegram-admin-users-table.sql
   ```

2. Link your Telegram account to your admin user:
   ```sql
   -- Replace with your actual Telegram user ID and email
   INSERT INTO telegram_admin_users (telegram_user_id, user_id, username, first_name, is_active)
   SELECT 'YOUR_TELEGRAM_USER_ID', u.id, 'your_username', 'Your Name', true
   FROM auth.users u
   WHERE u.email = 'your-admin-email@example.com'
   ON CONFLICT (telegram_user_id) DO UPDATE 
   SET user_id = EXCLUDED.user_id, updated_at = NOW();
   ```

### Using Admin Commands

Once set up, you can use admin commands directly in Telegram:

- `/stats` - View comprehensive website statistics
- `/activity 20` - View last 20 ticket sales
- `/broadcast New event announced! 🎉` - Send message to all subscribers
- `/admin_help` - See all admin commands

### API Endpoints for Admin

**Broadcast Messages**

Send a message to all subscribers via API:

```bash
curl -X POST "https://YOUR_BACKEND_URL/api/telegram/broadcast" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "🎉 New event announced! Check it out at /events",
    "parse_mode": "HTML"
  }'
```

**Send Message to Specific Chat**

```bash
curl -X POST "https://YOUR_BACKEND_URL/api/telegram/send-message" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "123456789",
    "text": "Your payment was successful!",
    "parse_mode": "HTML"
  }'
```

## Integration with Payment Flow

The bot can send payment confirmations to users. To enable this:

1. Users need to subscribe via `/subscribe`
2. (Optional) Link Telegram chat_id to customer email/phone in the database
3. Payment confirmations will be sent automatically when payments are successful

**Note:** Currently, users can verify their tickets manually using `/verify [tx_ref]` after making a payment.

## Troubleshooting

### Bot Not Responding

1. Check if the webhook is set correctly:
   ```bash
   curl "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/getWebhookInfo"
   ```

2. Check server logs for errors
3. Verify `TELEGRAM_BOT_TOKEN` is set in `server/.env`
4. Ensure your server is accessible via HTTPS (Telegram requires HTTPS for webhooks)

### Webhook Not Receiving Updates

1. Make sure your server URL is publicly accessible
2. Check that the webhook URL is correct and returns 200 OK
3. Verify SSL certificate is valid (Telegram requires valid SSL)

### Database Errors

1. Ensure the `telegram_subscriptions` table exists
2. Check Supabase RLS policies are set correctly
3. Verify service role key has proper permissions

## Security Notes

- **Never commit** your bot token to version control
- Use environment variables for all sensitive data
- The bot token in this guide should be rotated if exposed
- Webhook endpoint should be rate-limited (already configured)
- Consider adding authentication for admin endpoints

## Next Steps

1. **Customize Messages**: Edit `server/src/services/telegram.ts` to customize bot messages
2. **Add More Commands**: Extend the bot with additional features as needed
3. **Link Subscriptions**: Enhance the system to link Telegram subscriptions with customer emails/phones
4. **Event Notifications**: Set up automatic notifications when new events are created
5. **Analytics**: Track bot usage and popular commands

## Support

For issues or questions:
- Check server logs: `server/logs/` (if logging is configured)
- Review Telegram Bot API documentation: https://core.telegram.org/bots/api
- Contact: info@yenege.com

