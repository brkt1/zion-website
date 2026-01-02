# Chapa Payment Integration - Complete Documentation

## Overview

This project uses **Chapa** as the payment gateway for processing event ticket payments. Chapa is an Ethiopian payment gateway that supports multiple payment methods including mobile money (Telebirr, CBE Birr, Awash Birr), bank transfers, and international cards.

## What We Use

### 1. **Chapa Node.js SDK**
- **Package**: `chapa-nodejs` (version ^1.0.0)
- **Location**: `server/src/services/chapa.ts`
- **Purpose**: Server-side Chapa API integration

### 2. **Payment Methods Supported**
Chapa supports multiple payment methods (defined in `src/data/paymentMethods.ts`):
- **International**: PayPal, Debit/Credit Cards (Visa, Mastercard)
- **Ethiopian Mobile Money**: Telebirr, CBE Birr, Awash Birr, M-Pesa
- **Bank Transfers**: Awash Bank, CBE Bank, COOP Bank, Enat Bank, Amhara Bank

## How We Use Chapa

### Architecture Overview

```
Frontend (React) → Backend (Express) → Chapa API
     ↓                    ↓                ↓
  HTML Form          Initialize      Payment Page
  Submission         Payment          (Hosted)
     ↓                    ↓                ↓
  Redirect to      Generate tx_ref    User Pays
  Chapa Page       & Checkout URL     ↓
     ↓                    ↓          Redirect
  Payment          Webhook/Callback  Back to App
  Success Page     Verification      Success Page
```

### 1. **Frontend Integration** (`src/services/payment.ts`)

#### HTML Checkout Method (Primary)
- **Function**: `submitChapaHTMLCheckout()`
- **How it works**:
  1. Creates a hidden HTML form dynamically
  2. Sets form action to `https://api.chapa.co/v1/hosted/pay`
  3. Adds all payment data as hidden form fields
  4. Submits form immediately (instant redirect to Chapa)
  
- **Advantages**:
  - No server round-trip needed
  - Instant redirect
  - Faster user experience
  - Works with cached public key

#### Public Key Caching
- **Function**: `getChapaPublicKey()`
- **Caching Strategy**:
  - Stores public key in `localStorage` with 24-hour expiry
  - Falls back to server API if cache expired
  - Uses expired cache if server timeout (for offline scenarios)

#### API Initialization Method (Fallback)
- **Function**: `initializePayment()`
- **When used**: If HTML checkout fails (e.g., public key endpoint unavailable)
- **Flow**: Frontend → Backend API → Chapa API → Returns checkout URL

### 2. **Backend Integration** (`server/src/routes/payment.ts`)

#### Payment Initialization Endpoint
**Route**: `POST /api/payments/initialize`

**Request Body**:
```typescript
{
  first_name?: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  currency: string;        // e.g., "ETB", "USD"
  amount: string;          // Base currency (e.g., "50.00")
  quantity?: number;
  tx_ref: string;          // Transaction reference
  callback_url?: string;    // Webhook URL
  return_url?: string;      // Redirect URL after payment
  event_id?: string;
  event_title?: string;
  commission_seller_id?: string;
}
```

**Process**:
1. Validates required fields (email, currency, amount)
2. Generates transaction reference if not provided (prefix: "YENEGE", size: 20)
3. Builds callback and return URLs
4. Sanitizes event title for Chapa (max 16 chars, alphanumeric only)
5. Calls `chapa.initialize()` with payment data
6. Returns checkout URL

**Customization**:
- Title: Event title (truncated to 16 chars, sanitized)
- Description: "Payment for [event title]"
- Both sanitized to only allow: letters, numbers, hyphens, underscores, spaces, dots

#### Payment Verification Endpoint
**Route**: `GET /api/payments/verify/:tx_ref`

**Process**:
1. Verifies payment using Chapa API
2. Handles both library method and direct HTTP fallback
3. On success:
   - Sends WhatsApp thank you message (if phone number available)
   - Notifies admins via Telegram
   - Returns verification data

**Response**:
```typescript
{
  success: boolean;
  data: {
    status: string;        // "success", "failed", "pending"
    amount: number;        // May be in cents or base currency
    currency: string;
    tx_ref: string;
    reference: string;     // Chapa reference
    email: string;
    phone_number?: string;
    first_name?: string;
    last_name?: string;
    created_at: string;
    // ... other Chapa fields
  };
}
```

#### Webhook Endpoint
**Route**: `POST /api/payments/webhook`

**Purpose**: Receives payment status updates from Chapa

**Process**:
1. Receives webhook from Chapa with payment status
2. Verifies payment using `tx_ref`
3. On successful payment:
   - Sends WhatsApp thank you message
   - Notifies admins via Telegram
4. Always returns 200 (to prevent Chapa retries)

**Note**: Webhook signature verification is commented out (can be enabled with `CHAPA_WEBHOOK_SECRET`)

#### Public Key Endpoint
**Route**: `GET /api/payments/public-key`

**Purpose**: Returns Chapa public key for HTML checkout

**Response**:
```typescript
{
  success: boolean;
  publicKey: string;
}
```

### 3. **Payment Flow**

#### Step-by-Step Flow

1. **User clicks "Pay" on Event Detail page**
   - Form validation (reCAPTCHA v3)
   - Calculate total amount (with discounts)
   - Generate transaction reference: `YENEGE-[timestamp]-[random]`

2. **Frontend Payment Initiation**
   - Try HTML checkout first:
     - Get public key (from cache or API)
     - Create form with payment data
     - Submit form → Instant redirect to Chapa
   - Fallback to API initialization if HTML checkout fails

3. **User on Chapa Payment Page**
   - Sees all available payment methods
   - Chooses payment method (Telebirr, Card, Bank, etc.)
   - Completes payment

4. **Chapa Redirects Back**
   - **Return URL**: `/payment/success?tx_ref=...&event_id=...&quantity=...`
   - **Callback URL**: `/payment/callback` (webhook)

5. **Payment Verification** (`PaymentSuccess.tsx`)
   - Extracts `tx_ref` from URL params
   - Calls `/api/payments/verify/:tx_ref`
   - Retries up to 3 times if pending
   - On success:
     - Saves ticket to Supabase database
     - Displays ticket with QR code
     - Sends WhatsApp message (if phone available)

6. **Ticket Storage**
   - Saved to `tickets` table in Supabase
   - Includes: `tx_ref`, `chapa_reference`, amount, quantity, customer info, QR code data

### 4. **Transaction Reference Generation**

**Format**: `PREFIX-TIMESTAMP-RANDOM`

**Example**: `YENEGE-K1X2Y3Z4-A5B6C7D8`

**Implementation**:
- Frontend: `generateTransactionReference()` in `src/services/payment.ts`
- Backend: `chapa.generateTransactionReference()` (fallback)

**Prefix**: "YENEGE"
**Size**: 20 characters total

### 5. **Error Handling**

#### Rate Limiting
- Detects 429 status code
- Extracts retry time from response
- Shows countdown timer to user
- Returns `RATE_LIMIT_EXCEEDED` error

#### Validation Errors
- Detects field-specific validation errors
- Returns formatted error messages
- Shows user-friendly alerts

#### API Key Errors
- Validates key format (should start with `CHASECK_`)
- Warns if using test key in production
- Warns if using production key with localhost

#### URL Validation
- Ensures HTTPS URLs for production keys
- Validates callback and return URLs
- Warns about localhost with production keys

### 6. **Data Sanitization**

**Chapa Requirements**:
- Title: Max 16 characters
- Title & Description: Only letters, numbers, hyphens, underscores, spaces, dots

**Sanitization Functions**:
- `sanitizeChapaText()`: Removes invalid characters
- `isValidChapaText()`: Validates allowed characters only

### 7. **Amount Handling**

**Chapa API Behavior**:
- May return amounts in cents or base currency
- Detection logic:
  - If amount >= 1000 and is integer → likely cents (divide by 100)
  - Otherwise → base currency (use as is)

**Implementation**:
- Backend: Divides by 100 if amount >= 100
- Frontend: Smart detection based on value size

### 8. **Environment Variables**

#### Required
```bash
CHAPA_SECRET_KEY=CHASECK-xxxxx  # Secret key from Chapa dashboard
```

#### Optional
```bash
CHAPA_PUBLIC_KEY=xxxxx          # Public key for HTML checkout (optional, can be fetched)
CHAPA_WEBHOOK_SECRET=xxxxx      # For webhook signature verification (optional)
FRONTEND_URL=https://...        # For building callback/return URLs
```

#### Key Types
- **Test Key**: Starts with `CHASECK_TEST-`
- **Production Key**: Starts with `CHASECK-` (not TEST)

### 9. **Database Schema**

**Tickets Table** (`docs/scripts/supabase-schema.sql`):
```sql
chapa_reference TEXT  -- Stores Chapa's payment reference
```

**Usage**:
- Stored when ticket is saved after successful payment
- Displayed in admin dashboard
- Shown in scanner dashboard for verification

### 10. **Integration Points**

#### Event Detail Page (`src/pages/EventDetail.tsx`)
- Payment form with customer details
- Pre-fetches Chapa public key when modal opens
- Handles payment submission
- Error handling and user feedback

#### Payment Success Page (`src/pages/PaymentSuccess.tsx`)
- Verifies payment on load
- Displays ticket with QR code
- Saves ticket to database
- Sends WhatsApp thank you message
- Download ticket as image

#### Admin Dashboard (`src/pages/admin/Dashboard.tsx`)
- Displays `chapa_reference` for each ticket
- Shows payment status

#### Scanner Dashboard (`src/pages/admin/ScannerDashboard.tsx`)
- Shows `chapa_reference` for ticket verification

### 11. **Notifications**

#### WhatsApp Thank You Message
- Sent automatically after successful payment
- Includes: customer name, amount, currency, tx_ref, event title, quantity
- Sent from both:
  - Backend verification endpoint
  - Backend webhook endpoint
  - Frontend PaymentSuccess page (backup)

#### Telegram Admin Notifications
- Sent to all configured admin users
- Includes: customer details, payment amount, event info, transaction reference

### 12. **Security Features**

1. **reCAPTCHA v3**: Prevents bot submissions
2. **Transaction Reference**: Unique per payment
3. **Webhook Verification**: Can verify signatures (optional)
4. **HTTPS Required**: Production keys require HTTPS URLs
5. **Input Sanitization**: All user inputs sanitized before sending to Chapa

### 13. **Testing**

#### Test Mode
- Use test keys (`CHASECK_TEST-...`)
- Test payments won't charge real money
- Can test full flow without real transactions

#### Test Scripts
- `npm run test-chapa`: Test Chapa key configuration
- `npm run test-payment`: Test payment initialization

### 14. **Troubleshooting**

#### Common Issues

1. **"Invalid Chapa API Key"**
   - Check `CHAPA_SECRET_KEY` is set correctly
   - Verify key format (should start with `CHASECK_`)
   - Ensure account is active in Chapa dashboard

2. **"Public key endpoint not found"**
   - Server may need restart
   - Check `CHAPA_PUBLIC_KEY` is set (or endpoint is available)

3. **"Rate limit exceeded"**
   - Too many requests in short time
   - Wait for retry time shown
   - Implement request throttling

4. **"URL validation error"**
   - Production keys require HTTPS
   - Check `FRONTEND_URL` is set correctly
   - Ensure callback/return URLs are absolute

5. **Payment verification fails**
   - Payment may still be processing
   - Check `tx_ref` is correct
   - Verify Chapa account status

### 15. **Best Practices**

1. **Always use HTTPS in production**
2. **Cache public key** to reduce API calls
3. **Handle rate limits gracefully**
4. **Sanitize all user inputs** before sending to Chapa
5. **Store `chapa_reference`** for payment tracking
6. **Implement retry logic** for pending payments
7. **Log all payment events** for debugging
8. **Test with test keys** before going live

### 16. **API Endpoints Summary**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/payments/initialize` | POST | Initialize payment, get checkout URL |
| `/api/payments/verify/:tx_ref` | GET | Verify payment status |
| `/api/payments/webhook` | POST | Receive payment updates from Chapa |
| `/api/payments/public-key` | GET | Get public key for HTML checkout |
| `/api/payments/generate-tx-ref` | GET | Generate transaction reference |
| `/api/payments/send-whatsapp-thankyou` | POST | Send WhatsApp thank you message |

### 17. **Files Involved**

**Backend**:
- `server/src/services/chapa.ts` - Chapa SDK initialization
- `server/src/routes/payment.ts` - Payment API routes

**Frontend**:
- `src/services/payment.ts` - Payment service functions
- `src/pages/EventDetail.tsx` - Payment form and submission
- `src/pages/PaymentSuccess.tsx` - Payment verification and ticket display
- `src/data/paymentMethods.ts` - Supported payment methods list

**Types**:
- `src/types/index.ts` - Payment-related TypeScript types

**Database**:
- `docs/scripts/supabase-schema.sql` - Database schema with `chapa_reference` field

## Summary

Chapa payment integration is fully implemented with:
- ✅ HTML checkout (primary, instant redirect)
- ✅ API initialization (fallback)
- ✅ Payment verification
- ✅ Webhook support
- ✅ Public key caching
- ✅ Error handling
- ✅ WhatsApp notifications
- ✅ Telegram admin notifications
- ✅ Ticket storage with QR codes
- ✅ Multiple payment methods support
- ✅ Security features (reCAPTCHA, sanitization)
- ✅ Comprehensive error handling

The integration supports both test and production environments, with proper validation, error handling, and user feedback throughout the payment flow.




