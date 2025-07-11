const express = require('express');
const pool = require('../db');
const { authenticateUser, requireSuperAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', authenticateUser, requireSuperAdmin, async (req, res) => {
  try {
    // Example: Fetch all users with their roles
    const { rows: allUsers } = await pool.query(`
      SELECT u.id, u.email, p.role
      FROM auth.users u
      LEFT JOIN public.profiles p ON u.id = p.id
      ORDER BY u.created_at DESC
    `);

    // Example: Count of users by role
    const { rows: roleCounts } = await pool.query(`
      SELECT role, COUNT(*) as count
      FROM public.profiles
      GROUP BY role
    `);

    res.json({
      message: 'Welcome to the Super Admin Dashboard!',
      allUsers: allUsers,
      roleCounts: roleCounts,
      // Add more super admin specific data here
    });
  } catch (error) {
    console.error('Super Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to load Super Admin dashboard' });
  }
});

// Add more super admin specific routes here (e.g., change user roles, manage system settings)

module.exports = router;
