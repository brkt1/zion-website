const express = require('express');
const cors = require('cors');
const pool = require('./db');


require('dotenv').config({ path: '/media/becky/fbb95933-6bf3-476c-ad04-81ce8356b618/yenege/zion-website/.env' });

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);


const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
const profileRoutes = require('./routes/profileRoutes')(pool);
const gameTypeRoutes = require('./routes/gameTypeRoutes');
const cardRoutes = require('./routes/cardRoutes')(pool);
const certificateRoutes = require('./routes/certificateRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const questionRoutes = require('./routes/questionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const winnerRoutes = require('./routes/winnerRoutes')(pool);

app.use('/api/profile', profileRoutes);
app.use('/api/gametypes', gameTypeRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/winners', winnerRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
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

module.exports = app;

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});