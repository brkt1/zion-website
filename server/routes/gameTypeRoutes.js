const express = require('express');
const pool = require('../db');

const router = express.Router();

// Game Types
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM game_types');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game types' });
  }
});

module.exports = router;
