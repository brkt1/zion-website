import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import contentRoutes from './routes/content';
import paymentRoutes from './routes/payment';

// Load .env file from server directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Log environment status for debugging
console.log('📋 Environment check:');
console.log('  CHAPA_SECRET_KEY:', process.env.CHAPA_SECRET_KEY ? '✅ Set (' + process.env.CHAPA_SECRET_KEY.substring(0, 20) + '...)' : '❌ Not set');
console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set (using default)');
console.log('  PORT:', process.env.PORT || '5000 (default)');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

