# Payment Method Selection Feature

## Overview

The payment system now includes a payment method selection feature that allows users to choose their preferred payment method before being redirected to Chapa's checkout page.

## How It Works

### User Flow

1. **User clicks "Reserve Your Spot"** on an event detail page
2. **Step 1: Fill in personal details** (name, email, phone)
3. **Step 2: Select payment method** from available options
4. **Redirect to Chapa** - User completes payment on Chapa's secure checkout page

### Supported Payment Methods

Chapa supports the following payment methods in Ethiopia:

#### Mobile Money
- **Telebirr** - 1 to 75,000 ETB
- **CBE Birr** - 1 to 150,000 ETB
- **Awash Birr** - 1 to 600,000 ETB
- **M-Pesa** - 20 to 75,000 ETB

#### Bank Transfers
- **Awash Bank** - Unlimited
- **CBE Bank Transfer** - 1 to 9,999,999 ETB
- **COOP Bank** - 1 to 1,000,000 ETB
- **Enat Bank** - Unlimited (pay-in), up to 90,000 ETB (payout)
- **Amhara Bank** - Unlimited (pay-in), up to 100,000 ETB (payout)

#### Cards & International
- **Debit/Credit Card** - 10 to 500,000 ETB
- **PayPal** - 10 to 500,000 ETB

### Implementation Details

#### Frontend (`src/pages/EventDetail.tsx`)
- Two-step payment modal:
  1. Personal information form
  2. Payment method selection
- Payment methods are filtered based on transaction amount
- Selected payment method is sent to backend (for analytics/future use)

#### Backend (`server/src/routes/payment.ts`)
- Accepts `preferred_payment_method` parameter
- Currently logs the preference (can be used for analytics)
- Note: Chapa's API doesn't directly filter payment methods, but the selection helps users know what to expect

#### Payment Methods Data (`src/data/paymentMethods.ts`)
- Centralized list of all supported payment methods
- Includes limits and descriptions
- `getAvailablePaymentMethods(amount)` filters methods based on transaction amount

## Technical Notes

### Chapa API Behavior

Chapa's checkout page shows **all available payment methods** that are:
- Enabled in your Chapa account
- Compatible with the transaction amount
- Available for the user's location/currency

The payment method selection in our app:
- ✅ Improves UX by showing users what to expect
- ✅ Filters methods based on transaction limits
- ✅ Stores user preference for analytics
- ⚠️ Does NOT restrict Chapa's checkout page (Chapa shows all available methods)

### Future Enhancements

If Chapa adds API support for filtering payment methods:
1. Update the `initialize` call to include `payment_method` parameter
2. Chapa will then show only the selected method on checkout

## Usage

### For Users

1. Fill in your personal details
2. Select your preferred payment method
3. Click "Proceed to Checkout"
4. Complete payment on Chapa's secure page

### For Developers

To add a new payment method:

1. Update `src/data/paymentMethods.ts`:
```typescript
{
  id: 'new_method',
  name: 'New Payment Method',
  description: 'Description here',
  icon: '💳',
  minAmount: 1,
  maxAmount: 100000,
}
```

2. The method will automatically appear in the selection UI

## Benefits

1. **Better UX** - Users know what payment options are available
2. **Transparency** - Clear transaction limits for each method
3. **Analytics** - Track which payment methods users prefer
4. **Future-ready** - Ready for Chapa API enhancements

## References

- [Chapa Payment Methods Documentation](https://developer.chapa.co/payment-methods)
- [Chapa API Documentation](https://developer.chapa.co)

