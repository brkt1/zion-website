const express = require('express');
const pool = require('../db');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');
const { logAdminActivity, requestPermission } = require('../middleware/activityLogger');
const { requirePermission } = require('../middleware/permissionMiddleware');

const router = express.Router();

// Game Types
router.get('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM game_types');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game types' });
  }
});

router.post('/', authenticateUser, requireAdmin, logAdminActivity('CREATED_GAME_TYPE', null, (req) => ({ name: req.body.name })), async (req, res) => {
  try {
    const { name } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO game_types (name) VALUES ($1) RETURNING *;',
      [name]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create game type' });
  }
});

router.delete('/:id', authenticateUser, requirePermission('can_manage_game_types'), requestPermission('DELETE_GAME_TYPE', 'game_types', (req) => req.params.id, (req) => ({ gameTypeId: req.params.id })), async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM game_types WHERE id = $1;', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Game type not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete game type' });
  }
});

module.exports = router;
