const express = require('express');
const router = express.Router();
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');

module.exports = function(pool) {
  // Get all unused cards
  router.get('/', authenticateUser, async (req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT c.*, gt.name as game_type_name
        FROM cards c
        LEFT JOIN game_types gt ON c.game_type_id = gt.id
        WHERE c.used = false
        ORDER BY c.created_at DESC
      `);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch cards' });
    }
  });

  // Create a new card
  router.post('/', authenticateUser, requireAdmin, async (req, res) => {
    try {
      const { content, duration, gameTypeId, cardNumber } = req.body;
      const { rows } = await pool.query(`
        INSERT INTO cards (content, duration, game_type_id, card_number)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `, [content, duration, gameTypeId, cardNumber]);

      const newCard = rows[0];

      // Fetch the game_type_name for the response
      const { rows: gameTypeRows } = await pool.query('SELECT name FROM game_types WHERE id = $1', [newCard.game_type_id]);
      newCard.game_type_name = gameTypeRows[0].name;

      res.status(201).json(newCard);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create card' });
    }
  });

  // Mark a card as used
  router.patch('/:id/use', authenticateUser, async (req, res) => {
    try {
      const { id } = req.params;
      const { rows } = await pool.query(`
        UPDATE cards
        SET used = true
        WHERE id = $1
        RETURNING *;
      `, [id]);

      const updatedCard = rows[0];

      // Fetch the game_type_name for the response
      const { rows: gameTypeRows } = await pool.query('SELECT name FROM game_types WHERE id = $1', [updatedCard.game_type_id]);
      updatedCard.game_type_name = gameTypeRows[0].name;

      res.json(updatedCard);
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark card as used' });
    }
  });

  return router;
};
