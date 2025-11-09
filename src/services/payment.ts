import { PaymentRequest, PaymentResponse, PaymentVerification } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://yenege-backend.onrender.com/api';

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
    try {
      data = await response.json();
    } catch (parseError) {
      // If response is not JSON, create a generic error
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
    
    if (!response.ok) {
      // Create error with additional details
      const error: any = new Error(data.message || 'Failed to initialize payment');
      error.error = data.error;
      error.suggestion = data.suggestion;
      error.details = data.details;
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Payment initialization error:', error);
    // If it's already our custom error, just rethrow it
    if (error.error || error.suggestion) {
      throw error;
    }
    // Otherwise, wrap it in a generic error
    throw new Error(error.message || 'Failed to initialize payment. Please check your connection and try again.');
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

