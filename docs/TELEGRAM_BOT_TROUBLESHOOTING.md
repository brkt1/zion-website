# Telegram Bot Troubleshooting Guide

If your bot is not responding, follow these steps:

## Quick Diagnosis

### Step 1: Check if Server is Running

```bash
curl https://YOUR_BACKEND_URL/api/health
```

Should return: `{"status":"ok","message":"Yenege Backend API is running"}`

### Step 2: Check if Bot Token is Configured

**Check server logs on startup:**
Look for:
```
📋 Environment check:
  Telegram Bot: ✅ Configured
```

If you see `❌ Not configured`, the bot token is missing.

**Fix:**
1. Open `server/.env`
2. Add: `TELEGRAM_BOT_TOKEN=8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI`
3. Restart server

### Step 3: Check Webhook Status

```bash
curl "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/getWebhookInfo"
```

**What to look for:**
- `url`: Should be your backend URL (e.g., `https://your-backend.com/api/telegram/webhook`)
- `pending_update_count`: Should be 0 or low
- `last_error_date`: Should be null (if not, there's an error)

**If webhook is not set:**

```bash
# Replace YOUR_BACKEND_URL with your actual backend URL
curl -X POST "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://YOUR_BACKEND_URL/api/telegram/webhook"}'
```

### Step 4: Check Server Logs

**If running locally:**
```bash
cd server
npm run dev
```

Watch for:
- `📨 Telegram webhook received:` - Means webhook is working
- `💬 Processing command:` - Means command is being processed
- `❌ Error processing Telegram webhook:` - Means there's an error

**If running in production:**
Check your hosting platform logs (Railway, Render, etc.)

### Step 5: Test Webhook Manually

Send a test update to your webhook:

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

Check server logs to see if it's received.

## Common Issues

### Issue 1: Bot Says Nothing

**Possible causes:**
1. Server not running
2. Webhook not set
3. Bot token not configured
4. Server errors (check logs)

**Solution:**
1. Check server is running: `curl https://YOUR_BACKEND_URL/api/health`
2. Check webhook: `curl "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/getWebhookInfo"`
3. Check server logs for errors
4. Verify `TELEGRAM_BOT_TOKEN` in `server/.env`

### Issue 2: Webhook Not Receiving Updates

**Check:**
1. Is webhook URL correct?
2. Is your server accessible from internet? (localhost won't work)
3. Does your server have valid SSL certificate? (HTTPS required)

**Solution:**
1. Set webhook again (see Step 3 above)
2. Use ngrok for local testing: `ngrok http 5000`
3. Make sure webhook URL uses HTTPS

### Issue 3: Commands Not Working

**Check:**
1. Are you sending commands correctly? (e.g., `/version` not `version`)
2. Is the bot in the group? (for group commands)
3. Are you a group admin? (for admin commands)

**Solution:**
1. Try `/start` first - this should always work
2. Check server logs to see if command is received
3. For group commands, make sure bot is admin

### Issue 4: Server Errors

**Check server logs for:**
- `Error processing Telegram webhook:`
- `Error getting bot info:`
- `Error sending Telegram message:`

**Common errors:**
- `TELEGRAM_BOT_TOKEN not configured` → Add token to `.env`
- `Failed to parse response` → Check bot token is correct
- `401 Unauthorized` → Bot token is invalid

## Step-by-Step Fix

### If Bot Completely Not Responding:

1. **Verify server is running:**
   ```bash
   curl https://YOUR_BACKEND_URL/api/health
   ```

2. **Check bot token in `.env`:**
   ```bash
   # In server/.env
   TELEGRAM_BOT_TOKEN=8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI
   ```

3. **Restart server:**
   ```bash
   # If local
   cd server
   npm run dev
   
   # If production, restart via your hosting platform
   ```

4. **Set webhook:**
   ```bash
   curl -X POST "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://YOUR_BACKEND_URL/api/telegram/webhook"}'
   ```

5. **Test with `/start`:**
   - Send `/start` to bot in Telegram
   - Check server logs for `💬 Processing command: /start`
   - Bot should respond

6. **If still not working:**
   - Check server logs for errors
   - Verify webhook URL is accessible
   - Test webhook manually (see Step 5 above)

## Debug Mode

Enable debug logging by setting in `server/.env`:
```
NODE_ENV=development
```

This will show detailed logs of all webhook requests.

## Still Not Working?

1. **Check all these:**
   - ✅ Server is running
   - ✅ `TELEGRAM_BOT_TOKEN` is set in `server/.env`
   - ✅ Webhook is set correctly
   - ✅ Server logs show webhook being received
   - ✅ No errors in server logs

2. **Get help:**
   - Share server logs
   - Share webhook status output
   - Share error messages

## Quick Test Commands

Test these in order:

1. `/start` - Should always work
2. `/version` - Should show bot info
3. `/help` - Should show help
4. `/events` - Should show events (if any)

If `/start` doesn't work, the bot is not receiving updates at all.

