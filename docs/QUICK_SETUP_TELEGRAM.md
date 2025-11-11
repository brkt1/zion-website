# Quick Telegram Bot Setup

## Step 1: Add to server/.env

Open `server/.env` (create it if it doesn't exist) and add:

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI

# Admin API Token (for protecting admin endpoints)
TELEGRAM_ADMIN_API_TOKEN=2d26b8e7c3a0a11a05c1287975c4934628ccaf83482cc741b0c862e6abb7466a

# Your Telegram User ID (get from @userinfobot)
# TELEGRAM_ADMIN_USER_IDS=YOUR_USER_ID_HERE
```

## Step 2: Get Your Telegram User ID

1. Open Telegram
2. Search for `@userinfobot`
3. Click "Start"
4. Copy the "Id" number
5. Add it to `TELEGRAM_ADMIN_USER_IDS` in `server/.env`:
   ```bash
   TELEGRAM_ADMIN_USER_IDS=123456789
   ```

## Step 3: Find Your Backend URL

Your backend URL is likely: `https://zion-website-yy1v.onrender.com`

Test it:
```bash
curl https://zion-website-yy1v.onrender.com/api/health
```

If it works, that's your backend URL!

## Step 4: Set Webhook

```bash
curl -X POST "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://zion-website-yy1v.onrender.com/api/telegram/webhook"}'
```

Replace `zion-website-yy1v.onrender.com` with your actual backend URL if different.

## Step 5: Verify

1. Check webhook:
   ```bash
   curl "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/getWebhookInfo"
   ```

2. Test bot:
   - Send `/version` to `@Yenege_bot` in Telegram
   - Should see bot information

## Done! ✅

Your bot is now configured and secure!

