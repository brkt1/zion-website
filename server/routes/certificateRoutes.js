const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Certificates
router.get('/certificates', authenticateUser, async (req, res) => {
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

router.post('/certificates', authenticateUser, async (req, res) => {
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

module.exports = router;
