import express, { Request, Response } from 'express';
import chapa from '../services/chapa';

const router = express.Router();

interface InitializePaymentRequest {
  first_name?: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  currency: string;
  amount: string;
  tx_ref: string;
  callback_url?: string;
  return_url?: string;
  event_id?: string;
  event_title?: string;
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
      tx_ref,
      callback_url,
      return_url,
      event_id,
      event_title,
    }: InitializePaymentRequest = req.body;

    // Validate required fields (tx_ref is optional, will be generated if not provided)
    if (!email || !currency || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, currency, amount',
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
    const returnUrl = return_url || `${baseUrl}/payment/success?tx_ref=${encodeURIComponent(transactionRef)}`;

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
    // Note: Chapa may require HTTPS URLs for production keys
    // For localhost development, consider using a test key (CHASECK_TEST-)
    // or a public URL service like ngrok
    try {
      // Prepare payment data - ensure amount is a string (Chapa expects string)
      const paymentData: any = {
        first_name: first_name || 'Customer',
        last_name: last_name || '',
        email,
        currency: currency.toUpperCase(), // Ensure uppercase (ETB, USD, etc.)
        amount: String(amount), // Ensure it's a string
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

      const isTestKey = process.env.CHAPA_SECRET_KEY?.startsWith('CHASECK_TEST-');
      const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');

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
    const verificationData = response.data || response;
    
    console.log('Verification data:', JSON.stringify(verificationData, null, 2));

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

      // Here you can update your database, send emails, etc.
      // Example:
      // - Update payment status in database
      // - Send confirmation email to customer
      // - Update event registration
      // - Trigger other business logic
      
      // TODO: Add your business logic here based on verification.data.status
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

export default router;

