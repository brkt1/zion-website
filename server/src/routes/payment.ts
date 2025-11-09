import express, { Request, Response } from 'express';
import chapa from '../services/chapa';
import { generateThankYouMessage, sendWhatsAppMessage } from '../services/whatsapp';

const router = express.Router();

interface InitializePaymentRequest {
  first_name?: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  currency: string;
  amount: string;
  quantity?: number;
  tx_ref: string;
  callback_url?: string;
  return_url?: string;
  event_id?: string;
  event_title?: string;
  commission_seller_id?: string;
  recaptcha_token?: string;
}

// Initialize payment
router.post('/initialize', async (req: Request, res: Response) => {
  try {
    // Log incoming request for debugging
    console.log('Payment initialization request received:', {
      body: req.body,
      headers: {
        'content-type': req.headers['content-type'],
      },
    });

    const {
      first_name,
      last_name,
      email,
      phone_number,
      currency,
      amount,
      quantity,
      tx_ref,
      callback_url,
      return_url,
      event_id,
      event_title,
      commission_seller_id,
      recaptcha_token,
    }: InitializePaymentRequest = req.body;

    // Validate required fields (tx_ref is optional, will be generated if not provided)
    if (!email || !currency || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, currency, amount',
      });
    }

    // SECURITY: Verify reCAPTCHA token (REQUIRED)
    const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    // Check if reCAPTCHA is configured
    if (!recaptchaSecretKey) {
      console.error('SECURITY WARNING: RECAPTCHA_SECRET_KEY is not configured!');
      return res.status(500).json({
        success: false,
        message: 'Security verification is not properly configured. Please contact support.',
        error: 'RECAPTCHA_NOT_CONFIGURED',
      });
    }

    // Require reCAPTCHA token
    if (!recaptcha_token || recaptcha_token.trim() === '') {
      console.warn('SECURITY: Payment request rejected - no reCAPTCHA token provided');
      return res.status(400).json({
        success: false,
        message: 'Security verification required. Please refresh the page and try again.',
        error: 'RECAPTCHA_TOKEN_MISSING',
      });
    }

    // Verify reCAPTCHA token with Google
    try {
      const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
      const verifyResponse = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${recaptchaSecretKey}&response=${recaptcha_token}`,
      });

      if (!verifyResponse.ok) {
        console.error('reCAPTCHA API error:', verifyResponse.status, verifyResponse.statusText);
        return res.status(400).json({
          success: false,
          message: 'Security verification service unavailable. Please try again.',
          error: 'RECAPTCHA_SERVICE_ERROR',
        });
      }

      const verifyData = await verifyResponse.json();

      // Check if verification was successful
      if (!verifyData.success) {
        console.warn('SECURITY: reCAPTCHA verification failed:', {
          'error-codes': verifyData['error-codes'],
          timestamp: new Date().toISOString(),
        });
        return res.status(400).json({
          success: false,
          message: 'Security verification failed. Please refresh the page and try again.',
          error: 'RECAPTCHA_VERIFICATION_FAILED',
          suggestion: 'If this problem persists, please try clearing your browser cache.',
        });
      }

      // Check score threshold (0.0 to 1.0, higher is more likely human)
      // Score below 0.5 indicates suspicious activity
      const score = verifyData.score !== undefined ? verifyData.score : 1.0;
      const SCORE_THRESHOLD = 0.5; // Adjust this value based on your security needs (0.0-1.0)

      if (score < SCORE_THRESHOLD) {
        console.warn('SECURITY: reCAPTCHA score too low (suspicious activity detected):', {
          score,
          threshold: SCORE_THRESHOLD,
          action: verifyData.action,
          timestamp: new Date().toISOString(),
        });
        return res.status(400).json({
          success: false,
          message: 'Security verification failed. Please try again.',
          error: 'RECAPTCHA_SCORE_TOO_LOW',
          suggestion: 'If you believe this is an error, please contact support.',
        });
      }

      // Log successful verification (without sensitive data)
      console.log('✅ reCAPTCHA verified successfully:', {
        score: score.toFixed(2),
        action: verifyData.action,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('SECURITY ERROR: reCAPTCHA verification failed:', error);
      // Fail securely - reject payment if verification cannot be completed
      return res.status(400).json({
        success: false,
        message: 'Security verification failed. Please try again.',
        error: 'RECAPTCHA_VERIFICATION_ERROR',
        suggestion: 'If this problem persists, please contact support.',
      });
    }

    // Generate transaction reference if not provided
    let transactionRef = tx_ref;
    if (!transactionRef) {
      transactionRef = await chapa.generateTransactionReference({
        prefix: 'YENEGE',
        size: 20,
      });
    }

    // Ensure FRONTEND_URL is set
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Build URLs - ensure they're valid absolute URLs
    // Remove trailing slash if present
    const baseUrl = frontendUrl.replace(/\/$/, '');
    const callbackUrl = callback_url || `${baseUrl}/payment/callback`;
    
    // Build return URL with all necessary parameters
    let returnUrlParams = new URLSearchParams();
    returnUrlParams.set('tx_ref', transactionRef);
    if (event_id) returnUrlParams.set('event_id', event_id);
    if (event_title) returnUrlParams.set('event_title', event_title);
    if (quantity) returnUrlParams.set('quantity', quantity.toString());
    if (commission_seller_id) returnUrlParams.set('commission_seller_id', commission_seller_id);
    
    const returnUrl = return_url || `${baseUrl}/payment/success?${returnUrlParams.toString()}`;

    // Validate URLs are properly formatted
    try {
      new URL(callbackUrl);
      new URL(returnUrl);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: `Invalid URL format: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    // Debug logging
    console.log('Payment initialization:', {
      email,
      amount,
      currency,
      tx_ref: transactionRef,
      callback_url: callbackUrl,
      return_url: returnUrl,
      frontendUrl: baseUrl,
      hasApiKey: !!process.env.CHAPA_SECRET_KEY,
      apiKeyPrefix: process.env.CHAPA_SECRET_KEY?.substring(0, 20) || 'NOT SET',
    });

    // Initialize payment
    // Note: Chapa requires HTTPS URLs for production keys
    // Ensure your FRONTEND_URL uses HTTPS in production
    try {
      // Prepare payment data - ensure amount is a string (Chapa expects string)
      // Chapa expects amount as a string in base currency (e.g., "100.00" for 100 ETB)
      // Chapa will convert it to cents internally and return amounts in cents
      const amountValue = parseFloat(String(amount)) || 0;
      
      // Validate amount
      if (amountValue <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment amount. Amount must be greater than 0.',
        });
      }

      console.log('Payment amount details:', {
        receivedAmount: amount,
        parsedAmount: amountValue,
        quantity: quantity || 1,
        expectedTotal: amountValue,
        currency: currency.toUpperCase(),
        note: 'Amount should be total (price * quantity)',
      });

      const paymentData: any = {
        first_name: first_name || 'Customer',
        last_name: last_name || '',
        email,
        currency: currency.toUpperCase(), // Ensure uppercase (ETB, USD, etc.)
        amount: String(amountValue), // Send as string in base currency (e.g., "50.00" for 50 ETB)
        tx_ref: transactionRef,
        callback_url: callbackUrl,
        return_url: returnUrl,
      };

      // Add phone_number if provided
      if (phone_number && phone_number.trim()) {
        paymentData.phone_number = phone_number.trim();
      }

      // Add customization if provided
      // Note: Chapa requires customization.title to be max 16 characters
      if (event_title) {
        const title = event_title.length > 16 ? event_title.substring(0, 16) : event_title;
        paymentData.customization = {
          title: title,
          description: `Payment for ${event_title || 'event registration'}`,
        };
      }

      console.log('Calling Chapa initialize with:', {
        ...paymentData,
        callback_url: paymentData.callback_url,
        return_url: paymentData.return_url,
      });

      // Try using Chapa library first, but if it fails with limited error info,
      // make a direct HTTP call to get the actual error
      let response;
      try {
        response = await chapa.initialize(paymentData);
      } catch (libraryError: any) {
        // If the library error doesn't have detailed info, make direct HTTP call
        if (!libraryError.response?.data || Object.keys(libraryError.response?.data || {}).length <= 1) {
          console.log('⚠️  Chapa library error lacks details, making direct HTTP call to get full error...');
          
          // Make direct HTTP call to Chapa API
          const https = require('https');
          const postData = JSON.stringify(paymentData);
          const secretKey = process.env.CHAPA_SECRET_KEY || '';
          
          const directResponse = await new Promise((resolve, reject) => {
            const req = https.request({
              hostname: 'api.chapa.co',
              port: 443,
              path: '/v1/transaction/initialize',
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${secretKey}`,
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
                    // Success - return in Chapa library format
                    resolve({ 
                      data: jsonData.data || jsonData,
                      message: jsonData.message,
                      status: jsonData.status || 'success',
                    });
                  } else {
                    // Error - reject with full error details
                    reject({
                      response: {
                        status: res.statusCode,
                        data: jsonData,
                      },
                      message: jsonData.message || 'Chapa API error',
                      status: res.statusCode,
                    });
                  }
                } catch (e) {
                  reject({ message: data, status: res.statusCode });
                }
              });
            });
            
            req.on('error', reject);
            req.write(postData);
            req.end();
          });
          
          response = directResponse as any;
        } else {
          // Re-throw the library error if it has details
          throw libraryError;
        }
      }
      return res.json({
        success: true,
        data: {
          checkout_url: response.data.checkout_url,
          tx_ref: transactionRef,
          message: response.message,
          status: response.status,
        },
      });
    } catch (error: any) {
      // Log the full error for debugging - this is critical for troubleshooting
      // Chapa library might store error in different places - try all possibilities
      let errorResponse: any = {};
      let errorStatus: number | undefined;
      
      // Try multiple ways to extract the error response
      if (error.response?.data) {
        errorResponse = error.response.data;
        errorStatus = error.response.status;
      } else if (error.data) {
        errorResponse = error.data;
        errorStatus = error.status;
      } else if (error.body) {
        errorResponse = error.body;
        errorStatus = error.statusCode;
      } else if (error.response) {
        // Sometimes the response itself is the data
        errorResponse = error.response;
        errorStatus = error.status || error.statusCode;
      } else {
        // Try to extract from error object directly
        errorResponse = error;
        errorStatus = error.status || error.statusCode;
      }
      
      const errorMessage = error.message || 'Unknown error occurred';
      
      // Log all error properties to help debug
      console.error('═══════════════════════════════════════════════════════');
      console.error('❌ Chapa API Error Details:');
      console.error('═══════════════════════════════════════════════════════');
      console.error('Error Type:', error.constructor?.name);
      console.error('Error Message:', errorMessage);
      console.error('HTTP Status:', errorStatus);
      console.error('\nError Object Keys:', error && typeof error === 'object' ? Object.keys(error) : 'N/A');
      console.error('\nError Response:', JSON.stringify(errorResponse, null, 2));
      
      // Try to find the actual Chapa response in nested properties
      if (error.response && typeof error.response === 'object') {
        console.error('\nError.response keys:', Object.keys(error.response));
        if (error.response.data) {
          console.error('Error.response.data:', JSON.stringify(error.response.data, null, 2));
        }
      }
      
      console.error('\nRequest Data Sent:', {
        email,
        amount,
        currency,
        tx_ref: transactionRef,
        callback_url: callbackUrl,
        return_url: returnUrl,
      });
      console.error('═══════════════════════════════════════════════════════');

      // Check if using production key
      const isProductionKey = process.env.CHAPA_SECRET_KEY?.startsWith('CHASECK-') && 
                              !process.env.CHAPA_SECRET_KEY?.startsWith('CHASECK_TEST-');
      const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
      
      // Warn if using production key with localhost (should use HTTPS in production)
      if (isProductionKey && isLocalhost) {
        console.warn('⚠️  WARNING: Using production Chapa key with localhost. Production keys require HTTPS URLs.');
      }

      // FIRST: Check for rate limiting errors (429)
      if (errorStatus === 429) {
        const retryAfter = errorResponse.message?.match(/(\d+)\s*seconds?/i)?.[1] || 'a few';
        return res.status(429).json({
          success: false,
          message: `Rate limit exceeded. ${errorResponse.message || `Please try again in ${retryAfter} seconds.`}`,
          error: 'RATE_LIMIT_EXCEEDED',
          suggestion: `Please wait ${retryAfter} seconds before trying again.`,
          details: errorResponse,
        });
      }

      // SECOND: Check for validation errors (most specific, should be checked early)
      // Chapa returns validation errors in message object with field names as keys
      // Check if message is an object with field names as keys (validation error format)
      if (errorResponse.message && typeof errorResponse.message === 'object' && !Array.isArray(errorResponse.message)) {
        const messageKeys = Object.keys(errorResponse.message);
        // If message has keys that look like field names (not 'error', 'status', etc.), it's likely a validation error
        const looksLikeValidation = messageKeys.some(key => 
          !['error', 'status', 'data', 'message'].includes(key.toLowerCase())
        );
        
        if (looksLikeValidation) {
          const validationErrors: string[] = [];
          for (const [field, errors] of Object.entries(errorResponse.message)) {
            if (Array.isArray(errors)) {
              validationErrors.push(`${field}: ${errors.join(', ')}`);
            } else {
              validationErrors.push(`${field}: ${errors}`);
            }
          }
          
          return res.status(400).json({
            success: false,
            message: `Validation error: ${validationErrors.join('; ')}. Please check your input and try again.`,
            error: 'VALIDATION_ERROR',
            details: {
              validationErrors: errorResponse.message,
              fullResponse: errorResponse,
            },
          });
        }
      }

      // Handle other Chapa API errors
      const chapaMessage = errorResponse.message || errorMessage;
      return res.status(400).json({
        success: false,
        message: chapaMessage || 'Failed to initialize payment with Chapa',
        error: errorResponse.error || 'CHAPA_API_ERROR',
        details: errorResponse,
      });
    }
  } catch (error: any) {
    console.error('Payment initialization error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize payment',
    });
  }
});

// Verify payment
router.get('/verify/:tx_ref', async (req: Request, res: Response) => {
  try {
    const { tx_ref } = req.params;

    if (!tx_ref) {
      return res.status(400).json({
        success: false,
        message: 'Transaction reference is required',
      });
    }

    console.log('Verifying payment with tx_ref:', tx_ref);

    // Try using Chapa library first
    let response;
    try {
      response = await chapa.verify({
        tx_ref,
      });
      console.log('Chapa verification response:', JSON.stringify(response, null, 2));
    } catch (libraryError: any) {
      // If library fails, try direct HTTP call
      console.log('⚠️  Chapa library verification failed, trying direct HTTP call...');
      
      const https = require('https');
      const secretKey = process.env.CHAPA_SECRET_KEY || '';
      
      const directResponse = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: 'api.chapa.co',
          port: 443,
          path: `/v1/transaction/verify/${tx_ref}`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        }, (res: any) => {
          let data = '';
          res.on('data', (chunk: any) => { data += chunk; });
          res.on('end', () => {
            try {
              const jsonData = JSON.parse(data);
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve({ 
                  data: jsonData.data || jsonData,
                  message: jsonData.message,
                  status: jsonData.status || 'success',
                });
              } else {
                reject({
                  response: {
                    status: res.statusCode,
                    data: jsonData,
                  },
                  message: jsonData.message || 'Chapa API error',
                });
              }
            } catch (e) {
              reject({ message: data, status: res.statusCode });
            }
          });
        });
        
        req.on('error', reject);
        req.end();
      });
      
      response = directResponse as any;
    }

    // Handle response structure
    const verificationData: any = response.data || response;
    
    console.log('Verification data:', JSON.stringify(verificationData, null, 2));

    // If payment is successful, send WhatsApp thank you message
    const status = verificationData.status?.toLowerCase();
    // Access phone_number from meta or directly (Chapa may store it in different places)
    const phoneNumber = verificationData.phone_number || verificationData.meta?.phone_number;
    
    if ((status === "success" || status === "successful" || status === "completed") && phoneNumber) {
      try {
        const amount = verificationData.amount 
          ? (typeof verificationData.amount === 'string' 
              ? parseFloat(verificationData.amount) / 100 
              : verificationData.amount / 100)
          : 0;
        
        const thankYouMessage = generateThankYouMessage({
          customerName: verificationData.first_name && verificationData.last_name
            ? `${verificationData.first_name} ${verificationData.last_name}`
            : verificationData.first_name || verificationData.last_name,
          amount,
          currency: verificationData.currency || 'ETB',
          txRef: verificationData.tx_ref || '',
          eventTitle: verificationData.event_title || verificationData.meta?.event_title,
          quantity: verificationData.quantity || verificationData.meta?.quantity,
        });

        // Send WhatsApp message asynchronously (don't wait for it)
        sendWhatsAppMessage({
          to: phoneNumber,
          message: thankYouMessage,
          customerName: verificationData.first_name || verificationData.last_name,
        }).then((result) => {
          if (result.success) {
            console.log('✅ WhatsApp thank you message sent successfully:', result.messageId);
          } else {
            console.warn('⚠️  Failed to send WhatsApp message:', result.error);
          }
        }).catch((error) => {
          console.error('❌ Error sending WhatsApp message:', error);
        });
      } catch (error: any) {
        // Don't fail the verification if WhatsApp sending fails
        console.error('Error preparing WhatsApp message:', error);
      }
    }

    res.json({
      success: true,
      data: verificationData,
      message: response.message || 'Payment verified',
      status: response.status || verificationData.status,
    });
  } catch (error: any) {
    console.error('═══════════════════════════════════════════════════════');
    console.error('❌ Payment Verification Error:');
    console.error('═══════════════════════════════════════════════════════');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data || error.data);
    console.error('═══════════════════════════════════════════════════════');

    const errorResponse = error.response?.data || error.data || {};
    const errorMessage = errorResponse.message || error.message || 'Failed to verify payment';

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: 'VERIFICATION_ERROR',
      details: errorResponse,
    });
  }
});

// Webhook endpoint (for Chapa to send payment updates)
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const { tx_ref, status, chapa_reference } = req.body;
    const webhookSecret = req.headers['x-chapa-signature'] || req.headers['chapa-signature'];

    console.log('Webhook received:', { 
      tx_ref, 
      status, 
      chapa_reference,
      headers: req.headers,
      body: req.body 
    });

    // Optional: Verify webhook signature if secret hash is configured
    // const expectedSignature = crypto.createHmac('sha256', process.env.CHAPA_WEBHOOK_SECRET || '')
    //   .update(JSON.stringify(req.body))
    //   .digest('hex');
    // if (webhookSecret && webhookSecret !== expectedSignature) {
    //   return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    // }

    // Verify the payment
    if (tx_ref) {
      const verification = await chapa.verify({ tx_ref });
      console.log('Payment verified:', verification);

      const verificationData: any = verification.data || verification;
      const status = verificationData.status?.toLowerCase();

      // If payment is successful, send WhatsApp thank you message
      // Access phone_number from meta or directly (Chapa may store it in different places)
      const phoneNumber = verificationData.phone_number || verificationData.meta?.phone_number || req.body.phone_number;
      
      if ((status === "success" || status === "successful" || status === "completed") && phoneNumber) {
        try {
          const amount = verificationData.amount 
            ? (typeof verificationData.amount === 'string' 
                ? parseFloat(verificationData.amount) / 100 
                : verificationData.amount / 100)
            : 0;
          
          const thankYouMessage = generateThankYouMessage({
            customerName: verificationData.first_name && verificationData.last_name
              ? `${verificationData.first_name} ${verificationData.last_name}`
              : verificationData.first_name || verificationData.last_name,
            amount,
            currency: verificationData.currency || 'ETB',
            txRef: verificationData.tx_ref || tx_ref,
            eventTitle: verificationData.event_title || verificationData.meta?.event_title || req.body.event_title,
            quantity: verificationData.quantity || verificationData.meta?.quantity || req.body.quantity,
          });

          // Send WhatsApp message asynchronously (don't wait for it)
          sendWhatsAppMessage({
            to: phoneNumber,
            message: thankYouMessage,
            customerName: verificationData.first_name || verificationData.last_name,
          }).then((result) => {
            if (result.success) {
              console.log('✅ WhatsApp thank you message sent successfully via webhook:', result.messageId);
            } else {
              console.warn('⚠️  Failed to send WhatsApp message via webhook:', result.error);
            }
          }).catch((error) => {
            console.error('❌ Error sending WhatsApp message via webhook:', error);
          });
        } catch (error: any) {
          // Don't fail the webhook if WhatsApp sending fails
          console.error('Error preparing WhatsApp message in webhook:', error);
        }
      }

      // Here you can update your database, send emails, etc.
      // Example:
      // - Update payment status in database
      // - Send confirmation email to customer
      // - Update event registration
      // - Trigger other business logic
      
      // Note: Tickets are automatically saved to Supabase by the frontend
      // after successful payment verification on the PaymentSuccess page.
      // If you want to also save tickets server-side here, you would need to:
      // 1. Install @supabase/supabase-js in the server
      // 2. Set up Supabase client with service role key
      // 3. Call saveTicket service here when status is 'success'
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    // Still return 200 to prevent Chapa from retrying
    res.status(200).json({ 
      success: false, 
      message: error.message || 'Webhook processing failed' 
    });
  }
});

// Generate transaction reference
router.get('/generate-tx-ref', async (req: Request, res: Response) => {
  try {
    const tx_ref = await chapa.generateTransactionReference({
      prefix: 'YENEGE',
      size: 20,
    });

    res.json({
      success: true,
      tx_ref,
    });
  } catch (error: any) {
    console.error('Transaction reference generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate transaction reference',
    });
  }
});

// Send WhatsApp thank you message
router.post('/send-whatsapp-thankyou', async (req: Request, res: Response) => {
  try {
    const {
      phone_number,
      customer_name,
      amount,
      currency,
      tx_ref,
      event_title,
      quantity,
    } = req.body;

    // Validate required fields
    if (!phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    if (!amount || !currency || !tx_ref) {
      return res.status(400).json({
        success: false,
        message: 'Amount, currency, and transaction reference are required',
      });
    }

    // Generate thank you message
    const message = generateThankYouMessage({
      customerName: customer_name,
      amount: parseFloat(amount),
      currency,
      txRef: tx_ref,
      eventTitle: event_title,
      quantity: quantity ? parseInt(quantity, 10) : undefined,
    });

    // Send WhatsApp message
    const result = await sendWhatsAppMessage({
      to: phone_number,
      message,
      customerName: customer_name,
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'WhatsApp thank you message sent successfully',
        messageId: result.messageId,
      });
    } else {
      // Provide more detailed error information
      const errorMessage = result.error || 'Failed to send WhatsApp message';
      console.error('WhatsApp sending failed:', errorMessage);
      
      // Check if it's a configuration error
      if (errorMessage.includes('not configured') || errorMessage.includes('No WhatsApp provider')) {
        return res.status(500).json({
          success: false,
          message: errorMessage,
          error: 'CONFIGURATION_ERROR',
          hint: 'Please check your .env file in the server directory and ensure Twilio credentials are set. See WHATSAPP_SETUP.md for details.',
        });
      }
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'WHATSAPP_SEND_ERROR',
      });
    }
  } catch (error: any) {
    console.error('WhatsApp message sending error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send WhatsApp message',
      error: 'WHATSAPP_ERROR',
    });
  }
});

export default router;

