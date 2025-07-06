const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Questions
router.get('/questions/:gameTypeId', async (req, res) => {
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

module.exports = router;
