# What Normal User vs Admin Sees

## When they send `/start`

### 👤 NORMAL USER SEES:

```
👋 Welcome to Yenege Events Bot!

I can help you with:
• 📅 View upcoming events
• 🎫 Verify your tickets
• 🔔 Get event notifications
• ℹ️ Get event information

Commands:
/events - View upcoming events
/verify [tx_ref] - Verify a ticket
/subscribe - Subscribe to event notifications
/unsubscribe - Unsubscribe from notifications
/help - Show this help message

Use /help for more information
```

### 🔐 ADMIN SEES (Bot Admin):

```
👋 Welcome to Yenege Events Bot!

I can help you with:
• 📅 View upcoming events
• 🎫 Verify your tickets
• 🔔 Get event notifications
• ℹ️ Get event information

Commands:
/events - View upcoming events
/verify [tx_ref] - Verify a ticket
/subscribe - Subscribe to event notifications
/unsubscribe - Unsubscribe from notifications
/help - Show this help message

🔐 Bot Admin: Use /admin_help to see bot admin commands
👥 Group Admin: Use /group_help to see group admin commands

Use /help for more information
```

---

## When they send `/help`

### 👤 NORMAL USER SEES:

```
📚 Yenege Events Bot - Help

Available Commands:

/start - Start the bot
/events - View upcoming events (limit: 5)
/event_[id] - Get details about a specific event
/verify [tx_ref] - Verify a ticket by transaction reference
/subscribe - Subscribe to event notifications
/unsubscribe - Unsubscribe from notifications
/help - Show this help message

Examples:
• /events - List upcoming events
• /verify YENEGE123456 - Verify ticket
• /event_abc123 - Get event details

Need help? Contact us at info@yenege.com
```

### 🔐 ADMIN SEES (Bot Admin):

```
📚 Yenege Events Bot - Help

Available Commands:

/start - Start the bot
/events - View upcoming events (limit: 5)
/event_[id] - Get details about a specific event
/verify [tx_ref] - Verify a ticket by transaction reference
/subscribe - Subscribe to event notifications
/unsubscribe - Unsubscribe from notifications
/help - Show this help message
/admin_help - Show bot admin commands (bot admin only)
/group_help - Show group admin commands (group admin only)

Examples:
• /events - List upcoming events
• /verify YENEGE123456 - Verify ticket
• /event_abc123 - Get event details

🔐 Bot Admin: Use /admin_help to see bot admin commands
👥 Group Admin: Use /group_help to see group admin commands

Need help? Contact us at info@yenege.com
```

---

## Key Differences

### Normal User:
- ❌ No admin hints
- ❌ No `/admin_help` command shown
- ❌ No `/group_help` command shown
- ✅ Only sees basic user commands

### Admin:
- ✅ Sees admin hints at bottom
- ✅ Sees `/admin_help` command in help
- ✅ Sees `/group_help` command (if group admin)
- ✅ Can access admin commands

---

## What Admins Can Access (Hidden from Normal Users)

### Bot Admin Commands (via `/admin_help`):
- `/stats` - Website statistics
- `/activity` - Recent ticket sales
- `/broadcast` - Broadcast to subscribers
- `/admin_help` - Show admin commands

### Group Admin Commands (via `/group_help`):
- `/add_user` - Add user to group
- `/add_users` - Add multiple users
- `/export_invite` - Get invite link
- `/ban` - Ban user
- `/unban` - Unban user
- `/kick` - Kick user
- `/mute` - Mute user
- `/unmute` - Unmute user
- `/del` - Delete message
- `/pin` - Pin message
- `/unpin` - Unpin message
- `/groupinfo` - Group information
- `/rules` - Show rules
- `/group_help` - Show group admin commands

---

## Summary

**Normal users** see a clean, simple interface with only basic commands.

**Admins** see the same interface PLUS hints about admin commands, but the actual admin commands are hidden until they use `/admin_help` or `/group_help`.

This keeps the interface clean for regular users while giving admins access to powerful features.

