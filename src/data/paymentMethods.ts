import { PaymentMethod } from '../types';

/**
 * Available payment methods supported by Chapa
 * These will be shown on Chapa's checkout page
 * International payment methods are listed first, followed by Ethiopian payment methods
 */
export const PAYMENT_METHODS: PaymentMethod[] = [
  // International payment methods (shown first)
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'International payments via PayPal',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg',
    minAmount: 10,
    maxAmount: 500000,
  },
  {
    id: 'card',
    name: 'Debit/Credit Card',
    description: 'Visa, Mastercard, and local bank cards',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.svg',
    minAmount: 10,
    maxAmount: 500000,
  },
  // Ethiopian payment methods
  {
    id: 'telebirr',
    name: 'Telebirr',
    description: 'Mobile money payment via Telebirr',
    icon: 'https://upload.wikimedia.org/wikipedia/en/a/a4/Telebirr.png',
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
    icon: 'https://addisfortune.news/wp-content/uploads/2022/02/Awash-birr.jpg',
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
    id: 'm_pesa',
    name: 'M-Pesa',
    description: 'Mobile money via M-Pesa (Safaricom)',
    icon: 'https://akaunting.com/public/assets/media/4-akaunting-inc/m-pesa/m-pesa-logo_1.png',
    minAmount: 20,
    maxAmount: 75000,
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

