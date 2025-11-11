# How to Ban a User - Step by Step

## 🚫 How the Ban Process Works

### What the User Does (That Gets Them Banned):
Users don't automatically get banned. **Only group administrators can ban users** using the bot.

### How an Admin Bans a User:

1. **Find the user's message** in the group
2. **Reply to that message** (tap and hold on the message, then tap "Reply")
3. **Type `/ban`** in the reply
4. **Send the message**

The bot will:
- ✅ Ban the user from the group
- ✅ Send a confirmation message

### Example:

```
User sends: "Spam message here"
Admin replies: /ban
Bot responds: "🚫 User Spammer has been banned."
```

## 📋 Complete Ban Process

### Step 1: User sends a message
```
User: "Some inappropriate message"
```

### Step 2: Admin replies to the message
```
Admin: [Reply to user's message]
Admin types: /ban
```

### Step 3: Bot bans the user
```
Bot: "🚫 User [Name] has been banned."
```

## ⚠️ Requirements

- ✅ You must be a **group administrator**
- ✅ Bot must be an **admin in the group**
- ✅ Bot needs **ban users** permission
- ✅ You must **reply to the user's message** (can't just type `/ban` alone)

## 🔧 Other Moderation Commands

### Unban a User:
1. Reply to any message from that user
2. Type `/unban`
3. Send

### Kick a User (temporary removal):
1. Reply to user's message
2. Type `/kick`
3. Send

### Mute a User:
1. Reply to user's message
2. Type `/mute` (default: 24 hours)
3. Or type `/mute 48` (for 48 hours)
4. Send

### Unmute a User:
1. Reply to user's message
2. Type `/unmute`
3. Send

## ❌ What Happens When a User is Banned

- User is **permanently removed** from the group
- User **cannot rejoin** the group
- User **cannot see** group messages
- User **cannot send** messages to the group

## ✅ What Happens When a User is Unbanned

- User can **rejoin** the group
- User can **see** group messages again
- User can **send** messages again

## 📝 Notes

- Bans are **permanent** by default
- Only **group administrators** can use these commands
- You **must reply** to a message to ban/kick/mute that user
- The bot needs **admin permissions** in the group

