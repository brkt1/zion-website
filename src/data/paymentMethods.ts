import { PaymentMethod } from '../types';

/**
 * Available payment methods supported by Chapa
 * These will be shown on Chapa's checkout page
 */
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'telebirr',
    name: 'Telebirr',
    description: 'Mobile money payment via Telebirr',
    icon: '📱',
    minAmount: 1,
    maxAmount: 75000,
  },
  {
    id: 'cbe_birr',
    name: 'CBE Birr',
    description: 'Mobile money via Commercial Bank of Ethiopia',
    icon: '🏦',
    minAmount: 1,
    maxAmount: 150000,
  },
  {
    id: 'awash_birr',
    name: 'Awash Birr',
    description: 'Mobile money via Awash Bank',
    icon: '💳',
    minAmount: 1,
    maxAmount: 600000,
  },
  {
    id: 'awash_bank',
    name: 'Awash Bank',
    description: 'Direct bank transfer via Awash Bank',
    icon: '🏛️',
    minAmount: 1,
    maxAmount: -1, // Unlimited
  },
  {
    id: 'cbe_bank',
    name: 'CBE Bank Transfer',
    description: 'Bank transfer via Commercial Bank of Ethiopia',
    icon: '🏦',
    minAmount: 1,
    maxAmount: 9999999,
  },
  {
    id: 'coop_bank',
    name: 'COOP Bank',
    description: 'Cooperative Bank of Oromia',
    icon: '🏛️',
    minAmount: 1,
    maxAmount: 1000000,
  },
  {
    id: 'enat_bank',
    name: 'Enat Bank',
    description: 'Enat Bank transfer',
    icon: '🏛️',
    minAmount: 1,
    maxAmount: -1, // Unlimited
  },
  {
    id: 'amhara_bank',
    name: 'Amhara Bank',
    description: 'Amhara Bank transfer',
    icon: '🏛️',
    minAmount: 1,
    maxAmount: -1, // Unlimited
  },
  {
    id: 'card',
    name: 'Debit/Credit Card',
    description: 'Visa, Mastercard, and local bank cards',
    icon: '💳',
    minAmount: 10,
    maxAmount: 500000,
  },
  {
    id: 'm_pesa',
    name: 'M-Pesa',
    description: 'Mobile money via M-Pesa (Safaricom)',
    icon: '📱',
    minAmount: 20,
    maxAmount: 75000,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'International payments via PayPal',
    icon: '🌐',
    minAmount: 10,
    maxAmount: 500000,
  },
];

/**
 * Get payment methods available for a given amount
 */
export const getAvailablePaymentMethods = (amount: number): PaymentMethod[] => {
  return PAYMENT_METHODS.filter((method) => {
    if (method.minAmount && amount < method.minAmount) return false;
    if (method.maxAmount && method.maxAmount > 0 && amount > method.maxAmount) return false;
    return true;
  });
};

