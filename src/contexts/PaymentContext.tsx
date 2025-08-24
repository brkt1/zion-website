import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../supabaseClient';

interface PaymentMethod {
  id: string;
  type: 'telebirr' | 'cbe' | 'card' | 'wallet';
  name: string;
  icon: string;
  isAvailable: boolean;
}

interface PaymentTransaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id: string;
  created_at: string;
  completed_at?: string;
  game_session_id?: string;
  cafe_id?: string;
  description: string;
}

interface PaymentContextType {
  paymentMethods: PaymentMethod[];
  currentTransaction: PaymentTransaction | null;
  isProcessing: boolean;
  initiatePayment: (amount: number, method: string, description: string) => Promise<PaymentTransaction>;
  verifyPayment: (transactionId: string) => Promise<boolean>;
  getPaymentHistory: () => Promise<PaymentTransaction[]>;
  refundPayment: (transactionId: string, reason: string) => Promise<boolean>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

interface PaymentProviderProps {
  children: ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'telebirr',
      name: 'Telebirr',
      icon: '📱',
      isAvailable: true
    },
    {
      id: '2',
      type: 'cbe',
      name: 'CBE Birr',
      icon: '🏦',
      isAvailable: true
    },
    {
      id: '3',
      type: 'card',
      name: 'Credit/Debit Card',
      icon: '💳',
      isAvailable: true
    },
    {
      id: '4',
      type: 'wallet',
      name: 'Digital Wallet',
      icon: '👛',
      isAvailable: true
    }
  ]);

  const [currentTransaction, setCurrentTransaction] = useState<PaymentTransaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const initiatePayment = async (amount: number, method: string, description: string): Promise<PaymentTransaction> => {
    try {
      setIsProcessing(true);

      // Create payment transaction record
      const transaction: Omit<PaymentTransaction, 'id' | 'transaction_id' | 'completed_at'> = {
        user_id: '', // Will be set from auth context
        amount,
        currency: 'ETB',
        payment_method: method,
        status: 'pending',
        created_at: new Date().toISOString(),
        description
      };

      const { data, error } = await supabase
        .from('payment_transactions')
        .insert([transaction])
        .select()
        .single();

      if (error) throw error;

      // Generate unique transaction ID
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Update with transaction ID
      const { data: updatedTransaction, error: updateError } = await supabase
        .from('payment_transactions')
        .update({ transaction_id: transactionId })
        .eq('id', data.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setCurrentTransaction(updatedTransaction);

      // Simulate payment processing based on method
      switch (method) {
        case 'telebirr':
          await simulateTelebirrPayment(updatedTransaction);
          break;
        case 'cbe':
          await simulateCBEPayment(updatedTransaction);
          break;
        case 'card':
          await simulateCardPayment(updatedTransaction);
          break;
        case 'wallet':
          await simulateWalletPayment(updatedTransaction);
          break;
        default:
          throw new Error('Unsupported payment method');
      }

      return updatedTransaction;
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateTelebirrPayment = async (transaction: PaymentTransaction) => {
    // Simulate Telebirr payment flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update transaction status
    const { error } = await supabase
      .from('payment_transactions')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', transaction.id);

    if (error) throw error;
    
    setCurrentTransaction(prev => prev ? { ...prev, status: 'completed' } : null);
  };

  const simulateCBEPayment = async (transaction: PaymentTransaction) => {
    // Simulate CBE payment flow
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const { error } = await supabase
      .from('payment_transactions')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', transaction.id);

    if (error) throw error;
    
    setCurrentTransaction(prev => prev ? { ...prev, status: 'completed' } : null);
  };

  const simulateCardPayment = async (transaction: PaymentTransaction) => {
    // Simulate card payment flow
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const { error } = await supabase
      .from('payment_transactions')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', transaction.id);

    if (error) throw error;
    
    setCurrentTransaction(prev => prev ? { ...prev, status: 'completed' } : null);
  };

  const simulateWalletPayment = async (transaction: PaymentTransaction) => {
    // Simulate wallet payment flow
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const { error } = await supabase
      .from('payment_transactions')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', transaction.id);

    if (error) throw error;
    
    setCurrentTransaction(prev => prev ? { ...prev, status: 'completed' } : null);
  };

  const verifyPayment = async (transactionId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('status')
        .eq('transaction_id', transactionId)
        .single();

      if (error) throw error;

      return data.status === 'completed';
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  };

  const getPaymentHistory = async (): Promise<PaymentTransaction[]> => {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  };

  const refundPayment = async (transactionId: string, reason: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('payment_transactions')
        .update({ 
          status: 'refunded',
          description: `${reason} - Refunded`
        })
        .eq('transaction_id', transactionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error refunding payment:', error);
      return false;
    }
  };

  const value: PaymentContextType = {
    paymentMethods,
    currentTransaction,
    isProcessing,
    initiatePayment,
    verifyPayment,
    getPaymentHistory,
    refundPayment
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};
