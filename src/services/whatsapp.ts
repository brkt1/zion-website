const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://zion-website-yy1v.onrender.com/api';

if (!API_BASE_URL) {
  throw new Error(
    'Missing API configuration. Please set REACT_APP_API_URL environment variable.'
  );
}

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

