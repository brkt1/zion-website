# Deploying Telegram Bot to Render

Since you're using Render (based on your `render.yaml`), here's the exact steps:

## Step 1: Update Environment Variables on Render

1. **Go to Render Dashboard:**
   - Visit: https://dashboard.render.com
   - Click on your backend service (likely named `yenege-backend`)

2. **Go to Environment Tab:**
   - Click on **Environment** in the left sidebar
   - You'll see your existing environment variables

3. **Add Telegram Variables:**
   Click **Add Environment Variable** for each:

   **Variable 1:**
   - Key: `TELEGRAM_BOT_TOKEN`
   - Value: `8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI`
   - Click **Save Changes**

   **Variable 2:**
   - Key: `TELEGRAM_ADMIN_API_TOKEN`
   - Value: `2d26b8e7c3a0a11a05c1287975c4934628ccaf83482cc741b0c862e6abb7466a`
   - Click **Save Changes`

   **Variable 3:**
   - Key: `TELEGRAM_ADMIN_USER_IDS`
   - Value: `YOUR_USER_ID_HERE` (get from @userinfobot on Telegram)
   - Click **Save Changes**

4. **Render will automatically restart** your service after each variable is added

## Step 2: Deploy Updated Code

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Add Telegram bot with admin features"
   git push origin main
   ```

2. **Render will automatically deploy** (if connected to your git repo)
   - Go to **Events** tab to watch deployment progress
   - Wait for deployment to complete (usually 2-5 minutes)

3. **Check deployment logs:**
   - Go to **Logs** tab
   - Look for: `Telegram Bot: ✅ Configured`
   - Make sure there are no errors

## Step 3: Set the Webhook (Run This Once)

**After deployment is complete**, run this command in your terminal:

```bash
curl -X POST "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://zion-website-yy1v.onrender.com/api/telegram/webhook"}'
```

**Note:** Replace `zion-website-yy1v.onrender.com` with your actual Render service URL if different.

### Find Your Render Service URL:

1. Go to Render Dashboard
2. Click on your backend service
3. Look at the top - you'll see the URL (e.g., `https://yenege-backend-xxxx.onrender.com`)
4. Use that URL in the webhook command

### Verify Webhook is Set:

```bash
curl "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/getWebhookInfo"
```

Should show your webhook URL.

## Step 4: Test the Bot

1. Open Telegram
2. Search for `@Yenege_bot`
3. Send `/version` - Should show version 2.0.0 ✅

## Quick Checklist

- [ ] Added `TELEGRAM_BOT_TOKEN` to Render Environment
- [ ] Added `TELEGRAM_ADMIN_API_TOKEN` to Render Environment
- [ ] Got Telegram User ID from @userinfobot
- [ ] Added `TELEGRAM_ADMIN_USER_IDS` to Render Environment
- [ ] Pushed code to git
- [ ] Deployment completed successfully
- [ ] Ran webhook setup command
- [ ] Verified webhook is set
- [ ] Tested bot with `/version` command

## Important Notes

1. **Environment variables on Render** are separate from your local `.env` file
2. **You must add them in Render Dashboard** - they won't be in your code
3. **Render restarts automatically** when you add environment variables
4. **Webhook command** only needs to be run once (or if you change backend URL)
5. **Get your User ID** from @userinfobot before adding `TELEGRAM_ADMIN_USER_IDS`

## Troubleshooting

### Bot Not Responding?

1. Check Render logs for errors
2. Verify all 3 environment variables are set in Render
3. Make sure webhook is set (run getWebhookInfo command)
4. Check that your Render service is running (green status)

### Webhook Command Fails?

- Make sure your Render service is deployed and running
- Test: `curl https://YOUR_RENDER_URL.onrender.com/api/health`
- Make sure URL uses HTTPS

### Environment Variables Not Working?

- Make sure you added them in **Render Dashboard**, not just locally
- Check variable names are exactly correct (case-sensitive)
- Restart service manually if needed (Render → Manual Deploy → Clear build cache & deploy)

