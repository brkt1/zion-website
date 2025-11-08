# WhatsApp Business API (Meta) - Complete Setup Guide

This guide will walk you through setting up **free** WhatsApp messaging using Meta's WhatsApp Business API.

## Overview

✅ **Free** - No per-message costs  
✅ **Official** - Direct from Meta (Facebook)  
✅ **Production Ready** - Suitable for real business use  
⚠️ **Requires Approval** - Business verification needed

## Prerequisites

1. A Facebook Business Account
2. A Meta Business Account
3. A phone number (can be your existing number)
4. Business verification documents (varies by country)

## Step-by-Step Setup

### Step 1: Create Meta Business Account

1. Go to [Meta Business Suite](https://business.facebook.com/)
2. Click **"Create Account"** or sign in
3. Fill in your business information:
   - Business name
   - Your name
   - Business email
4. Verify your email address

### Step 2: Create a Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Select **"Business"** as the app type
4. Fill in:
   - **App Name**: e.g., "Yenege Events"
   - **App Contact Email**: Your business email
   - **Business Account**: Select your business account
5. Click **"Create App"**

### Step 3: Add WhatsApp Product

1. In your app dashboard, find **"Add Product"** or go to **"Products"** in the left menu
2. Find **"WhatsApp"** and click **"Set Up"**
3. You'll be taken to the WhatsApp setup flow

### Step 4: Get Your Phone Number ID

1. In the WhatsApp setup, you'll see **"Phone number ID"**
2. Copy this number (it looks like: `123456789012345`)
3. Save it - you'll need it for your `.env` file

### Step 5: Get Your Access Token

1. In the WhatsApp setup page, go to **"API Setup"** or **"Getting Started"**
2. Find **"Temporary access token"** (for testing)
3. Click **"Generate Token"** or copy the existing one
4. **Important**: This is a temporary token (expires in 24 hours)
5. For production, you'll need a **System User Token** (see Step 8)

### Step 6: Add a Phone Number

1. In WhatsApp setup, click **"Add phone number"** or **"Get started"**
2. Enter your phone number (the one you want to use for WhatsApp Business)
3. Choose verification method:
   - **SMS** (recommended)
   - **Voice call**
4. Enter the verification code you receive
5. Your number will be added to the system

### Step 7: Test Your Setup (Temporary Token)

1. Add these to your `server/.env` file:

```env
# WhatsApp Business API (Meta) - Temporary Token for Testing
WHATSAPP_ACCESS_TOKEN=your_temporary_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_API_VERSION=v18.0
```

2. **Remove or comment out** Twilio variables (if you have them):
```env
# TWILIO_API_KEY_SID=...
# TWILIO_API_KEY_SECRET=...
# TWILIO_ACCOUNT_SID=...
# TWILIO_MESSAGING_SERVICE_SID=...
```

3. Restart your server:
```bash
cd server
npm run dev
```

4. Test by making a payment - the WhatsApp message should be sent!

### Step 8: Get Permanent Access Token (For Production)

Temporary tokens expire in 24 hours. For production, you need a System User Token:

#### Option A: Using System User (Recommended)

1. Go to **Meta Business Settings**: https://business.facebook.com/settings
2. Click **"System Users"** in the left menu
3. Click **"Add"** → **"Create New System User"**
4. Name it (e.g., "WhatsApp API User")
5. Click **"Create System User"**
6. Click **"Generate New Token"**
7. Select your app
8. Select permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
9. Click **"Generate Token"**
10. **Copy the token immediately** - it's only shown once!
11. Replace `WHATSAPP_ACCESS_TOKEN` in your `.env` with this token

#### Option B: Using App Access Token (Simpler but less secure)

1. Go to your app dashboard
2. Go to **"Settings"** → **"Basic"**
3. Find **"App ID"** and **"App Secret"**
4. Your access token is: `{APP_ID}|{APP_SECRET}`
5. Use this as your `WHATSAPP_ACCESS_TOKEN`

### Step 9: Business Verification (Required for Production)

To send messages to customers who haven't messaged you first, you need business verification:

1. Go to [Meta Business Settings](https://business.facebook.com/settings)
2. Click **"Security"** → **"Business Verification"**
3. Click **"Start Verification"**
4. Provide required documents:
   - Business registration documents
   - Business address proof
   - Tax documents (if applicable)
   - Business phone number
5. Submit for review (can take 1-7 days)

### Step 10: Message Templates (For Outbound Messages)

If you want to send messages to customers who haven't contacted you:

1. Go to your app dashboard → **"WhatsApp"** → **"Message Templates"**
2. Click **"Create Template"**
3. Fill in:
   - **Name**: e.g., "payment_confirmation"
   - **Category**: Choose appropriate (UTILITY, MARKETING, AUTHENTICATION)
   - **Language**: Select your language
   - **Content**: Your message template
4. Submit for approval (usually takes 24-48 hours)

**Note**: For our use case (thank you messages after payment), you can use **session messages** (free-form) within 24 hours of customer interaction, so templates aren't strictly necessary.

## Environment Variables

Your final `server/.env` should look like:

```env
# WhatsApp Business API (Meta) - Production
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_API_VERSION=v18.0

# Other variables...
CHAPA_SECRET_KEY=your_chapa_key
FRONTEND_URL=http://localhost:3000
PORT=5000
```

## Testing

### Test 1: Check Configuration

When you start your server, you should see:
```
📋 Environment check:
  WhatsApp Provider: ✅ WhatsApp Business API
```

### Test 2: Send Test Message

Make a test payment and check:
1. Server logs for: `✅ WhatsApp thank you message sent successfully`
2. Customer's WhatsApp for the thank you message

### Test 3: Check API Response

If there are errors, check the server logs. Common issues:
- **401 Unauthorized**: Invalid access token
- **404 Not Found**: Wrong phone number ID
- **403 Forbidden**: Missing permissions or business not verified

## Troubleshooting

### Error: "Invalid OAuth access token"

**Solution**: 
- Your token expired (if using temporary token)
- Regenerate token or use System User token

### Error: "Phone number not found"

**Solution**:
- Check `WHATSAPP_PHONE_NUMBER_ID` is correct
- Make sure the phone number is verified in Meta Business

### Error: "Message failed to send"

**Possible causes**:
1. Customer hasn't opted in (for outbound messages)
2. Business not verified (for outbound messages)
3. Rate limit exceeded
4. Invalid phone number format

**Solution**:
- For thank you messages after payment, customers have "opted in" by making a payment
- Ensure phone numbers are in E.164 format: `+251978639887`
- Check Meta Business Manager for any restrictions

### Messages Not Sending

1. **Check server logs** for detailed error messages
2. **Verify environment variables** are set correctly
3. **Test with Meta's API Explorer**: https://developers.facebook.com/tools/explorer/
4. **Check WhatsApp Business Manager** for any account issues

## Rate Limits

- **Free tier**: 1,000 conversations per month
- **Paid tier**: Based on your plan
- **Rate limits**: Vary by message type

## Cost

✅ **FREE** for:
- Up to 1,000 conversations per month
- Session messages (within 24 hours of customer message)
- Template messages (after approval)

💵 **Paid** for:
- More than 1,000 conversations/month
- Additional features

## Next Steps

1. ✅ Complete setup above
2. ✅ Test with a real payment
3. ✅ Monitor server logs
4. ✅ Apply for business verification (for production)
5. ✅ Create message templates (optional, for outbound)

## Resources

- [Meta WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Meta Business Suite](https://business.facebook.com/)
- [Meta for Developers](https://developers.facebook.com/)
- [WhatsApp Business API Pricing](https://developers.facebook.com/docs/whatsapp/pricing)

## Support

- [Meta Business Support](https://business.facebook.com/help)
- [WhatsApp Business API Support](https://developers.facebook.com/support/)

