# How to Get Your Telegram User ID and Webhook URL

## Getting Your Telegram User ID

### Method 1: Using @userinfobot (Easiest)

1. Open Telegram
2. Search for `@userinfobot` or go to: https://t.me/userinfobot
3. Click "Start" or send `/start`
4. The bot will reply with your user information
5. Look for **"Id"** - that's your Telegram User ID (it's a number like `123456789`)

**Example response:**
```
Id: 123456789
First name: Your Name
Username: @yourusername
```

### Method 2: Using @getidsbot

1. Open Telegram
2. Search for `@getidsbot` or go to: https://t.me/getidsbot
3. Click "Start"
4. It will show your user ID

### Method 3: From Bot Logs (If Bot is Running)

1. Send any message to your bot (e.g., `/start`)
2. Check your server logs
3. Look for: `🔍 Processing command: "/start" from user 123456789`
4. The number after "user" is your Telegram User ID

## Getting Your Webhook URL

Your webhook URL is your backend server URL + `/api/telegram/webhook`

### Format:
```
https://YOUR_BACKEND_URL/api/telegram/webhook
```

### Examples:

**If your backend is on Render:**
```
https://your-app-name.onrender.com/api/telegram/webhook
```

**If your backend is on Railway:**
```
https://your-app-name.railway.app/api/telegram/webhook
```

**If your backend is on Heroku:**
```
https://your-app-name.herokuapp.com/api/telegram/webhook
```

**If your backend is on Vercel:**
```
https://your-app-name.vercel.app/api/telegram/webhook
```

**If you're using a custom domain:**
```
https://api.yourdomain.com/api/telegram/webhook
```

### How to Find Your Backend URL:

1. **Check your hosting platform:**
   - Render: Go to your service dashboard → Settings → URL
   - Railway: Go to your project → Settings → Domains
   - Heroku: Go to your app → Settings → Domains
   - Vercel: Go to your project → Settings → Domains

2. **Check your environment variables:**
   - Look for `FRONTEND_URL` or `BACKEND_URL` in your `.env` file
   - Your backend URL might be similar

3. **Test if your backend is accessible:**
   ```bash
   curl https://YOUR_BACKEND_URL/api/health
   ```
   If it returns `{"status":"ok"}`, that's your backend URL!

## Setting Up Your Environment Variables

Once you have both, add them to `server/.env`:

```bash
# Your Telegram User ID (from @userinfobot)
TELEGRAM_ADMIN_USER_IDS=123456789

# If you have multiple admins, separate with commas:
# TELEGRAM_ADMIN_USER_IDS=123456789,987654321,555666777

# Your webhook URL (your backend URL + /api/telegram/webhook)
# Example: https://your-backend.onrender.com/api/telegram/webhook
# (You don't need to set this in .env - it's set via API)
```

## Setting the Webhook

After you have your backend URL, set the webhook:

### Option 1: Using API Endpoint (Recommended)

```bash
curl -X POST "https://YOUR_BACKEND_URL/api/telegram/set-webhook" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://YOUR_BACKEND_URL/api/telegram/webhook"}'
```

### Option 2: Using Telegram Bot API Directly

```bash
curl -X POST "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://YOUR_BACKEND_URL/api/telegram/webhook"}'
```

### Option 3: Using Browser

Visit this URL (replace `YOUR_BACKEND_URL`):
```
https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/setWebhook?url=https://YOUR_BACKEND_URL/api/telegram/webhook
```

## Verify Webhook is Set

Check if webhook is configured:

```bash
curl "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/getWebhookInfo"
```

You should see:
```json
{
  "ok": true,
  "result": {
    "url": "https://YOUR_BACKEND_URL/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

## Quick Setup Checklist

- [ ] Get your Telegram User ID from @userinfobot
- [ ] Find your backend URL (from hosting platform)
- [ ] Add `TELEGRAM_ADMIN_USER_IDS` to `server/.env`
- [ ] Set webhook using one of the methods above
- [ ] Verify webhook is set correctly
- [ ] Test bot with `/version` command

## Troubleshooting

### Can't find backend URL?
- Check your hosting platform dashboard
- Look for "URL", "Domain", or "Endpoint" in settings
- Test with: `curl https://YOUR_BACKEND_URL/api/health`

### Webhook not working?
- Make sure your backend URL uses HTTPS (required by Telegram)
- Make sure your server is running
- Check server logs for errors
- Verify webhook URL is correct

### User ID not working?
- Make sure you copied the full number (no spaces)
- Try sending `/start` to your bot and check server logs
- Verify the ID is in `TELEGRAM_ADMIN_USER_IDS` in `.env`
- Restart your server after updating `.env`

