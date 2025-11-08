/**
 * WhatsApp messaging service
 * Supports multiple providers: Twilio, WhatsApp Business API, or simple HTTP-based services
 */

interface SendWhatsAppMessageParams {
  to: string; // Phone number in E.164 format (e.g., +251978639887)
  message: string;
  customerName?: string;
}

interface WhatsAppResponse {
  success: boolean;
  message?: string;
  error?: string;
  messageId?: string;
}

/**
 * Format phone number to E.164 format
 * Removes all non-digit characters and adds country code if missing
 */
export const formatPhoneNumber = (phone: string, defaultCountryCode: string = '251'): string => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If it doesn't start with country code, add it
  if (!cleaned.startsWith('251') && !cleaned.startsWith('+251')) {
    cleaned = defaultCountryCode + cleaned;
  }
  
  // Ensure it starts with +
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
};

/**
 * Send WhatsApp message using Twilio
 */
const sendViaTwilio = async (params: SendWhatsAppMessageParams): Promise<WhatsAppResponse> => {
  // Support both API Key (SK...) and Account SID/Auth Token authentication
  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  // Support both Messaging Service SID (MG...) and WhatsApp number (whatsapp:+...)
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM; // Format: whatsapp:+14155238886 or MG...

  // Validate authentication credentials
  const useApiKey = apiKeySid && apiKeySecret;
  const useAccountAuth = accountSid && authToken;
  
  if (!useApiKey && !useAccountAuth) {
    throw new Error('Twilio credentials not configured. Please set either:\n' +
      '  - TWILIO_API_KEY_SID and TWILIO_API_KEY_SECRET (recommended), OR\n' +
      '  - TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
  }

  if (!messagingServiceSid && !fromNumber) {
    throw new Error('Twilio sender not configured. Please set either TWILIO_MESSAGING_SERVICE_SID (recommended) or TWILIO_WHATSAPP_FROM in .env');
  }

  try {
    // Import Twilio client dynamically
    const twilio = require('twilio');
    
    // Initialize client with API Key (preferred) or Account SID/Auth Token
    const client = useApiKey 
      ? twilio(apiKeySid, apiKeySecret, { accountSid: accountSid || undefined })
      : twilio(accountSid, authToken);

    // Format recipient number (must be in E.164 format with whatsapp: prefix)
    const to = params.to.startsWith('+') 
      ? (params.to.startsWith('whatsapp:') ? params.to : `whatsapp:${params.to}`)
      : `whatsapp:+${params.to}`;

    // Prepare message options
    const messageOptions: any = {
      body: params.message,
      to: to,
    };

    // Use Messaging Service SID if available (recommended for production)
    // Otherwise, use the WhatsApp number
    if (messagingServiceSid) {
      messageOptions.messagingServiceSid = messagingServiceSid;
      console.log('Using Twilio Messaging Service:', messagingServiceSid);
    } else {
      // Format sender number
      const from = fromNumber!.startsWith('whatsapp:') 
        ? fromNumber! 
        : (fromNumber!.startsWith('MG') ? fromNumber! : `whatsapp:${fromNumber!}`);
      messageOptions.from = from;
      console.log('Using Twilio WhatsApp number:', from);
    }

    const result = await client.messages.create(messageOptions);

    return {
      success: true,
      message: 'WhatsApp message sent successfully',
      messageId: result.sid,
    };
  } catch (error: any) {
    console.error('Twilio WhatsApp error:', error);
    throw new Error(`Failed to send WhatsApp message via Twilio: ${error.message}`);
  }
};

/**
 * Send WhatsApp message using WhatsApp Business API (Meta)
 */
const sendViaWhatsAppBusinessAPI = async (params: SendWhatsAppMessageParams): Promise<WhatsAppResponse> => {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v18.0';

  if (!accessToken || !phoneNumberId) {
    throw new Error('WhatsApp Business API credentials not configured. Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env');
  }

  try {
    const https = require('https');
    const postData = JSON.stringify({
      messaging_product: 'whatsapp',
      to: params.to.replace(/\+/g, ''), // Remove + for WhatsApp Business API
      type: 'text',
      text: {
        body: params.message,
      },
    });

    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'graph.facebook.com',
        port: 443,
        path: `/${apiVersion}/${phoneNumberId}/messages`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      }, (res: any) => {
        let data = '';
        res.on('data', (chunk: any) => { data += chunk; });
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({
                success: true,
                message: 'WhatsApp message sent successfully',
                messageId: jsonData.messages?.[0]?.id,
              });
            } else {
              reject(new Error(jsonData.error?.message || 'Failed to send WhatsApp message'));
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  } catch (error: any) {
    console.error('WhatsApp Business API error:', error);
    throw new Error(`Failed to send WhatsApp message via WhatsApp Business API: ${error.message}`);
  }
};

/**
 * Send WhatsApp message using a simple HTTP-based service
 * This is a fallback option that can be customized for other services
 */
const sendViaHTTPService = async (params: SendWhatsAppMessageParams): Promise<WhatsAppResponse> => {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiKey = process.env.WHATSAPP_API_KEY;

  if (!apiUrl) {
    throw new Error('WhatsApp HTTP service URL not configured. Please set WHATSAPP_API_URL in .env');
  }

  try {
    const https = require('https');
    const http = require('http');
    const url = require('url');
    const parsedUrl = new url.URL(apiUrl);
    const isHttps = parsedUrl.protocol === 'https:';

    const postData = JSON.stringify({
      to: params.to,
      message: params.message,
      ...(apiKey && { apiKey }),
    });

    const client = isHttps ? https : http;

    return new Promise((resolve, reject) => {
      const req = client.request({
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
        },
      }, (res: any) => {
        let data = '';
        res.on('data', (chunk: any) => { data += chunk; });
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({
                success: true,
                message: 'WhatsApp message sent successfully',
                messageId: jsonData.messageId || jsonData.id,
              });
            } else {
              reject(new Error(jsonData.error || jsonData.message || 'Failed to send WhatsApp message'));
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  } catch (error: any) {
    console.error('WhatsApp HTTP service error:', error);
    throw new Error(`Failed to send WhatsApp message via HTTP service: ${error.message}`);
  }
};

/**
 * Main function to send WhatsApp message
 * Automatically selects the appropriate provider based on environment variables
 */
export const sendWhatsAppMessage = async (params: SendWhatsAppMessageParams): Promise<WhatsAppResponse> => {
  try {
    // Format phone number
    const formattedPhone = formatPhoneNumber(params.to);
    
    // Determine which provider to use based on environment variables
    // Priority: WhatsApp Business API (Meta - FREE) > Twilio > HTTP Service
    
    // Check for WhatsApp Business API first (Meta - Free option)
    if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
      console.log('Sending WhatsApp message via WhatsApp Business API (Meta)...');
      return await sendViaWhatsAppBusinessAPI({ ...params, to: formattedPhone });
    }
    
    // Check for Twilio (API Key preferred, or Account SID/Auth Token)
    const hasTwilioApiKey = process.env.TWILIO_API_KEY_SID && process.env.TWILIO_API_KEY_SECRET;
    const hasTwilioAccountAuth = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;
    
    if (hasTwilioApiKey || hasTwilioAccountAuth) {
      console.log('Sending WhatsApp message via Twilio...');
      return await sendViaTwilio({ ...params, to: formattedPhone });
    } else if (process.env.WHATSAPP_API_URL) {
      console.log('Sending WhatsApp message via HTTP service...');
      return await sendViaHTTPService({ ...params, to: formattedPhone });
    } else {
      // No provider configured - log warning but don't fail
      console.warn('⚠️  No WhatsApp provider configured. Please set up one of:');
      console.warn('   - Twilio (API Key): TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, TWILIO_ACCOUNT_SID, TWILIO_MESSAGING_SERVICE_SID');
      console.warn('   - Twilio (Account Auth): TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM');
      console.warn('   - WhatsApp Business API: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID');
      console.warn('   - HTTP Service: WHATSAPP_API_URL');
      console.warn('   Current env check:');
      console.warn('     TWILIO_API_KEY_SID:', process.env.TWILIO_API_KEY_SID ? '✅ Set' : '❌ Not set');
      console.warn('     TWILIO_API_KEY_SECRET:', process.env.TWILIO_API_KEY_SECRET ? '✅ Set' : '❌ Not set');
      console.warn('     TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Not set');
      console.warn('     TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Not set');
      console.warn('     TWILIO_MESSAGING_SERVICE_SID:', process.env.TWILIO_MESSAGING_SERVICE_SID ? '✅ Set' : '❌ Not set');
      console.warn('   Message would have been sent to:', formattedPhone);
      console.warn('   Message:', params.message.substring(0, 100) + '...');
      
      return {
        success: false,
        error: 'No WhatsApp provider configured',
        message: 'WhatsApp messaging is not configured. Please set up a provider in environment variables.',
      };
    }
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    return {
      success: false,
      error: error.message || 'Failed to send WhatsApp message',
    };
  }
};

/**
 * Generate thank you message for successful payment
 */
export const generateThankYouMessage = (paymentData: {
  customerName?: string;
  amount: number;
  currency: string;
  txRef: string;
  eventTitle?: string;
  quantity?: number;
}): string => {
  const name = paymentData.customerName || 'Valued Customer';
  const amount = paymentData.amount.toFixed(2);
  const currency = paymentData.currency || 'ETB';
  const txRef = paymentData.txRef.substring(0, 8).toUpperCase();
  const eventInfo = paymentData.eventTitle ? ` for ${paymentData.eventTitle}` : '';
  const quantityInfo = paymentData.quantity && paymentData.quantity > 1 
    ? ` (${paymentData.quantity} tickets)` 
    : '';

  return `🎉 Thank you, ${name}!

Your payment of ${amount} ${currency}${quantityInfo}${eventInfo} has been successfully processed.

📋 Transaction Reference: ${txRef}

Your ticket has been confirmed. Please keep this reference number for your records.

We look forward to seeing you at the event!

Best regards,
Yenege Events Team`;
};

