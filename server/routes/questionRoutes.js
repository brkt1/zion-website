const express = require('express');
const pool = require('../db');

const router = express.Router();

// Questions
router.get('/:gameTypeId', async (req, res) => {
  try {
    const { gameTypeId } = req.params;
    const { difficulty, limit = 10 } = req.query;
    
    let query = 'SELECT * FROM questions WHERE game_type_id = $1';
    const params = [gameTypeId];

    if (difficulty) {
      query += ' AND difficulty = $2';
      params.push(parseInt(difficulty));
    }

    query += ` LIMIT ${parseInt(limit)}`;

    const { rows } = await pool.query(query, params);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

module.exports = router;
