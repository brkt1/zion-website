# Quick Setup: Telegram Event Announcements

## ✅ What's Done

- ✅ Bot automatically posts new events to Telegram groups
- ✅ Shows countdown timer (days, hours, minutes)
- ✅ Includes event image, details, and links
- ✅ Works automatically when you create events

## 🚀 Setup Steps

### Step 1: Add Bot to Your Telegram Group

1. Open your Telegram group
2. Click group name → "Add Members"
3. Search: `@Yenege_bot`
4. Add the bot
5. Make bot admin (recommended)

### Step 2: Get Group Chat ID

**Easy Method:**
1. Add `@userinfobot` to your group
2. It will show the chat ID (negative number like `-123456789`)

**Or use this:**
```bash
curl "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/getUpdates"
# Look for "chat": {"id": -123456789}
```

### Step 3: Add Environment Variables

**In Render (Backend):**
```
TELEGRAM_EVENT_GROUPS=-123456789
```

**For multiple groups (comma-separated):**
```
TELEGRAM_EVENT_GROUPS=-123456789,-987654321
```

**In Frontend (Netlify/Vercel):**
```
REACT_APP_TELEGRAM_ADMIN_API_TOKEN=2d26b8e7c3a0a11a05c1287975c4934628ccaf83482cc741b0c862e6abb7466a
REACT_APP_API_URL=https://zion-website-yy1v.onrender.com/api
```

### Step 4: Test It!

1. Create a new event in admin panel
2. Check your Telegram group
3. You should see the announcement with countdown! 🎉

## 📋 What the Announcement Shows

- 🎉 Event title
- ⏳ Countdown timer (e.g., "5 days, 3 hours remaining")
- 📅 Date and time
- 📍 Location
- 💰 Price
- 🏷️ Category
- 📝 Description (first 200 chars)
- 🔗 Link to event page
- 💬 Link to event Telegram group (if set)

## 🔧 Troubleshooting

**Bot not posting?**
- Check bot is in group
- Verify group chat ID is correct (negative number)
- Check `TELEGRAM_EVENT_GROUPS` is set
- Check Render logs for errors

**Countdown not showing?**
- Ensure event has valid date
- Time format: "6:00 PM" or "18:00"

**Image not showing?**
- Image URL must be publicly accessible
- Check image URL is valid

## 📝 Example Announcement

```
🎉 NEW EVENT ANNOUNCEMENT!

🎊 Friday Game Night

⏳ 5 days, 3 hours remaining

📅 Date: Friday, December 25, 2024
⏰ Time: 6:00 PM
📍 Location: Addis Ababa
💰 Price: 500 ETB
🏷️ Category: game

📝 Join us for an evening of board games...

🔗 View Details & Book Now
💬 Join Event Group

Use /event_abc123 for quick details
```

## ✅ That's It!

Once configured, every new event you create will automatically be posted to your Telegram groups with a countdown timer!

