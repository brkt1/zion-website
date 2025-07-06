const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Cards
router.get('/cards', authenticateUser, async (req, res) => {
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

router.post('/cards', authenticateUser, requireAdmin, async (req, res) => {
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

router.patch('/cards/:id/use', authenticateUser, async (req, res) => {
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

module.exports = router;
