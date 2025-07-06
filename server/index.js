const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('../node_modules/@prisma/client');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });


const initializeApp = (prisma, supabase) => {
  const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const profileRoutes = require('./routes/profileRoutes');
const gameTypeRoutes = require('./routes/gameTypeRoutes');
const cardRoutes = require('./routes/cardRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const questionRoutes = require('./routes/questionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const winnerRoutes = require('./routes/winnerRoutes');

app.use('/api', profileRoutes);
app.use('/api', gameTypeRoutes);
app.use('/api', cardRoutes);
app.use('/api', certificateRoutes);
app.use('/api', scoreRoutes);
app.use('/api', questionRoutes);
app.use('/api', adminRoutes);
app.use('/api', winnerRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

















// Error handling middleware
app.use((error, req, res) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

  return app;
};

module.exports = initializeApp;