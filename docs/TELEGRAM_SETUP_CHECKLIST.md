# Telegram Bot Setup Checklist

## ✅ Information We Have

- **Bot Token:** `8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI`
- **Admin API Token:** `2d26b8e7c3a0a11a05c1287975c4934628ccaf83482cc741b0c862e6abb7466a`
- **Backend URL:** `https://zion-website-yy1v.onrender.com` (verify this!)
- **Webhook URL:** `https://zion-website-yy1v.onrender.com/api/telegram/webhook`

## 📋 Setup Checklist

### Step 1: Database Setup
- [ ] Run `docs/scripts/create-telegram-subscriptions-table.sql` in Supabase
- [ ] Run `docs/scripts/create-telegram-admin-users-table.sql` in Supabase (optional)

### Step 2: Environment Variables
- [ ] Open `server/.env` file
- [ ] Add `TELEGRAM_BOT_TOKEN=8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI`
- [ ] Add `TELEGRAM_ADMIN_API_TOKEN=2d26b8e7c3a0a11a05c1287975c4934628ccaf83482cc741b0c862e6abb7466a`
- [ ] Get your Telegram User ID from @userinfobot
- [ ] Add `TELEGRAM_ADMIN_USER_IDS=YOUR_USER_ID_HERE`

### Step 3: Verify Backend URL
- [ ] Test: `curl https://zion-website-yy1v.onrender.com/api/health`
- [ ] If it works, that's your backend URL ✅
- [ ] If not, find your actual backend URL from hosting platform

### Step 4: Deploy Code
- [ ] Push code to repository
- [ ] Deploy to backend server
- [ ] Verify server starts without errors
- [ ] Check logs for: `Telegram Bot: ✅ Configured`

### Step 5: Set Webhook
- [ ] Run webhook setup command:
  ```bash
  curl -X POST "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/setWebhook" \
    -H "Content-Type: application/json" \
    -d '{"url": "https://zion-website-yy1v.onrender.com/api/telegram/webhook"}'
  ```
- [ ] Verify webhook is set:
  ```bash
  curl "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/getWebhookInfo"
  ```

### Step 6: Test Bot
- [ ] Send `/version` to @Yenege_bot - Should show version 2.0.0
- [ ] Send `/start` - Should show welcome message
- [ ] Send `/help` - Should show commands
- [ ] If admin, send `/stats` - Should show statistics

### Step 7: Test Group Features (Optional)
- [ ] Add bot to Telegram group
- [ ] Make bot administrator with permissions
- [ ] Test `/rules` command
- [ ] Test `/groupinfo` command

## 🎯 Quick Copy-Paste Commands

### Get Your User ID
1. Open Telegram → Search `@userinfobot` → Start → Copy "Id"

### Set Webhook
```bash
curl -X POST "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://zion-website-yy1v.onrender.com/api/telegram/webhook"}'
```

### Verify Webhook
```bash
curl "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/getWebhookInfo"
```

### Test Backend
```bash
curl https://zion-website-yy1v.onrender.com/api/health
```

## 📝 Complete .env Template

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI
TELEGRAM_ADMIN_API_TOKEN=2d26b8e7c3a0a11a05c1287975c4934628ccaf83482cc741b0c862e6abb7466a
TELEGRAM_ADMIN_USER_IDS=YOUR_USER_ID_HERE
```

## 🚀 You're Ready When:

- ✅ All environment variables are set
- ✅ Database tables are created
- ✅ Code is deployed
- ✅ Webhook is set
- ✅ Bot responds to `/version` command

See `TELEGRAM_COMPLETE_SETUP.md` for detailed instructions!

