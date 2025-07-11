const express = require('express');
const router = express.Router();
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');
const { logAdminActivity, requestPermission } = require('../middleware/activityLogger');
const { requirePermission } = require('../middleware/permissionMiddleware');

module.exports = function(pool) {
  // Get all winners
  router.get('/', authenticateUser, requireAdmin, async (req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT c.*, gt.name as game_type_name
        FROM certificates c
        LEFT JOIN game_types gt ON c.game_type_id = gt.id
        WHERE c.has_won_coffee = true OR c.has_won_prize = true
        ORDER BY c.timestamp DESC
      `);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch winners' });
    }
  });

  // Delete a winner entry
  router.delete('/:id', authenticateUser, requirePermission('can_manage_certificates'), requestPermission('DELETE_WINNER_ENTRY', 'certificates', (req) => req.params.id, (req) => ({ winnerId: req.params.id })), async (req, res) => {
    try {
      const { id } = req.params;
      const { rowCount } = await pool.query('DELETE FROM certificates WHERE id = $1;', [id]);
      if (rowCount === 0) {
        return res.status(404).json({ error: 'Winner entry not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete winner entry' });
    }
  });

  return router;
};
