# Telegram Event Announcements Setup

## Overview

The bot can automatically post new events to Telegram groups with countdown timers when events are created on the website.

## Features

- ✅ Automatic event announcements when events are created
- ✅ Countdown timer showing time until event
- ✅ Event image included (if available)
- ✅ Links to event details and booking
- ✅ Support for multiple Telegram groups

## Setup

### Step 1: Add Bot to Telegram Group

1. Open your Telegram group
2. Click on group name → "Add Members"
3. Search for your bot: `@Yenege_bot`
4. Add the bot to the group
5. Make the bot an admin (optional but recommended for better functionality)

### Step 2: Get Group Chat ID

**Method 1: Using @userinfobot**
1. Add `@userinfobot` to your group
2. It will show the group chat ID (starts with `-` for groups)

**Method 2: Using Bot API**
```bash
# Get updates from your bot
curl "https://api.telegram.org/bot8586299633:AAHWeNqVixuiu2HmWQEJXKglupCThwa45ZI/getUpdates"

# Look for "chat": {"id": -123456789, "type": "group"}
# The negative number is your group chat ID
```

**Method 3: Using @RawDataBot**
1. Add `@RawDataBot` to your group
2. It will show the chat ID in the message

### Step 3: Configure Environment Variable

Add to Render environment variables:

```
TELEGRAM_EVENT_GROUPS=-123456789,-987654321
```

**Note:** 
- Use comma-separated values for multiple groups
- Group chat IDs are negative numbers (start with `-`)
- Private chat IDs are positive numbers

### Step 4: Verify Setup

1. Create a test event on your website
2. Check the Telegram group - you should see the announcement
3. Check Render logs for any errors

## How It Works

1. **Event Created**: When you create a new event in the admin panel
2. **Automatic Announcement**: The system automatically calls the Telegram API
3. **Group Posting**: Bot posts to all configured Telegram groups
4. **Countdown Display**: Shows countdown timer until event date/time

## Announcement Format

The announcement includes:
- 🎉 Event title
- ⏳ Countdown timer (days, hours, minutes)
- 📅 Date and time
- 📍 Location
- 💰 Price
- 🏷️ Category
- 📝 Description (first 200 characters)
- 🔗 Link to event details
- 💬 Link to event Telegram group (if configured)

## Manual Announcement

You can also manually announce an event using the API:

```bash
curl -X POST "https://zion-website-yy1v.onrender.com/api/telegram/announce-event" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event": {
      "id": "event-id-here",
      "title": "Event Title",
      "date": "2024-12-25",
      "time": "6:00 PM",
      "location": "Addis Ababa",
      "category": "game",
      "image": "https://example.com/image.jpg",
      "description": "Event description",
      "price": "500",
      "currency": "ETB",
      "telegram_link": "https://t.me/eventgroup"
    }
  }'
```

## Troubleshooting

### Bot Not Posting

1. **Check Bot is in Group**
   - Verify bot is added to the group
   - Bot must be a member (admin recommended)

2. **Check Group Chat ID**
   - Ensure chat ID is correct (negative number for groups)
   - Check environment variable is set correctly

3. **Check Bot Permissions**
   - Bot needs permission to send messages
   - If group has restrictions, make bot admin

4. **Check Logs**
   - Check Render logs for error messages
   - Look for "Failed to send to group" errors

### Countdown Not Showing

- Ensure event has a valid date
- Time format should be like "6:00 PM" or "18:00"
- Check event date is in the future

### Image Not Showing

- Ensure event image URL is accessible
- Image must be publicly accessible (not behind authentication)
- Supported formats: JPG, PNG, GIF

## Example Announcement

```
🎉 NEW EVENT ANNOUNCEMENT!

🎊 Friday Game Night

⏳ 5 days, 3 hours remaining

📅 Date: Friday, December 25, 2024
⏰ Time: 6:00 PM
📍 Location: Addis Ababa
💰 Price: 500 ETB
🏷️ Category: game

📝 Join us for an evening of board games, trivia, and fun!...

🔗 View Details & Book Now
💬 Join Event Group

Use /event_abc123 for quick details
```

## Security

- ✅ Requires admin authentication token
- ✅ Validates event data before posting
- ✅ Handles errors gracefully
- ✅ Doesn't expose sensitive information

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TELEGRAM_EVENT_GROUPS` | Comma-separated group chat IDs | `-123456789,-987654321` |
| `TELEGRAM_ADMIN_API_TOKEN` | Admin API token for authentication | `your-token-here` |
| `FRONTEND_URL` | Website URL for event links | `https://www.yenege.com` |

## Notes

- Announcements are sent automatically when events are created
- Multiple groups are supported (comma-separated)
- Countdown updates in real-time when users view the message
- Event images are included if available
- Links to event details and Telegram groups are included

