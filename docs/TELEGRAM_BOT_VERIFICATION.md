# Telegram Bot Verification Guide

This guide will help you verify that your Telegram bot has been updated with all the new features.

## Quick Verification Steps

### 1. Check Bot Status

**In Telegram:**
1. Open Telegram and search for `@Yenege_bot`
2. Send `/version` or `/botinfo`
3. You should see:
   - Bot name and username
   - Version: 2.0.0
   - List of features including "Group moderation"

**Via API:**
```bash
curl https://YOUR_BACKEND_URL/api/telegram/info
```

Expected response:
```json
{
  "ok": true,
  "result": {
    "id": 123456789,
    "is_bot": true,
    "first_name": "Yenege Bot",
    "username": "Yenege_bot",
    ...
  }
}
```

### 2. Test Basic Commands

**In Private Chat with Bot:**
1. Send `/start` - Should show welcome message with admin commands (if you're admin)
2. Send `/help` - Should show all available commands
3. Send `/events` - Should list upcoming events
4. Send `/version` - Should show bot information with version 2.0.0

### 3. Test Admin Commands (If You're Admin)

**In Private Chat:**
1. Send `/stats` - Should show website statistics
2. Send `/activity` - Should show recent ticket sales
3. Send `/admin_help` - Should show admin commands

**Note:** Make sure your Telegram user ID is in `TELEGRAM_ADMIN_USER_IDS` in `server/.env`

### 4. Test Group Admin Commands

**In Your Telegram Group:**
1. Make sure the bot is added as an administrator
2. Send `/rules` - Should display group rules
3. Send `/groupinfo` - Should show group information
4. Reply to a message and send `/del` - Should delete the message (if you're group admin)

### 5. Test Welcome Messages

**In Your Telegram Group:**
1. Have someone new join the group (or use a test account)
2. The bot should automatically send a welcome message

## Server-Side Verification

### Check Server Logs

**If running locally:**
```bash
cd server
npm run dev
```

Look for these log messages on startup:
```
📋 Environment check:
  Telegram Bot: ✅ Configured
```

**If running in production:**
Check your server logs (Railway, Render, etc.) for:
- "Telegram Bot: ✅ Configured"
- No errors related to Telegram

### Check Webhook Status

**Via Telegram API:**
```bash
curl "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/getWebhookInfo"
```

Expected response should show:
- `url`: Your webhook URL (e.g., `https://your-backend.com/api/telegram/webhook`)
- `pending_update_count`: Should be 0 or low number
- `last_error_date`: Should be null or recent timestamp

### Test Webhook Manually

**Send a test update:**
```bash
curl -X POST "https://YOUR_BACKEND_URL/api/telegram/webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "update_id": 123456789,
    "message": {
      "message_id": 1,
      "from": {
        "id": YOUR_TELEGRAM_USER_ID,
        "is_bot": false,
        "first_name": "Test"
      },
      "chat": {
        "id": YOUR_TELEGRAM_USER_ID,
        "type": "private"
      },
      "date": 1234567890,
      "text": "/version"
    }
  }'
```

The bot should respond with version information.

## Feature Checklist

### ✅ User Features
- [ ] `/start` command works
- [ ] `/help` command works
- [ ] `/events` shows upcoming events
- [ ] `/verify [tx_ref]` verifies tickets
- [ ] `/subscribe` subscribes to notifications
- [ ] `/unsubscribe` unsubscribes

### ✅ Admin Features (Website)
- [ ] `/stats` shows website statistics
- [ ] `/activity` shows recent ticket sales
- [ ] `/broadcast` sends messages to subscribers
- [ ] `/admin_help` shows admin commands

### ✅ Group Admin Features
- [ ] `/rules` shows group rules
- [ ] `/groupinfo` shows group information
- [ ] `/ban` bans users (reply to message)
- [ ] `/kick` kicks users (reply to message)
- [ ] `/mute` mutes users (reply to message)
- [ ] `/unmute` unmutes users (reply to message)
- [ ] `/del` deletes messages (reply to message)
- [ ] `/pin` pins messages (reply to message)
- [ ] `/unpin` unpins messages
- [ ] Welcome messages work for new members

## Troubleshooting

### Bot Not Responding

1. **Check if server is running:**
   ```bash
   curl https://YOUR_BACKEND_URL/api/health
   ```

2. **Check webhook is set:**
   ```bash
   curl "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/getWebhookInfo"
   ```

3. **Check server logs for errors:**
   - Look for "Error processing Telegram webhook"
   - Check for missing environment variables

4. **Verify environment variables:**
   - `TELEGRAM_BOT_TOKEN` should be set in `server/.env`
   - `TELEGRAM_ADMIN_USER_IDS` should contain your user ID (for admin commands)

### Commands Not Working

1. **Group commands not working:**
   - Make sure bot is added as administrator
   - Check bot has required permissions (ban, delete, restrict, pin)
   - Verify you're a group admin

2. **Admin commands not working:**
   - Check your Telegram user ID is in `TELEGRAM_ADMIN_USER_IDS`
   - Get your user ID: Message [@userinfobot](https://t.me/userinfobot)
   - Restart server after updating `.env`

3. **Welcome messages not working:**
   - Make sure bot is in the group
   - Check bot has permission to send messages
   - Verify webhook is receiving updates

### Webhook Issues

**Reset webhook:**
```bash
# Delete old webhook
curl -X POST "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/deleteWebhook"

# Set new webhook
curl -X POST "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://YOUR_BACKEND_URL/api/telegram/webhook"}'
```

## Quick Test Script

Save this as `test-bot.sh`:

```bash
#!/bin/bash

BACKEND_URL="https://YOUR_BACKEND_URL"
BOT_TOKEN="8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI"

echo "1. Checking server health..."
curl -s "$BACKEND_URL/api/health" | jq '.'

echo -e "\n2. Checking bot info..."
curl -s "$BACKEND_URL/api/telegram/info" | jq '.'

echo -e "\n3. Checking webhook status..."
curl -s "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo" | jq '.'

echo -e "\n✅ Verification complete!"
```

Run with:
```bash
chmod +x test-bot.sh
./test-bot.sh
```

## Success Indicators

You'll know the bot is updated and working when:

1. ✅ `/version` shows "Version: 2.0.0"
2. ✅ `/help` includes group admin commands
3. ✅ Group commands work in your Telegram groups
4. ✅ Welcome messages appear for new members
5. ✅ Admin commands work (if you're admin)
6. ✅ Server logs show "Telegram Bot: ✅ Configured"
7. ✅ Webhook status shows your backend URL

## Need Help?

If something isn't working:
1. Check server logs for errors
2. Verify all environment variables are set
3. Make sure webhook is configured correctly
4. Test with `/version` command first
5. Check bot permissions in groups

For more details, see [TELEGRAM_BOT_SETUP.md](./TELEGRAM_BOT_SETUP.md)

