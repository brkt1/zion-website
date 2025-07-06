const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Winners/Rewards
router.get('/winners', authenticateUser, async (req, res) => {
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

module.exports = router;
