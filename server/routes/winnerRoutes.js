const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');

module.exports = function(pool) {
  // Get all winners
  router.get('/', authenticateUser, async (req, res) => {
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

  return router;
};
