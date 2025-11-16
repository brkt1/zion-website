import { PaymentRequest, PaymentResponse, PaymentVerification } from '../types';

// Generate transaction reference on frontend to avoid server round-trip
// Format: PREFIX-TIMESTAMP-RANDOM (e.g., YENEGE-K1X2Y3Z4-A5B6C7D8)
export const generateTransactionReference = (prefix: string = 'YENEGE', size: number = 20): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2).toUpperCase();
  const remainingSize = Math.max(0, size - prefix.length - 1);
  const randomPart = randomStr.substring(0, remainingSize);
  return `${prefix}-${timestamp}${randomPart}`.substring(0, prefix.length + 1 + size);
};

// Production API URL - always used in production
const PRODUCTION_API_URL = 'https://zion-website-yy1v.onrender.com/api';

// Get API URL - always use production URL in production, otherwise use env or fallback
const getApiBaseUrl = () => {
  // Always use production URL in production builds
  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_API_URL;
  }
  
  // In development, check if we're on a production domain (deployed preview, etc.)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If not localhost, assume production environment
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.')) {
      return PRODUCTION_API_URL;
    }
  }
  
  // In development on localhost, use env variable or fallback to production
  const envUrl = process.env.REACT_APP_API_URL;
  
  // Check if the env URL is a placeholder or invalid
  if (!envUrl || envUrl.includes('your-backend-url')) {
    return PRODUCTION_API_URL;
  }
  
  // Use env URL if it's valid
  return envUrl;
};

const API_BASE_URL = getApiBaseUrl();

if (!API_BASE_URL) {
  throw new Error(
    'Missing API configuration. Please set REACT_APP_API_URL environment variable.'
  );
}

export const initializePayment = async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    let data;
    const responseText = await response.text();
    
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      // If response is not JSON, create a generic error with the raw text
      const error: any = new Error(
        responseText || `Server error: ${response.status} ${response.statusText || 'Unknown error'}`
      );
      error.error = 'PARSE_ERROR';
      error.status = response.status;
      error.statusText = response.statusText;
      throw error;
    }
    
    if (!response.ok) {
      // Extract error message from various possible locations
      const errorMessage = 
        data.message || 
        data.error?.message || 
        data.details?.message ||
        (typeof data.error === 'string' ? data.error : null) ||
        `Failed to initialize payment (${response.status})`;
      
      // Create error with additional details
      const error: any = new Error(errorMessage);
      error.error = data.error?.code || data.error || 'PAYMENT_ERROR';
      error.suggestion = data.suggestion || data.error?.suggestion;
      error.details = data.details || data.error?.details || data;
      error.retryAfter = data.retryAfter || data.error?.retryAfter;
      error.status = response.status;
      error.statusText = response.statusText;
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Payment initialization error:', error);
    console.error('Error details:', {
      message: error.message,
      error: error.error,
      status: error.status,
      details: error.details,
    });
    
    // If it's already our custom error with proper structure, just rethrow it
    if (error.error || error.suggestion || error.status) {
      throw error;
    }
    
    // Otherwise, wrap it in a generic error with more context
    const errorMessage = error.message || 
      (error.toString && error.toString() !== '[object Object]' ? error.toString() : null) ||
      'Failed to initialize payment. Please check your connection and try again.';
    
    const wrappedError: any = new Error(errorMessage);
    wrappedError.error = 'NETWORK_ERROR';
    wrappedError.originalError = error;
    throw wrappedError;
  }
};

export const verifyPayment = async (txRef: string): Promise<PaymentVerification> => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/verify/${txRef}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify payment');
    }

    return data;
  } catch (error: any) {
    console.error('Payment verification error:', error);
    throw error;
  }
};

export const generateTxRef = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/generate-tx-ref`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to generate transaction reference');
    }

    return data.tx_ref;
  } catch (error: any) {
    console.error('Transaction reference generation error:', error);
    throw error;
  }
};

// Get Chapa public key for HTML checkout
export const getChapaPublicKey = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/public-key`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Handle non-JSON responses (like 404 HTML pages)
    const responseText = await response.text();
    let data;
    
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      // If response is not JSON (likely a 404 HTML page), provide helpful error
      if (response.status === 404) {
        throw new Error(
          'Public key endpoint not found. The server may need to be restarted with the latest code. ' +
          'Please contact support or try again later.'
        );
      }
      throw new Error(`Server error: ${response.status} ${response.statusText || 'Unknown error'}`);
    }
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get Chapa public key');
    }

    if (!data.publicKey) {
      throw new Error('Public key not found in server response');
    }

    return data.publicKey;
  } catch (error: any) {
    console.error('Public key retrieval error:', error);
    // Re-throw with more context
    if (error.message) {
      throw error;
    }
    throw new Error('Failed to retrieve Chapa public key. Please ensure the server is running and configured correctly.');
  }
};

// Submit payment using Chapa HTML checkout form
export const submitChapaHTMLCheckout = async (paymentData: {
  publicKey: string;
  txRef: string;
  amount: string;
  currency: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  title?: string;
  description?: string;
  callback_url?: string;
  return_url?: string;
  meta?: Record<string, any>;
}) => {
  // Create a form element
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://api.chapa.co/v1/hosted/pay';
  form.style.display = 'none';

  // Add all required fields
  const fields: Record<string, string> = {
    public_key: paymentData.publicKey,
    tx_ref: paymentData.txRef,
    amount: paymentData.amount,
    currency: paymentData.currency,
    email: paymentData.email,
  };

  // Add optional fields
  if (paymentData.first_name) fields.first_name = paymentData.first_name;
  if (paymentData.last_name) fields.last_name = paymentData.last_name;
  if (paymentData.phone_number) fields.phone_number = paymentData.phone_number;
  if (paymentData.title) fields.title = paymentData.title;
  if (paymentData.description) fields.description = paymentData.description;
  if (paymentData.callback_url) fields.callback_url = paymentData.callback_url;
  if (paymentData.return_url) fields.return_url = paymentData.return_url;

  // Add meta fields (if any)
  if (paymentData.meta) {
    Object.entries(paymentData.meta).forEach(([key, value]) => {
      fields[`meta[${key}]`] = String(value);
    });
  }

  // Create input fields
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  // Append form to body and submit
  document.body.appendChild(form);
  form.submit();
};

