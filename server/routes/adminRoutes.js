const express = require('express');
const pool = require('../db');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin Routes
router.get('/users', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.*, p.role
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      ORDER BY u.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/cafe-owners', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // This is a placeholder for creating a user in your auth system.
    // You will need to replace this with your actual user creation logic.
    const newUser = { id: 'new-user-id', email };

    const { rows: userRows } = await pool.query(`
      INSERT INTO users (email, auth_user_id)
      VALUES ($1, $2)
      RETURNING *;
    `, [email, newUser.id]);

    const user = userRows[0];

    const { rows: profileRows } = await pool.query(`
      INSERT INTO profiles (user_id, role)
      VALUES ($1, $2)
      RETURNING *;
    `, [user.id, 'CAFE_OWNER']);

    const profile = profileRows[0];

    const { rows: cafeOwnerRows } = await pool.query(`
      INSERT INTO cafe_owners (name, email, user_id)
      VALUES ($1, $2, $3)
      RETURNING *;
    `, [name, email, user.id]);

    const cafeOwner = cafeOwnerRows[0];
    
    res.status(201).json({ user: { ...user, profile }, cafeOwner });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create cafe owner' });
  }
});

router.get('/dashboard', authenticateUser, requireAdmin, async (req, res) => {
  try {
    // Fetch total users
    const { rowCount: totalUsers } = await pool.query('SELECT id FROM auth.users');

    // Fetch user roles
    const { rows: userRoles } = await pool.query(`
      SELECT u.email, p.role, u.id as userId
      FROM auth.users u
      LEFT JOIN public.profiles p ON u.id = p.id
    `);

    // Construct dashboard data
    const dashboardData = {
      totalUsers: totalUsers,
      activeSessions: 0, // Placeholder for now
      recentActivities: [], // Placeholder for now
      userRoles: userRoles.map(user => ({
        userId: user.userId,
        email: user.email,
        role: user.role || 'USER' // Default to USER if role is null
      })),
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to load admin dashboard' });
  }
});

module.exports = router;
