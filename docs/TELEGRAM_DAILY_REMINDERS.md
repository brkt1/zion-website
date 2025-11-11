# Daily Event Reminders - Setup Guide

## ✅ What's Implemented

The bot now automatically sends daily reminders for upcoming events:

- **3 days before**: "Just 3 days to go!" 📢
- **2 days before**: "Only 2 days remaining!" ⏰
- **1 day before**: "Tomorrow is the day!" 🔥
- **Event day**: "THE TIME HAS COME!" 🎉🎊🎉

## 🎨 Message Design

### 3 Days Before
```
📢 EVENT REMINDER 📢

━━━━━━━━━━━━━━━━━━━━

🎊 Event Title

⏳ Just 3 days to go!

━━━━━━━━━━━━━━━━━━━━

📅 Date: Friday, December 25, 2024
⏰ Time: 6:00 PM
📍 Location: Addis Ababa
💰 Price: 500 ETB
🏷️ Category: game

💡 Secure your spot before it's too late!

🔗 📱 View Details & Book Now
💬 Join Event Group

━━━━━━━━━━━━━━━━━━━━

Use /event_abc123 for quick details
```

### 1 Day Before
```
🔥 EVENT REMINDER 🔥

━━━━━━━━━━━━━━━━━━━━

🎊 Event Title

⏳ Tomorrow is the day!

━━━━━━━━━━━━━━━━━━━━

📅 Date: Friday, December 25, 2024
⏰ Time: 6:00 PM
📍 Location: Addis Ababa
💰 Price: 500 ETB

🔥 Don't miss out! Book your spot now!

🔗 📱 View Details & Book Now
💬 Join Event Group

━━━━━━━━━━━━━━━━━━━━

Use /event_abc123 for quick details
```

### Event Day
```
🎉🎊🎉 THE TIME HAS COME! 🎉🎊🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌟 Event Title 🌟

🎯 Today is the day!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Date: Friday, December 25, 2024
⏰ Time: 6:00 PM
📍 Location: Addis Ababa
💰 Price: 500 ETB

🎊 We can't wait to see you there!
✨ Get ready for an amazing experience!

🔗 📱 View Event Details
💬 Join Event Group

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use /event_abc123 for quick details

🎉 See you soon! 🎉
```

## ⚙️ How It Works

1. **Automatic Daily Check**: Runs every day at 9:00 AM
2. **Event Detection**: Finds events 3, 2, 1 days away, or today
3. **Smart Messaging**: Different messages for each day
4. **Group Posting**: Sends to all configured Telegram groups
5. **Image Support**: Includes event image if available

## 🔧 Configuration

### Already Configured ✅

- Daily reminder system is active
- Runs automatically at 9:00 AM
- Uses same groups as event announcements (`TELEGRAM_EVENT_GROUPS`)

### No Additional Setup Needed!

The reminders use the same configuration as event announcements:
- `TELEGRAM_EVENT_GROUPS` - Group chat IDs
- `TELEGRAM_BOT_TOKEN` - Bot token
- `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY` - Database access

## 🧪 Testing

### Manual Test

You can manually trigger reminders for testing:

```bash
curl -X POST "https://zion-website-yy1v.onrender.com/api/telegram/send-reminders" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### Expected Response

```json
{
  "success": true,
  "sent": 2,
  "failed": 0,
  "total": 2,
  "errors": []
}
```

## 📅 Reminder Schedule

| Days Before | Message | Emoji |
|------------|---------|-------|
| 3 days | "Just 3 days to go!" | 📢 |
| 2 days | "Only 2 days remaining!" | ⏰ |
| 1 day | "Tomorrow is the day!" | 🔥 |
| 0 days (today) | "THE TIME HAS COME!" | 🎉🎊🎉 |

## 🎯 Features

- ✅ **Professional Design**: Beautiful formatted messages with emojis
- ✅ **Visual Separators**: Clean lines for readability
- ✅ **Urgency Messages**: Different urgency levels for each day
- ✅ **Event Details**: Full event information included
- ✅ **Action Links**: Direct links to book and join groups
- ✅ **Image Support**: Event images included
- ✅ **Multiple Groups**: Sends to all configured groups

## 🔍 How Reminders Are Sent

1. **Daily Check**: Server checks every hour, runs at 9 AM
2. **Event Query**: Finds events in next 3 days
3. **Day Calculation**: Calculates days remaining for each event
4. **Message Formatting**: Formats appropriate message for each day
5. **Group Posting**: Sends to all configured Telegram groups
6. **Logging**: Logs success/failure for monitoring

## 📊 Monitoring

Check Render logs to see reminder activity:

```
⏰ Running daily event reminder check...
✅ Reminder sent for "Friday Game Night" (3 days) to group -123456789
✅ Reminder check complete: 2 sent, 0 failed
```

## ⚠️ Notes

- Reminders run at 9:00 AM server time (adjust in code if needed)
- Each reminder is sent once per day
- Events must have valid dates in the future
- Requires Supabase to be configured
- Requires Telegram groups to be configured

## 🎉 That's It!

The system is fully automated. Once configured, reminders will be sent daily without any manual intervention!

