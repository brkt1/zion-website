# Yenege Backend Server

Backend API server for Yenege website with Chapa payment integration.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Add your Chapa secret key to `.env`:
```
CHAPA_SECRET_KEY=your-chapa-secret-key-here
FRONTEND_URL=http://localhost:3000  # For development
# For production, use: FRONTEND_URL=https://yenege.com
```

4. Set up ngrok for local development (required for Chapa payments):
   - Sign up at https://dashboard.ngrok.com/signup
   - Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
   - Run: `ngrok config add-authtoken YOUR_AUTHTOKEN`
   - Start ngrok: `npm run ngrok` (or `./start-ngrok.sh`)
   - The script will automatically update `FRONTEND_URL` in your `.env` file
   
   See [NGROK_SETUP.md](./NGROK_SETUP.md) for detailed instructions.

5. Run in development mode:
```bash
npm run dev
```

6. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Check if server is running

### Payment Endpoints
- `POST /api/payments/initialize` - Initialize a payment
- `GET /api/payments/verify/:tx_ref` - Verify a payment
- `POST /api/payments/webhook` - Webhook for payment updates
- `GET /api/payments/generate-tx-ref` - Generate transaction reference

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend application URL
- `CHAPA_SECRET_KEY` - Your Chapa secret key
- `VAPID_PUBLIC_KEY` - VAPID public key for Web Push (generate with `node scripts/generate-vapid-keys.js`)
- `VAPID_PRIVATE_KEY` - VAPID private key for Web Push (keep secret!)
- `VAPID_SUBJECT` - VAPID subject (e.g., `mailto:admin@yenege.com`)
- `SUPABASE_URL` - Supabase project URL (for push subscriptions)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for backend operations)
- `TELEGRAM_BOT_TOKEN` - Telegram bot token (for Telegram bot features)
- `TELEGRAM_ADMIN_API_TOKEN` - Admin API token for protecting admin endpoints (generate with `openssl rand -hex 32`)
- `TELEGRAM_ADMIN_USER_IDS` - Comma-separated list of Telegram user IDs with admin access (get from @userinfobot)

## Push Notifications Setup

1. Generate VAPID keys:
```bash
node scripts/generate-vapid-keys.js
```

2. Add the generated keys to your `.env` file

3. Create the push_subscriptions table in Supabase (see `docs/scripts/create-push-subscriptions-table.sql`)

4. Users will automatically subscribe when they install the PWA and grant notification permission

## API Endpoints

### Health Check
- `GET /api/health` - Check if server is running

### Payment Endpoints
- `POST /api/payments/initialize` - Initialize a payment
- `GET /api/payments/verify/:tx_ref` - Verify a payment
- `POST /api/payments/webhook` - Webhook for payment updates
- `GET /api/payments/generate-tx-ref` - Generate transaction reference

### Push Notification Endpoints
- `GET /api/push/vapid-public-key` - Get VAPID public key
- `POST /api/push/subscribe` - Subscribe to push notifications
- `POST /api/push/unsubscribe` - Unsubscribe from push notifications
- `POST /api/push/send` - Send push notification to all subscribers

### Telegram Bot Endpoints
- `POST /api/telegram/webhook` - Webhook for Telegram bot updates
- `GET /api/telegram/info` - Get bot information
- `POST /api/telegram/set-webhook` - Set webhook URL
- `POST /api/telegram/delete-webhook` - Delete webhook
- `POST /api/telegram/send-message` - Send message to specific chat
- `POST /api/telegram/broadcast` - Broadcast message to all subscribers

See [TELEGRAM_BOT_SETUP.md](../docs/TELEGRAM_BOT_SETUP.md) for detailed setup instructions.

