const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('../node_modules/@prisma/client');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Admin middleware
const requireAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { authUserId: req.user.id },
      include: { profile: true }
    });

    if (!user || !user.profile || user.profile.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Profile endpoint
app.get('/api/profile', authenticateUser, async (req, res) => {
  try {
    // First, find or create user in our database
    let user = await prisma.user.findUnique({
      where: { authUserId: req.user.id },
      include: { profile: true }
    });

    if (!user) {
      // Create user and profile if they don't exist
      user = await prisma.user.create({
        data: {
          email: req.user.email,
          authUserId: req.user.id,
          profile: {
            create: {
              role: 'USER'
            }
          }
        },
        include: { profile: true }
      });
    } else if (!user.profile) {
      // Create profile if user exists but profile doesn't
      await prisma.profile.create({
        data: {
          userId: user.id,
          role: 'USER'
        }
      });
      
      // Refetch user with profile
      user = await prisma.user.findUnique({
        where: { authUserId: req.user.id },
        include: { profile: true }
      });
    }

    res.json(user.profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Game Types
app.get('/api/game-types', async (req, res) => {
  try {
    const gameTypes = await prisma.gameType.findMany({
      include: {
        _count: {
          select: {
            cards: true,
            questions: true,
            scores: true
          }
        }
      }
    });
    res.json(gameTypes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game types' });
  }
});

// Cards
app.get('/api/cards', authenticateUser, async (req, res) => {
  try {
    const cards = await prisma.card.findMany({
      where: { used: false },
      include: {
        gameType: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

app.post('/api/cards', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { content, duration, gameTypeId, cardNumber } = req.body;
    
    const card = await prisma.card.create({
      data: {
        content,
        duration,
        gameTypeId,
        cardNumber
      },
      include: {
        gameType: {
          select: { name: true }
        }
      }
    });
    
    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create card' });
  }
});

app.patch('/api/cards/:id/use', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    const card = await prisma.card.update({
      where: { id },
      data: { used: true },
      include: {
        gameType: {
          select: { name: true }
        }
      }
    });
    
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark card as used' });
  }
});

// Certificates
app.get('/api/certificates', authenticateUser, async (req, res) => {
  try {
    const certificates = await prisma.certificate.findMany({
      include: {
        gameType: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

app.post('/api/certificates', authenticateUser, async (req, res) => {
  try {
    const { 
      playerName, 
      playerId, 
      score, 
      gameTypeId, 
      sessionId,
      hasWonCoffee = false,
      hasWonPrize = false,
      rewardType = null
    } = req.body;
    
    const certificate = await prisma.certificate.create({
      data: {
        playerName,
        playerId,
        score,
        gameTypeId,
        sessionId,
        hasWonCoffee,
        hasWonPrize,
        rewardType,
        timestamp: new Date()
      },
      include: {
        gameType: {
          select: { name: true }
        }
      }
    });
    
    res.status(201).json(certificate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create certificate' });
  }
});

// Scores
app.post('/api/scores', authenticateUser, async (req, res) => {
  try {
    const { 
      playerName, 
      playerId, 
      score, 
      stage, 
      sessionId, 
      streak, 
      gameTypeId 
    } = req.body;
    
    const scoreRecord = await prisma.score.create({
      data: {
        playerName,
        playerId,
        score,
        stage,
        sessionId,
        streak,
        gameTypeId,
        timestamp: new Date()
      },
      include: {
        gameType: {
          select: { name: true }
        }
      }
    });
    
    res.status(201).json(scoreRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create score' });
  }
});

// Questions
app.get('/api/questions/:gameTypeId', async (req, res) => {
  try {
    const { gameTypeId } = req.params;
    const { difficulty, limit = 10 } = req.query;
    
    const where = { gameTypeId };
    if (difficulty) {
      where.difficulty = parseInt(difficulty);
    }
    
    const questions = await prisma.question.findMany({
      where,
      take: parseInt(limit),
      orderBy: { id: 'asc' }
    });
    
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Admin Routes
app.get('/api/admin/users', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: {
          select: { role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/admin/cafe-owners', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (authError) {
      return res.status(400).json({ error: authError.message });
    }
    
    // Create user and profile in database
    const user = await prisma.user.create({
      data: {
        email,
        authUserId: authData.user.id,
        profile: {
          create: {
            role: 'CAFE_OWNER'
          }
        }
      },
      include: {
        profile: true
      }
    });
    
    // Create cafe owner record
    const cafeOwner = await prisma.cafeOwner.create({
      data: {
        name,
        email,
        password: 'managed_by_supabase' // Password is managed by Supabase
      }
    });
    
    console.log('POST /api/admin/cafe-owners response:', { user, cafeOwner });
    res.status(201).json({ user, cafeOwner });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create cafe owner' });
  }
});

// Winners/Rewards
app.get('/api/winners', authenticateUser, async (req, res) => {
  try {
    const winners = await prisma.certificate.findMany({
      where: {
        OR: [
          { hasWonCoffee: true },
          { hasWonPrize: true }
        ]
      },
      include: {
        gameType: {
          select: { name: true }
        }
      },
      orderBy: { timestamp: 'desc' }
    });
    res.json(winners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch winners' });
  }
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

module.exports = { app, prisma, supabase };
