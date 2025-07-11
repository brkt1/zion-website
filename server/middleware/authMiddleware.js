const pool = require('../db');
const jwt = require('jsonwebtoken');

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const SUPABASE_JWT_SECRET = 'BGub9TfYwmTYBP3zZRUHJfdQLXGTY2BbyAPPUSKTuUDyiFx9UMXnMNh3Y+nY9W5BNyfsE9WoCczJWAWnaTyxjw==';

    if (!SUPABASE_JWT_SECRET) {
      console.error('SUPABASE_JWT_SECRET is not defined');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    console.log('Token received:', token);
    console.log('Using secret (first 5 chars):', SUPABASE_JWT_SECRET.substring(0, 5));
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET);
    console.log('Decoded JWT:', decoded);
    req.user = { id: decoded.sub };
    next();
  } catch (authError) {
    console.error('Authentication error:', authError);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    console.log('User ID for admin check:', req.user.id);
    const { rows } = await pool.query('SELECT role FROM profiles WHERE id = $1', [req.user.id]);
    console.log('Profile query result (rows):', rows);
    const profile = rows[0];

    if (!profile) {
      return res.status(500).json({ error: 'Error fetching user profile' });
    }

    if (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Admin or Super Admin access required' });
    }

    next();
  } catch (adminError) {
    console.error('Authorization check failed:', adminError);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

const requireSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { rows } = await pool.query('SELECT role FROM profiles WHERE id = $1', [req.user.id]);
    const profile = rows[0];

    if (!profile || profile.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Super Admin access required' });
    }

    next();
  } catch (superAdminError) {
    console.error('Super Admin authorization check failed:', superAdminError);
    res.status(500).json({ error: 'Super Admin authorization check failed' });
  }
};

module.exports = { authenticateUser, requireAdmin, requireSuperAdmin };
