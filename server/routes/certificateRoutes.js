const express = require('express');
const pool = require('../db');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

// Certificates
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, gt.name as game_type_name
      FROM certificates c
      LEFT JOIN game_types gt ON c.game_type_id = gt.id
      ORDER BY c.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

router.post('/', authenticateUser, async (req, res) => {
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
    
    const { rows } = await pool.query(`
      INSERT INTO certificates (player_name, player_id, score, game_type_id, session_id, has_won_coffee, has_won_prize, reward_type, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `, [playerName, playerId, score, gameTypeId, sessionId, hasWonCoffee, hasWonPrize, rewardType, new Date()]);

    const newCertificate = rows[0];

    // Fetch the game_type_name for the response
    const { rows: gameTypeRows } = await pool.query('SELECT name FROM game_types WHERE id = $1', [newCertificate.game_type_id]);
    newCertificate.game_type_name = gameTypeRows[0].name;

    res.status(201).json(newCertificate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create certificate' });
  }
});

module.exports = router;
