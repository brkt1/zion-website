# Complete Environment Variables Guide

## ✅ Values We Have (Fill These In)

### Telegram Bot (Already Have)
```bash
TELEGRAM_BOT_TOKEN=8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI
TELEGRAM_ADMIN_API_TOKEN=2d26b8e7c3a0a11a05c1287975c4934628ccaf83482cc741b0c862e6abb7466a
TELEGRAM_ADMIN_USER_IDS=YOUR_USER_ID_HERE  # Get from @userinfobot
```

### Backend URL (From Your Code)
```bash
# Your backend is likely:
# https://zion-website-yy1v.onrender.com
# (Verify this in Render dashboard)
```

## 📝 What You Need to Fill In

### 1. Supabase Credentials (REQUIRED for database features)

**Get from:** https://supabase.com/dashboard → Your Project → Settings → API

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Why needed:**
- Events, tickets, subscriptions storage
- Admin statistics
- User management

**Without it:**
- Bot will still work for basic commands
- Group admin features will work
- Database-dependent features won't work (events, tickets, stats)

### 2. Telegram User ID

**Get from:**
1. Open Telegram
2. Search `@userinfobot`
3. Click "Start"
4. Copy the "Id" number

```bash
TELEGRAM_ADMIN_USER_IDS=123456789
```

### 3. Other Variables (If You Have Them)

```bash
# Payment (Chapa)
CHAPA_SECRET_KEY=CHASECK-xxxxx

# Push Notifications
VAPID_PUBLIC_KEY=xxxxx
VAPID_PRIVATE_KEY=xxxxx
VAPID_SUBJECT=mailto:admin@yenege.com

# WhatsApp (Optional)
WHATSAPP_ACCESS_TOKEN=xxxxx
WHATSAPP_PHONE_NUMBER_ID=xxxxx
```

## 🚀 Quick Setup for Render

### Step 1: Add to Render Environment

Go to: https://dashboard.render.com → Your Service → Environment

**Add these 3 (minimum for bot to work):**
```
TELEGRAM_BOT_TOKEN = 8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI
TELEGRAM_ADMIN_API_TOKEN = 2d26b8e7c3a0a11a05c1287975c4934628ccaf83482cc741b0c862e6abb7466a
TELEGRAM_ADMIN_USER_IDS = YOUR_USER_ID_HERE
```

**Add these if you have them (for full functionality):**
```
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CHAPA_SECRET_KEY = CHASECK-xxxxx
```

### Step 2: Deploy

Render will automatically restart after adding variables.

### Step 3: Set Webhook

```bash
curl -X POST "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://zion-website-yy1v.onrender.com/api/telegram/webhook"}'
```

## ✅ Minimum Required for Bot to Work

**Without Supabase:**
- ✅ Basic bot commands (`/start`, `/help`, `/version`)
- ✅ Group admin commands (ban, mute, etc.)
- ❌ Events, tickets, stats (need Supabase)

**With Supabase:**
- ✅ All features work

## 📋 Complete Checklist

- [ ] `TELEGRAM_BOT_TOKEN` - ✅ Have it
- [ ] `TELEGRAM_ADMIN_API_TOKEN` - ✅ Have it
- [ ] `TELEGRAM_ADMIN_USER_IDS` - ⚠️ Need to get from @userinfobot
- [ ] `SUPABASE_URL` - ⚠️ Need from Supabase dashboard
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - ⚠️ Need from Supabase dashboard
- [ ] `CHAPA_SECRET_KEY` - ⚠️ Need if using payments
- [ ] Backend URL - ✅ Likely `https://zion-website-yy1v.onrender.com`

## 🎯 Next Steps

1. **Get your Telegram User ID** from @userinfobot
2. **Get Supabase credentials** (if you want database features)
3. **Add all to Render Environment** variables
4. **Deploy code**
5. **Set webhook**
6. **Test bot**

The server will now start even without Supabase! ✅

