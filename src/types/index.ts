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
  quantity?: number; // Number of tickets
  tx_ref?: string;
  event_id?: string;
  event_title?: string;
  preferred_payment_method?: string; // Optional: preferred payment method
  commission_seller_id?: string; // Optional: commission seller who sold the ticket
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

// Ticket types
export interface Ticket {
  id: string;
  tx_ref: string;
  event_id?: string;
  event_title?: string;
  customer_name?: string;
  customer_email: string;
  customer_phone?: string;
  amount: number;
  currency: string;
  quantity: number;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  chapa_reference?: string;
  commission_seller_id?: string;
  commission_seller_name?: string;
  qr_code_data?: {
    tx_ref: string;
    amount: number;
    currency: string;
    date: string;
    status: string;
    reference: string;
    quantity: number;
    email: string;
    name: string;
  };
  payment_date?: string;
  verified_at?: string;
  verified_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketData {
  tx_ref: string;
  event_id?: string;
  event_title?: string;
  customer_name?: string;
  customer_email: string;
  customer_phone?: string;
  amount: number;
  currency: string;
  quantity: number;
  status?: 'pending' | 'success' | 'failed' | 'cancelled';
  chapa_reference?: string;
  commission_seller_id?: string;
  commission_seller_name?: string;
  qr_code_data?: {
    tx_ref: string;
    amount: number;
    currency: string;
    date: string;
    status: string;
    reference: string;
    quantity: number;
    email: string;
    name: string;
  };
  payment_date?: string;
}

// Reminder types
export interface Reminder {
  id: string;
  ticket_id?: string;
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
  reminder_date: string;
  reminder_time?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_by?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateReminderData {
  ticket_id?: string;
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
  reminder_date: string;
  reminder_time?: string;
  notes?: string;
}

// Commission Seller types
export interface CommissionSeller {
  id: string;
  name: string;
  email: string;
  phone?: string;
  commission_rate: number;
  commission_type: 'percentage' | 'fixed';
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCommissionSellerData {
  name: string;
  email: string;
  phone?: string;
  commission_rate: number;
  commission_type: 'percentage' | 'fixed';
  is_active?: boolean;
  notes?: string;
}

export interface UpdateCommissionSellerData {
  name?: string;
  email?: string;
  phone?: string;
  commission_rate?: number;
  commission_type?: 'percentage' | 'fixed';
  is_active?: boolean;
  notes?: string;
}
