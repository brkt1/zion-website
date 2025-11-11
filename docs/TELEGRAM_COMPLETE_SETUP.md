# Complete Telegram Bot Setup - All Information

## ✅ Information We Have

### Bot Token
```
8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI
```

### Admin API Token (Generated)
```
2d26b8e7c3a0a11a05c1287975c4934628ccaf83482cc741b0c862e6abb7466a
```

### Backend URL (from your code)
```
https://zion-website-yy1v.onrender.com
```

### Webhook URL
```
https://zion-website-yy1v.onrender.com/api/telegram/webhook
```

## 📝 Complete server/.env Configuration

Add these lines to your `server/.env` file:

```bash
# ============================================
# Telegram Bot Configuration
# ============================================

# Bot Token (from @BotFather)
TELEGRAM_BOT_TOKEN=8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI

# Admin API Token (for protecting admin endpoints)
# Generated with: openssl rand -hex 32
TELEGRAM_ADMIN_API_TOKEN=2d26b8e7c3a0a11a05c1287975c4934628ccaf83482cc741b0c862e6abb7466a

# Admin User IDs (get from @userinfobot on Telegram)
# Format: comma-separated list of user IDs
# Example: TELEGRAM_ADMIN_USER_IDS=123456789,987654321
TELEGRAM_ADMIN_USER_IDS=YOUR_TELEGRAM_USER_ID_HERE

# Optional: Webhook Secret (for additional security)
# TELEGRAM_WEBHOOK_SECRET=optional-secret-here
```

## 🔧 Setup Steps

### Step 1: Get Your Telegram User ID

1. Open Telegram
2. Search for `@userinfobot` or visit: https://t.me/userinfobot
3. Click "Start"
4. Copy the "Id" number (e.g., `123456789`)
5. Replace `YOUR_TELEGRAM_USER_ID_HERE` in `server/.env` with your actual ID

### Step 2: Verify Backend URL

Test if your backend is accessible:
```bash
curl https://zion-website-yy1v.onrender.com/api/health
```

If it returns `{"status":"ok"}`, that's your backend URL!

If it doesn't work, find your actual backend URL from:
- Render dashboard: https://dashboard.render.com
- Railway dashboard: https://railway.app
- Or check your hosting platform

### Step 3: Set Webhook

After deploying your backend with the updated code, set the webhook:

```bash
curl -X POST "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://zion-website-yy1v.onrender.com/api/telegram/webhook"}'
```

**Or if your backend URL is different, replace it:**
```bash
curl -X POST "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://YOUR_ACTUAL_BACKEND_URL/api/telegram/webhook"}'
```

### Step 4: Verify Webhook is Set

```bash
curl "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/getWebhookInfo"
```

Expected response:
```json
{
  "ok": true,
  "result": {
    "url": "https://zion-website-yy1v.onrender.com/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

### Step 5: Test the Bot

1. Open Telegram
2. Search for `@Yenege_bot`
3. Send `/version` - Should show bot information
4. Send `/start` - Should show welcome message
5. If you're admin, try `/stats` - Should show website statistics

## 🎯 Quick Commands Reference

### User Commands
- `/start` - Start the bot
- `/help` - Show help
- `/events` - View upcoming events
- `/verify [tx_ref]` - Verify a ticket
- `/subscribe` - Subscribe to notifications
- `/unsubscribe` - Unsubscribe

### Admin Commands (Requires Admin Access)
- `/stats` - Website statistics
- `/activity [limit]` - Recent ticket sales
- `/broadcast [message]` - Broadcast to subscribers
- `/admin_help` - Admin commands help

### Group Admin Commands (In Groups)
- `/ban` - Ban a user (reply to message)
- `/kick` - Kick a user (reply to message)
- `/mute [hours]` - Mute a user (reply to message)
- `/unmute` - Unmute a user (reply to message)
- `/del` - Delete a message (reply to message)
- `/pin` - Pin a message (reply to message)
- `/unpin` - Unpin message
- `/groupinfo` - Group information
- `/rules` - Show group rules

## 🔐 Using Admin API Endpoints

All admin endpoints require the `TELEGRAM_ADMIN_API_TOKEN`:

### Broadcast Message
```bash
curl -X POST "https://zion-website-yy1v.onrender.com/api/telegram/broadcast" \
  -H "Authorization: Bearer 2d26b8e7c3a0a11a05c1287975c4934628ccaf83482cc741b0c862e6abb7466a" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello subscribers! 🎉"}'
```

### Send Message to Specific Chat
```bash
curl -X POST "https://zion-website-yy1v.onrender.com/api/telegram/send-message" \
  -H "Authorization: Bearer 2d26b8e7c3a0a11a05c1287975c4934628ccaf83482cc741b0c862e6abb7466a" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "123456789",
    "text": "Hello!",
    "parse_mode": "HTML"
  }'
```

### Set Webhook (via API)
```bash
curl -X POST "https://zion-website-yy1v.onrender.com/api/telegram/set-webhook" \
  -H "Authorization: Bearer 2d26b8e7c3a0a11a05c1287975c4934628ccaf83482cc741b0c862e6abb7466a" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://zion-website-yy1v.onrender.com/api/telegram/webhook"}'
```

## ✅ Checklist

Before deploying:

- [ ] Added `TELEGRAM_BOT_TOKEN` to `server/.env`
- [ ] Added `TELEGRAM_ADMIN_API_TOKEN` to `server/.env`
- [ ] Got your Telegram User ID from @userinfobot
- [ ] Added `TELEGRAM_ADMIN_USER_IDS` to `server/.env`
- [ ] Verified backend URL is correct
- [ ] Created database tables (telegram_subscriptions, telegram_admin_users)
- [ ] Ready to deploy!

After deploying:

- [ ] Set webhook URL
- [ ] Verified webhook is set correctly
- [ ] Tested `/version` command
- [ ] Tested `/start` command
- [ ] Tested admin commands (if admin)
- [ ] Added bot to Telegram group (if needed)
- [ ] Made bot admin in group (if needed)
- [ ] Tested group admin commands

## 🚀 You're Ready!

Once you:
1. Add your Telegram User ID to `TELEGRAM_ADMIN_USER_IDS`
2. Deploy the updated code to your backend
3. Set the webhook

Your bot will be fully functional! 🎉

