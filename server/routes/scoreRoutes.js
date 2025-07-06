const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Scores
router.post('/scores', authenticateUser, async (req, res) => {
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

module.exports = router;
