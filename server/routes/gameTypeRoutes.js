const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Game Types
router.get('/game-types', async (req, res) => {
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

module.exports = router;
