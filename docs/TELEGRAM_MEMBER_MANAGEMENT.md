# Telegram Bot - Member Management Guide

## ✅ New Features Added

The bot now supports adding members to groups and managing group invitations!

## 📋 Available Commands

### Add Single User
**Command:** `/add_user <user_id>`

Adds a single user to the current group by their Telegram user ID.

**Usage:**
```
/add_user 123456789
```

**Requirements:**
- Must be used in a group
- User must be a group administrator
- Bot must have "Add Users" permission

**Example:**
```
/add_user 5764065336
```

### Add Multiple Users
**Command:** `/add_users <user_id1> <user_id2> ...`

Adds multiple users to the current group at once.

**Usage:**
```
/add_users 123456789 987654321 555555555
```

**Requirements:**
- Must be used in a group
- User must be a group administrator
- Bot must have "Add Users" permission
- Rate limited: 1 second delay between each add

**Example:**
```
/add_users 5764065336 123456789 987654321
```

### Export Invite Link
**Command:** `/export_invite` or `/invite_link`

Exports the group's invite link that can be shared to add members.

**Usage:**
```
/export_invite
```

**Requirements:**
- Must be used in a group
- User must be a group administrator
- Bot must have admin rights

**Example Response:**
```
🔗 Group Invite Link

https://t.me/joinchat/ABC123xyz

Share this link to invite members to the group.
```

### Copy Members (Info)
**Command:** `/copy_members <source_group_id> <target_group_id>`

⚠️ **Note:** Telegram Bot API doesn't allow getting a full list of group members directly. This command provides information and alternative methods.

**Usage:**
```
/copy_members -1001234567890 -1009876543210
```

**Requirements:**
- Bot administrator only (not just group admin)
- Bot must be admin in both source and target groups

**Alternative Methods:**
1. Use `/export_invite` in source group and share the link
2. Use `/add_users` with specific user IDs

## 🔍 How to Get User IDs

### Method 1: Using @userinfobot
1. Forward a message from the user to @userinfobot
2. The bot will reply with the user's ID
3. Use that ID with `/add_user` or `/add_users`

### Method 2: Using Your Own User ID
Your user ID is already configured in `TELEGRAM_ADMIN_USER_IDS`:
- Your ID: `5764065336`

### Method 3: From Group Members
1. Reply to a user's message in a group
2. Use `/groupinfo` to see group information
3. Note: User IDs are not directly visible, but you can use the forward method

## 📝 Important Notes

### Limitations

1. **Cannot Access Contacts Directly**
   - Telegram Bot API doesn't allow bots to access user contacts
   - You must provide user IDs manually

2. **Cannot Get Full Member List**
   - Telegram Bot API doesn't provide a way to get all members of a group
   - Use invite links or add users individually by ID

3. **Rate Limits**
   - Telegram limits how many users can be added per day
   - The bot includes a 1-second delay between adds to respect rate limits

4. **Privacy Settings**
   - Users with privacy restrictions cannot be added automatically
   - They must join via invite link or accept an invitation

### Best Practices

1. **Use Invite Links for Many Users**
   - Export an invite link with `/export_invite`
   - Share the link with users you want to add
   - This is faster and respects user privacy

2. **Add Users in Batches**
   - Use `/add_users` for small batches (5-10 users at a time)
   - Wait a few minutes between batches to avoid rate limits

3. **Get Permission First**
   - Always get user consent before adding them to groups
   - Respect privacy settings

## 🛠️ Setup Requirements

### Bot Permissions

The bot needs the following permissions in groups:
- ✅ **Add Users** - Required for `/add_user` and `/add_users`
- ✅ **Administrator** - Required for `/export_invite`

### How to Grant Permissions

1. Go to your Telegram group
2. Open group settings
3. Go to "Administrators"
4. Find your bot (@Yenege_bot)
5. Enable "Add Users" permission
6. Save changes

## 🎯 Use Cases

### Use Case 1: Add Your Contacts
Since bots can't access contacts directly:
1. Get user IDs from your contacts (use @userinfobot)
2. Create a list of user IDs
3. Use `/add_users` with the list

### Use Case 2: Copy Members from Another Group
1. Export invite link from source group: `/export_invite`
2. Share the link with members you want to add
3. Or, manually add specific users with `/add_users`

### Use Case 3: Bulk Add Known Users
1. Prepare a list of user IDs
2. Use `/add_users` with up to 10-20 IDs at a time
3. Wait a few minutes between batches

## ⚠️ Error Messages

### "Bot needs admin rights with 'Add Users' permission"
- **Solution:** Grant the bot admin rights with "Add Users" permission in group settings

### "User has privacy settings that prevent adding them"
- **Solution:** User must join via invite link or accept invitation manually

### "User is already a member of this group"
- **Solution:** User is already in the group, no action needed

### "Failed to add user"
- **Solution:** Check if user ID is correct, bot has permissions, and rate limits haven't been exceeded

## 📊 Example Workflow

### Adding Multiple Contacts to a Group

1. **Get User IDs:**
   ```
   Contact 1: Forward message to @userinfobot → Get ID: 123456789
   Contact 2: Forward message to @userinfobot → Get ID: 987654321
   Contact 3: Forward message to @userinfobot → Get ID: 555555555
   ```

2. **Add to Group:**
   ```
   /add_users 123456789 987654321 555555555
   ```

3. **Check Results:**
   ```
   📊 Add Users Result

   ✅ Success: 2
   ❌ Failed: 1

   Errors:
   User 555555555: USER_PRIVACY_RESTRICTED
   ```

4. **For Privacy-Restricted Users:**
   ```
   /export_invite
   ```
   Share the invite link with the user directly.

## 🎉 That's It!

You now have full control over adding members to your Telegram groups!

