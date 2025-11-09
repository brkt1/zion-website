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

export interface SendWhatsAppThankYouParams {
  phone_number: string;
  customer_name?: string;
  amount: number;
  currency: string;
  tx_ref: string;
  event_title?: string;
  quantity?: number;
}

export interface WhatsAppResponse {
  success: boolean;
  message?: string;
  error?: string;
  messageId?: string;
}

/**
 * Send WhatsApp thank you message after successful payment
 */
export const sendWhatsAppThankYou = async (
  params: SendWhatsAppThankYouParams
): Promise<WhatsAppResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/send-whatsapp-thankyou`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to send WhatsApp message',
      };
    }

    return {
      success: true,
      message: data.message,
      messageId: data.messageId,
    };
  } catch (error: any) {
    console.error('WhatsApp message sending error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send WhatsApp message',
    };
  }
};

