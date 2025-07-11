const express = require('express');
const pool = require('../db');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');
const { logAdminActivity, requestPermission } = require('../middleware/activityLogger');
const { requirePermission } = require('../middleware/permissionMiddleware');

const router = express.Router();

// Certificates
router.get('/', authenticateUser, requireAdmin, async (req, res) => {
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

router.post('/', authenticateUser, requireAdmin, logAdminActivity('CREATED_CERTIFICATE', null, (req) => ({ playerId: req.body.playerId, gameTypeId: req.body.gameTypeId })), async (req, res) => {
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

router.delete('/:id', authenticateUser, requirePermission('can_manage_certificates'), requestPermission('DELETE_CERTIFICATE', 'certificates', (req) => req.params.id, (req) => ({ certificateId: req.params.id })), async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM certificates WHERE id = $1;', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete certificate' });
  }
});

module.exports = router;
