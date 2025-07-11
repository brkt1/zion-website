const express = require('express');
const pool = require('../db');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

// Scores
router.post('/', authenticateUser, async (req, res) => {
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
    
    const { rows } = await pool.query(`
      INSERT INTO scores (player_name, player_id, score, stage, session_id, streak, game_type_id, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `, [playerName, playerId, score, stage, sessionId, streak, gameTypeId, new Date()]);

    const newScore = rows[0];

    // Fetch the game_type_name for the response
    const { rows: gameTypeRows } = await pool.query('SELECT name FROM game_types WHERE id = $1', [newScore.game_type_id]);
    newScore.game_type_name = gameTypeRows[0].name;

    res.status(201).json(newScore);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create score' });
  }
});

module.exports = router;
