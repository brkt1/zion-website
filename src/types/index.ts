export interface TimeDisplayProps {
  remainingTime: number;
}

// Payment types
export interface PaymentRequest {
  first_name?: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  currency: string;
  amount: string;
  tx_ref?: string;
  event_id?: string;
  event_title?: string;
  preferred_payment_method?: string; // Optional: preferred payment method
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaymentResponse {
  success: boolean;
  data?: {
    checkout_url: string;
    tx_ref: string;
    message: string;
    status: string;
  };
  message?: string;
  error?: string;
  suggestion?: string;
}

export interface PaymentVerification {
  success: boolean;
  data?: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    currency: string;
    amount: string;
    charge: string;
    mode: string;
    method: string;
    type: string;
    status: string;
    reference: string;
    tx_ref: string;
    created_at: Date;
    updated_at: Date;
  };
  message?: string;
}
