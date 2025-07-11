const express = require('express');
const pool = require('../db');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');
const { logAdminActivity, requestPermission } = require('../middleware/activityLogger');
const { requirePermission } = require('../middleware/permissionMiddleware');

const router = express.Router();

// Scores
router.post('/', authenticateUser, requireAdmin, logAdminActivity('CREATED_SCORE', null, (req) => ({ playerId: req.body.playerId, gameTypeId: req.body.gameTypeId, score: req.body.score })), async (req, res) => {
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

router.get('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM scores ORDER BY timestamp DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

router.delete('/:id', authenticateUser, requirePermission('can_manage_scores'), requestPermission('DELETE_SCORE', 'scores', (req) => req.params.id, (req) => ({ scoreId: req.params.id })), async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM scores WHERE id = $1;', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Score not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete score' });
  }
});

// Get game result by session and player ID (accessible by anyone)
router.get('/result', async (req, res) => {
  try {
    const { sessionId, playerId } = req.query;

    if (!sessionId || !playerId) {
      return res.status(400).json({ error: 'Session ID and Player ID are required.' });
    }

    const { rows } = await pool.query(`
      SELECT
        s.player_name,
        s.player_id,
        s.score,
        gt.name AS game_type,
        s.timestamp
      FROM scores s
      JOIN game_types gt ON s.game_type_id = gt.id
      WHERE s.session_id = $1 AND s.player_id = $2
      ORDER BY s.timestamp DESC
      LIMIT 1;
    `, [sessionId, playerId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Game result not found.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Failed to fetch game result:', error);
    res.status(500).json({ error: 'Failed to fetch game result' });
  }
});

module.exports = router;
