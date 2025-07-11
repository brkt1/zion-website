const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');

module.exports = (pool) => {
  const router = express.Router();

  // Profile endpoint
  router.get('/', authenticateUser, async (req, res) => {
    try {
      const userId = req.user.id;
      console.log('Profile Route: User ID from token:', userId);

      // Query profile by userId
      const { rows } = await pool.query('SELECT * FROM profiles WHERE id = $1', [userId]);
      let profile = rows[0];

      console.log('Profile Route: Profile found after SELECT query:', profile);
      console.log('Profile Route: Condition !profile (should trigger INSERT if true): ', !profile);

      // If profile not found, create it with default role USER
      if (!profile) {
        console.log('Profile Route: Attempting to insert new profile for userId:', userId);
        const { rows: newRows } = await pool.query(
          'INSERT INTO profiles (id, role) VALUES ($1::uuid, $2) RETURNING *',
          [userId, 'USER']
        );
        profile = newRows[0];
      }

      res.json(profile);
    } catch (error) {
      console.error('Profile fetch error:', error.message, error.stack);
      res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
    }
  });

  return router;
};
