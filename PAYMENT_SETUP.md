# Chapa Payment Integration Setup Guide

This guide will help you set up Chapa payment integration for your Yenege website.

## Prerequisites

1. **Chapa Account**: Sign up at [Chapa](https://chapa.co) and get your secret key
2. **Node.js**: Version 16 or higher
3. **Backend Server**: The payment integration requires a backend server

## Backend Setup

### 1. Navigate to the server directory

```bash
cd server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Chapa secret key:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CHAPA_SECRET_KEY=your-chapa-secret-key-here
```

### 4. Start the backend server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will run on `http://localhost:5000`

## Frontend Setup

### 1. Configure environment variables

Create a `.env` file in the root directory (if you don't have one):

```bash
cp env.example .env
```

Make sure your `.env` includes:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 2. Start the frontend

```bash
npm start
```

The frontend will run on `http://localhost:3000`

## How It Works

### Payment Flow

1. **User clicks "Reserve Your Spot"** on an event detail page
2. **Payment modal opens** - User fills in their details (name, email, phone)
3. **Frontend calls backend API** - `/api/payments/initialize`
4. **Backend initializes Chapa payment** - Returns checkout URL
5. **User is redirected to Chapa** - Completes payment on Chapa's secure page
6. **Chapa redirects back** - To `/payment/callback` with transaction reference
7. **Payment is verified** - Backend verifies payment status
8. **User sees success page** - Confirmation with transaction details

### API Endpoints

#### Initialize Payment
```
POST /api/payments/initialize
Body: {
  first_name: string,
  last_name: string,
  email: string,
  phone_number: string,
  currency: string (e.g., "ETB"),
  amount: string,
  event_id: string,
  event_title: string
}
```

#### Verify Payment
```
GET /api/payments/verify/:tx_ref
```

#### Webhook (for Chapa callbacks)
```
POST /api/payments/webhook
```

## Testing

### Test Mode

Chapa provides test credentials for development. Use these in your `.env`:

```env
CHAPA_SECRET_KEY=CHASECK_TEST-xxxxxxxxxxxxx
```

### Test Payment Flow

1. Go to an event detail page
2. Click "Reserve Your Spot"
3. Fill in the payment form
4. Use Chapa's test card numbers (check Chapa documentation)
5. Complete the payment
6. Verify you're redirected to the success page

## Production Deployment

### Backend

1. Set `NODE_ENV=production` in your `.env`
2. Set `FRONTEND_URL=https://yenege.com` (must use HTTPS)
3. **Use your production Chapa secret key** (starts with `CHASECK-`, NOT `CHASECK_TEST-`)
   - Get your production key from Chapa dashboard → Settings → API Keys
   - Production keys require HTTPS URLs
4. Deploy to your hosting provider (Heroku, AWS, DigitalOcean, etc.)

**Important:** 
- Production keys start with `CHASECK-` (not `CHASECK_TEST-`)
- Production keys require HTTPS URLs for callback and return URLs
- Frontend URL is set to `https://yenege.com` for production

### Frontend

1. Update `REACT_APP_API_URL` to your production backend URL
2. Build the frontend: `npm run build`
3. Deploy the build folder to your hosting provider

### Webhook Configuration

In your Chapa dashboard, configure the webhook URL:
```
https://your-backend-url.com/api/payments/webhook
```

## Features

✅ Initialize payments with Chapa
✅ Verify payment status
✅ Webhook support for payment updates
✅ Transaction reference generation
✅ Payment success/failure pages
✅ Error handling and user feedback

## Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify all dependencies are installed
- Check `.env` file exists and has correct values

### Payment initialization fails
- Verify Chapa secret key is correct
- Check backend server is running
- Verify API URL in frontend `.env` matches backend URL

### Payment verification fails
- Check transaction reference is correct
- Verify payment was actually completed
- Check Chapa dashboard for payment status

## Support

For Chapa-specific issues, refer to:
- [Chapa Documentation](https://developer.chapa.co)
- [Chapa Support](https://chapa.co/support)

For integration issues, check:
- Backend logs in terminal
- Browser console for frontend errors
- Network tab for API request/response details

