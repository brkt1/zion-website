const express = require('express');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');
const { logAdminActivity, requestPermission } = require('../middleware/activityLogger');
const { requirePermission } = require('../middleware/permissionMiddleware');

module.exports = (pool) => {
  const router = express.Router();

  // Profile endpoint
  router.get('/', authenticateUser, async (req, res) => {
    try {
      const userId = req.user.id;
      

      // Query profile by userId
      const { rows } = await pool.query('SELECT * FROM profiles WHERE id = $1', [userId]);
      let profile = rows[0];

      
      

      // If profile not found, create it with default role USER
      if (!profile) {
        
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

  // Admin: Get all profiles
  router.get('/all', authenticateUser, requireAdmin, async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT * FROM profiles');
      res.json(rows);
    } catch (error) {
      console.error('Failed to fetch all profiles:', error.message);
      res.status(500).json({ error: 'Failed to fetch all profiles' });
    }
  });

  // Admin: Update a user's profile
  router.patch('/:id', authenticateUser, requireAdmin, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Fetch old profile for logging
      const { rows: oldProfileRows } = await pool.query('SELECT role FROM profiles WHERE id = $1', [id]);
      const oldRole = oldProfileRows[0]?.role;

      const { rows } = await pool.query(
        'UPDATE profiles SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING *;',
        [role, id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      // Log the activity
      logAdminActivity('UPDATED_USER_ROLE', id, { oldRole, newRole: role })(req, res, () => {});

      res.json(rows[0]);
    } catch (error) {
      console.error('Failed to update profile:', error.message);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Admin: Request to delete a profile
  router.delete('/:id', authenticateUser, requirePermission('can_manage_profiles'), requestPermission('DELETE_PROFILE', 'profiles', (req) => req.params.id, (req) => ({ profileId: req.params.id })), async (req, res) => {
    try {
      const { id } = req.params;
      const { rowCount } = await pool.query('DELETE FROM profiles WHERE id = $1;', [id]);
      if (rowCount === 0) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete profile' });
    }
  });

  // Get user permissions
  router.get('/permissions', authenticateUser, async (req, res) => {
    try {
      const userId = req.user.id;
      const { rows } = await pool.query(`
        SELECT p.name
        FROM permissions p
        JOIN profile_permissions pp ON p.id = pp.permission_id
        WHERE pp.profile_id = $1;
      `, [userId]);
      res.json(rows.map(row => row.name));
    } catch (error) {
      console.error('Failed to fetch user permissions:', error);
      res.status(500).json({ error: 'Failed to fetch user permissions' });
    }
  });

  return router;
};
