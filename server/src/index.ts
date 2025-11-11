import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import contentRoutes from './routes/content';
import paymentRoutes from './routes/payment';
import pushRoutes from './routes/push';
import telegramRoutes from './routes/telegram';
import { sendEventReminders } from './services/telegram';

// Load .env file from server directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const isProduction = process.env.NODE_ENV === 'production';

// Log environment status for debugging (without sensitive data)
console.log('📋 Environment check:');
console.log('  CHAPA_SECRET_KEY:', process.env.CHAPA_SECRET_KEY ? '✅ Set' : '❌ Not set');
console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set (using default)');
console.log('  PORT:', process.env.PORT || '5000 (default)');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('  WhatsApp Provider:', 
  process.env.WHATSAPP_ACCESS_TOKEN ? '✅ WhatsApp Business API (Meta - FREE)' :
  (process.env.TWILIO_API_KEY_SID || process.env.TWILIO_ACCOUNT_SID) ? 
    (process.env.TWILIO_MESSAGING_SERVICE_SID ? '✅ Twilio (Messaging Service)' : '✅ Twilio (WhatsApp Number)') :
  process.env.WHATSAPP_API_URL ? '✅ HTTP Service' :
  '⚠️  Not configured (messages will not be sent)');
console.log('  Telegram Bot:', process.env.TELEGRAM_BOT_TOKEN ? '✅ Configured' : '❌ Not configured');
if (process.env.WHATSAPP_ACCESS_TOKEN) {
  console.log('  Meta WhatsApp: ✅ Configured (Phone Number ID:', process.env.WHATSAPP_PHONE_NUMBER_ID ? 'Set' : 'Not set', ')');
} else if (process.env.TWILIO_API_KEY_SID || process.env.TWILIO_ACCOUNT_SID) {
  console.log('  Twilio Auth:', 
    process.env.TWILIO_API_KEY_SID ? '✅ API Key (Recommended)' :
    process.env.TWILIO_ACCOUNT_SID ? '✅ Account SID/Auth Token' :
    '❌ Not configured');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security: Trust proxy (important for Railway/Heroku/etc)
app.set('trust proxy', 1);

// Security: CORS configuration - Restrictive in production
// IMPORTANT: CORS must be configured BEFORE Helmet to ensure headers are set correctly
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://www.yenege.com',
  'https://yenege.com',
  // Always allow localhost for local development (even when server is in production)
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (health checks, server-to-server, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Always allow localhost origins for local development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      console.log(`✅ CORS: Allowing localhost origin: ${origin}`);
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS: Allowing origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      console.warn(`   Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error(`CORS: Origin ${origin} is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
  // Allow common headers that browsers might send in preflight requests
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

// Security: Helmet.js - Set security headers
// Configure Helmet to work with CORS
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow cross-origin requests
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Security: Rate limiting - General API rate limit
// IMPORTANT: Skip OPTIONS requests (CORS preflight) - they must always be allowed
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS', // Skip OPTIONS requests for CORS preflight
});

// Security: Rate limiting - Stricter for payment endpoints
// IMPORTANT: Skip OPTIONS requests (CORS preflight) - they must always be allowed
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 payment requests per windowMs
  message: 'Too many payment requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skip: (req) => req.method === 'OPTIONS', // Skip OPTIONS requests for CORS preflight
});

// Apply general rate limiting to all routes
app.use('/api', generalLimiter);

// Explicit OPTIONS handler for CORS preflight (fallback)
// This ensures preflight requests are always handled correctly
app.options('*', (req: express.Request, res: express.Response) => {
  const origin = req.headers.origin;
  
  // Check if origin is allowed
  if (!origin) {
    return res.status(204).end();
  }
  
  // Always allow localhost origins
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }
  
  // Check if origin is in allowed list
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }
  
  // Origin not allowed
  res.status(403).end();
});

// Security: Request size limits
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Limit URL-encoded payload size

// Security: Rate limiting for Telegram routes (stricter)
const telegramLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs (webhook can be called frequently)
  message: 'Too many requests to Telegram API, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS', // Skip OPTIONS requests
});

// Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/telegram', telegramLimiter, telegramRoutes);
app.use('/api', contentRoutes);

// Health check
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', message: 'Yenege Backend API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  // Track last reminder check date to prevent duplicates
  let lastReminderCheckDate: string | null = null;
  
  // Set up daily reminder check (runs once per day at 9:00 AM)
  // Check every hour and send reminders if it's 9 AM
  setInterval(async () => {
    const now = new Date();
    const hour = now.getHours();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Run at 9 AM (adjust timezone as needed) and only once per day
    if (hour === 9 && now.getMinutes() < 5 && lastReminderCheckDate !== today) {
      console.log('⏰ Running daily event reminder check...');
      lastReminderCheckDate = today; // Mark as checked for today
      try {
        const result = await sendEventReminders();
        console.log(`✅ Reminder check complete: ${result.sent} sent, ${result.failed} failed`);
        if (result.errors.length > 0) {
          console.error('❌ Reminder errors:', result.errors);
        }
      } catch (error) {
        console.error('❌ Error running reminder check:', error);
        // Reset on error so it can retry
        lastReminderCheckDate = null;
      }
    }
  }, 60 * 60 * 1000); // Check every hour
  
  // Also run immediately on startup (for testing/debugging)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧪 Running initial reminder check (dev mode)...');
    sendEventReminders().then(result => {
      console.log(`✅ Initial check: ${result.sent} sent, ${result.failed} failed`);
    }).catch(error => {
      console.error('❌ Initial check error:', error);
    });
  }
});

