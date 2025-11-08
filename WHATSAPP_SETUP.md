# WhatsApp Thank You Message Setup Guide

This guide explains how to set up automatic WhatsApp thank you messages that are sent to customers after successful payment.

## Overview

After a successful payment, the system automatically sends a personalized thank you message to the customer's WhatsApp number. The message includes:
- Customer name
- Payment amount and currency
- Transaction reference
- Event title (if applicable)
- Ticket quantity (if applicable)

## Supported Providers

The system supports three WhatsApp messaging providers:

1. **Twilio WhatsApp API** (Recommended)
2. **WhatsApp Business API (Meta)**
3. **Custom HTTP Service**

## Setup Instructions

### Option 1: Twilio WhatsApp API (Recommended)

Twilio provides a reliable WhatsApp messaging service that's easy to set up.

#### Step 1: Create a Twilio Account
1. Sign up at [Twilio](https://www.twilio.com/)
2. Verify your account and add credits

#### Step 2: Set Up WhatsApp Sandbox (for testing)
1. Go to [Twilio Console > Messaging > Try it out > Send a WhatsApp message](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
2. Follow the instructions to join the sandbox
3. Note your sandbox number (format: `whatsapp:+14155238886`)

#### Step 3: Get Your Credentials

You have two authentication options:

**Option 1: API Key (Recommended - More Secure)**
1. Go to [Twilio Console > Account > API Keys & Tokens](https://console.twilio.com/us1/account/keys-credentials/api-keys)
2. Click "Create API Key"
3. Give it a friendly name (e.g., "yenege")
4. Copy the **API Key SID** (starts with `SK...`) and **Secret** (shown only once!)
5. Also note your **Account SID** (starts with `AC...`) from the same page

**Option 2: Account SID and Auth Token (Alternative)**
1. Go to [Twilio Console > Account > API Keys & Tokens](https://console.twilio.com/us1/account/keys-credentials/api-keys)
2. Copy your **Account SID** and **Auth Token**

#### Step 4: Configure Environment Variables

**Using API Key (Recommended):**

**Option A: Using Messaging Service (Recommended for Production)**
Add these to your `server/.env` file:

```env
TWILIO_API_KEY_SID=SKafda4d75ce921b914bf8f9a386972e2a
TWILIO_API_KEY_SECRET=MNpFlQKy3AmGjSTQ0LtsTWDlnckk6u98
TWILIO_ACCOUNT_SID=ACeebe7f344bc901052bd7c719ae4aaaec
TWILIO_MESSAGING_SERVICE_SID=MGcb05a0f15553561c5277a03013fe4e68
```

**Option B: Using WhatsApp Number (For Sandbox/Testing)**
Add these to your `server/.env` file:

```env
TWILIO_API_KEY_SID=SKafda4d75ce921b914bf8f9a386972e2a
TWILIO_API_KEY_SECRET=MNpFlQKy3AmGjSTQ0LtsTWDlnckk6u98
TWILIO_ACCOUNT_SID=ACeebe7f344bc901052bd7c719ae4aaaec
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

**Using Account SID/Auth Token (Alternative):**

```env
TWILIO_ACCOUNT_SID=ACeebe7f344bc901052bd7c719ae4aaaec
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_MESSAGING_SERVICE_SID=MGcb05a0f15553561c5277a03013fe4e68
```

**Important Notes:**
- **Message Body**: You don't need to set a message body manually. The system automatically generates personalized thank you messages with payment details.
- **API Key vs Auth Token**: API Keys are more secure and can be revoked independently. Use API Keys for production.
- **Messaging Service SID** is recommended for production as it provides better delivery management and can handle both SMS and WhatsApp.
- **WhatsApp Number** is good for testing with the sandbox.
- For production WhatsApp, you'll need to request WhatsApp Business API access from Twilio and get a dedicated WhatsApp Business number.
- **Security**: Never commit your `.env` file to version control. Keep your API Key Secret safe - it's only shown once!

#### Step 5: Install Twilio SDK (Optional)
The system will automatically install Twilio when needed, but you can pre-install it:

```bash
cd server
npm install twilio
```

### Option 2: WhatsApp Business API (Meta)

This option requires a Meta Business account and WhatsApp Business API access.

#### Step 1: Set Up Meta Business Account
1. Create a [Meta Business Account](https://business.facebook.com/)
2. Set up a [WhatsApp Business Account](https://www.facebook.com/business/help/2055875911147364)

#### Step 2: Get API Credentials
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add WhatsApp product to your app
4. Get your **Access Token** and **Phone Number ID**

#### Step 3: Configure Environment Variables
Add these to your `server/.env` file:

```env
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_API_VERSION=v18.0
```

### Option 3: Custom HTTP Service

If you have your own WhatsApp messaging service or third-party provider, you can use this option.

#### Step 1: Set Up Your Service
Ensure your service accepts POST requests with this format:

```json
{
  "to": "+251978639887",
  "message": "Thank you message...",
  "apiKey": "your-api-key"
}
```

#### Step 2: Configure Environment Variables
Add these to your `server/.env` file:

```env
WHATSAPP_API_URL=https://your-service.com/api/send-message
WHATSAPP_API_KEY=your-api-key-here
```

## Testing

### Test the Setup

1. Make a test payment
2. Check the server logs for WhatsApp message status:
   - ✅ Success: `WhatsApp thank you message sent successfully`
   - ⚠️ Warning: `Failed to send WhatsApp message` (check configuration)
   - ❌ Error: Check error message for details

### Manual Testing

You can also test the WhatsApp endpoint directly:

```bash
curl -X POST http://localhost:5000/api/payments/send-whatsapp-thankyou \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+251978639887",
    "customer_name": "Test Customer",
    "amount": 100.00,
    "currency": "ETB",
    "tx_ref": "TEST123456",
    "event_title": "Test Event",
    "quantity": 1
  }'
```

## Message Format

The thank you message is automatically generated with this format:

```
🎉 Thank you, [Customer Name]!

Your payment of [Amount] [Currency] ([Quantity] tickets) for [Event Title] has been successfully processed.

📋 Transaction Reference: [TX_REF]

Your ticket has been confirmed. Please keep this reference number for your records.

We look forward to seeing you at the event!

Best regards,
Yenege Events Team
```

## Troubleshooting

### Messages Not Sending

1. **Check Environment Variables**
   - Ensure all required variables are set in `server/.env`
   - Restart the server after changing environment variables

2. **Check Server Logs**
   - Look for WhatsApp-related error messages
   - Check if the provider is correctly detected

3. **Verify Phone Number Format**
   - Phone numbers should be in E.164 format: `+251978639887`
   - The system automatically formats numbers, but ensure the input is correct

4. **Provider-Specific Issues**

   **Twilio:**
   - Verify your Account SID and Auth Token
   - Check if you're using the correct WhatsApp number format
   - Ensure you have sufficient credits
   - For sandbox: Make sure the recipient has joined the sandbox

   **WhatsApp Business API:**
   - Verify your Access Token is valid
   - Check if your Phone Number ID is correct
   - Ensure your app has WhatsApp permissions
   - Verify the recipient has opted in to receive messages

### Phone Number Not Available

If the payment doesn't include a phone number, WhatsApp messages won't be sent. Ensure:
- The payment initialization includes `phone_number`
- The Chapa payment response includes the phone number
- The phone number is stored in the payment metadata

## Production Considerations

1. **Rate Limits**: Be aware of provider rate limits
2. **Error Handling**: Messages are sent asynchronously and won't block payment processing
3. **Logging**: All WhatsApp operations are logged for debugging
4. **Costs**: Review pricing for your chosen provider
5. **Compliance**: Ensure compliance with WhatsApp Business Policy and local regulations

## Support

For issues or questions:
- Check server logs for detailed error messages
- Review provider documentation
- Contact support for your chosen WhatsApp provider

