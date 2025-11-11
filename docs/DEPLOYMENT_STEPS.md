# Telegram Bot Deployment Steps

## Overview

You need to:
1. Update server `.env` file (on your hosting platform)
2. Deploy the updated code
3. Set the webhook (run the command)

## Step 1: Update Server Environment Variables

The `.env` file on your **server/hosting platform** needs to be updated, not just locally.

### If Using Render:

1. Go to https://dashboard.render.com
2. Click on your backend service
3. Go to **Environment** tab
4. Click **Add Environment Variable** for each:
   - `TELEGRAM_BOT_TOKEN` = `8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI`
   - `TELEGRAM_ADMIN_API_TOKEN` = `2d26b8e7c3a0a11a05c1287975c4934628ccaf83482cc741b0c862e6abb7466a`
   - `TELEGRAM_ADMIN_USER_IDS` = `YOUR_USER_ID_HERE` (get from @userinfobot)
5. Click **Save Changes**
6. Render will automatically restart your service

### If Using Railway:

1. Go to https://railway.app
2. Click on your project → Your backend service
3. Go to **Variables** tab
4. Click **+ New Variable** for each:
   - `TELEGRAM_BOT_TOKEN` = `8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI`
   - `TELEGRAM_ADMIN_API_TOKEN` = `2d26b8e7c3a0a11a05c1287975c4934628ccaf83482cc741b0c862e6abb7466a`
   - `TELEGRAM_ADMIN_USER_IDS` = `YOUR_USER_ID_HERE`
5. Railway will automatically redeploy

### If Using Heroku:

```bash
heroku config:set TELEGRAM_BOT_TOKEN=8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI -a your-app-name
heroku config:set TELEGRAM_ADMIN_API_TOKEN=2d26b8e7c3a0a11a05c1287975c4934628ccaf83482cc741b0c862e6abb7466a -a your-app-name
heroku config:set TELEGRAM_ADMIN_USER_IDS=YOUR_USER_ID_HERE -a your-app-name
```

### If Using Vercel:

1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add each variable for **Production** environment
4. Redeploy

### If Using Other Platforms:

- Look for "Environment Variables", "Config Vars", or "Settings" in your hosting dashboard
- Add the three variables listed above
- Restart/redeploy your service

## Step 2: Deploy Updated Code

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Add Telegram bot with admin features and security fixes"
   git push
   ```

2. **Your hosting platform will automatically deploy** (if connected to git)
   - Or manually trigger deployment from dashboard

3. **Wait for deployment to complete**
   - Check deployment logs
   - Look for: `Telegram Bot: ✅ Configured`

## Step 3: Set the Webhook (Run This Command)

**After your server is deployed and running**, run this command:

```bash
curl -X POST "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://zion-website-yy1v.onrender.com/api/telegram/webhook"}'
```

**Important:** 
- Replace `zion-website-yy1v.onrender.com` with your actual backend URL if different
- This command tells Telegram where to send bot updates
- You only need to run this **once** (or if you change your backend URL)

### Verify Webhook is Set:

```bash
curl "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/getWebhookInfo"
```

Should return:
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

## Step 4: Test the Bot

1. Open Telegram
2. Search for `@Yenege_bot`
3. Send `/version` - Should show version 2.0.0
4. Send `/start` - Should show welcome message

## Quick Summary

1. ✅ **Update server .env** (on hosting platform dashboard)
2. ✅ **Deploy code** (push to git or trigger deployment)
3. ✅ **Set webhook** (run the curl command once)
4. ✅ **Test bot** (send `/version` in Telegram)

## Troubleshooting

### Webhook Command Fails?

- Make sure your backend is running and accessible
- Test: `curl https://YOUR_BACKEND_URL/api/health`
- Make sure URL uses HTTPS (required by Telegram)

### Bot Not Responding?

- Check server logs for errors
- Verify environment variables are set correctly
- Make sure webhook is set (check with getWebhookInfo)
- Restart your server after updating .env

### Environment Variables Not Working?

- Make sure you updated them on the **hosting platform**, not just locally
- Restart/redeploy your service after adding variables
- Check variable names are exactly correct (case-sensitive)

