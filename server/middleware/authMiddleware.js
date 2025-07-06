const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('../../node_modules/@prisma/client');
require('dotenv').config({ path: '../.env' });

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (authError) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { authUserId: req.user.id },
      include: { profile: true }
    });

    if (!user || !user.profile || user.profile.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (adminError) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

module.exports = { authenticateUser, requireAdmin };
