import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import contentRoutes from './routes/content';
import paymentRoutes from './routes/payment';

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
  // Development origins
  ...(isProduction ? [] : ['http://localhost:3000', 'http://localhost:3001']),
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // In production, block requests with no origin (except for health checks)
    if (!origin) {
      if (isProduction) {
        return callback(new Error('CORS: Origin header required in production'));
      }
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error(`CORS: Origin ${origin} is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Security: Rate limiting - Stricter for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 payment requests per windowMs
  message: 'Too many payment requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Apply general rate limiting to all routes
app.use('/api', generalLimiter);

// Security: Request size limits
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Limit URL-encoded payload size

// Routes
app.use('/api/payments', paymentRoutes);
app.use('/api', contentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Yenege Backend API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

